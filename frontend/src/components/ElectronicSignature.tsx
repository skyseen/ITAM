import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react';
import SignatureCanvas from 'react-signature-canvas';

interface DocumentField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'date' | 'checkbox';
  required: boolean;
  value?: string;
}

interface DocumentTemplate {
  id: number;
  document_type: string;
  template_name: string;
  template_content: string;
  fields_schema: DocumentField[];
}

interface ElectronicSignatureProps {
  assetId: number;
  documentType: string;
  onSigningComplete: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const ElectronicSignature: React.FC<ElectronicSignatureProps> = ({
  assetId,
  documentType,
  onSigningComplete,
  isOpen,
  onClose,
}) => {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [template, setTemplate] = useState<DocumentTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const toast = useToast();

  const bgGradient = useColorModeValue(
    'linear(to-br, purple.900, blue.800, teal.700)',
    'linear(to-br, gray.900, purple.900, blue.900)'
  );

  useEffect(() => {
    if (isOpen && documentType) {
      fetchDocumentTemplate();
    }
  }, [isOpen, documentType]);

  const fetchDocumentTemplate = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/documents/templates/${documentType}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (response.ok) {
        const templateData = await response.json();
        setTemplate(templateData);
        
        // Initialize form data with default values
        const initialData: Record<string, any> = {};
        templateData.fields_schema.forEach((field: DocumentField) => {
          initialData[field.name] = field.value || '';
        });
        setFormData(initialData);
      } else {
        console.error('Failed to fetch template:', await response.text());
        toast({
          title: 'Error',
          description: 'Failed to load document template',
          status: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      toast({
        title: 'Error',
        description: 'Failed to load document template',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  const handleSubmit = async () => {
    if (!template) return;

    // Validate required fields
    const missingFields = template.fields_schema
      .filter(field => field.required && !formData[field.name])
      .map(field => field.label);

    if (missingFields.length > 0) {
      toast({
        title: 'Missing Required Fields',
        description: `Please fill in: ${missingFields.join(', ')}`,
        status: 'warning',
        duration: 5000,
      });
      return;
    }

    // Check if signature exists
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      toast({
        title: 'Signature Required',
        description: 'Please provide your signature',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    if (!agreementChecked) {
      toast({
        title: 'Agreement Required',
        description: 'Please confirm you agree to the terms',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const signatureData = signatureRef.current.toDataURL();
      
      const response = await fetch('http://localhost:8000/api/documents/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          asset_id: assetId,
          document_type: documentType,
          form_data: formData,
          signature: signatureData,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Document Signed Successfully',
          description: 'Your electronic signature has been recorded',
          status: 'success',
          duration: 3000,
        });
        onSigningComplete();
        onClose();
      } else {
        throw new Error('Failed to sign document');
      }
    } catch (error) {
      toast({
        title: 'Signing Failed',
        description: 'Failed to sign document. Please try again.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormField = (field: DocumentField) => {
    switch (field.type) {
      case 'checkbox':
        return (
          <Checkbox
            key={field.name}
            isChecked={formData[field.name] || false}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(field.name, e.target.checked)}
            colorScheme="blue"
            color="white"
          >
            <Text color="white">{field.label}</Text>
          </Checkbox>
        );
      
      case 'date':
        return (
          <FormControl key={field.name} isRequired={field.required}>
            <FormLabel color="white" fontWeight="semibold">
              {field.label}
            </FormLabel>
            <Input
              type="date"
              value={formData[field.name] || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(field.name, e.target.value)}
              bg="rgba(255, 255, 255, 0.1)"
              border="1px solid rgba(255, 255, 255, 0.2)"
              color="white"
              _focus={{ borderColor: 'blue.300' }}
            />
          </FormControl>
        );
      
      default:
        return (
          <FormControl key={field.name} isRequired={field.required}>
            <FormLabel color="white" fontWeight="semibold">
              {field.label}
            </FormLabel>
            <Input
              type={field.type}
              value={formData[field.name] || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(field.name, e.target.value)}
              bg="rgba(255, 255, 255, 0.1)"
              border="1px solid rgba(255, 255, 255, 0.2)"
              color="white"
              _placeholder={{ color: 'gray.400' }}
              _focus={{ borderColor: 'blue.300' }}
            />
          </FormControl>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" closeOnOverlayClick={false}>
      <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(10px)" />
      <ModalContent
        bg="transparent"
        boxShadow="none"
        maxW="90vw"
        maxH="90vh"
        overflow="hidden"
      >
        <Box
          bgGradient={bgGradient}
          borderRadius="20px"
          border="1px solid rgba(255, 255, 255, 0.1)"
          overflow="hidden"
        >
          <ModalHeader
            bg="rgba(255, 255, 255, 0.1)"
            backdropFilter="blur(10px)"
            borderBottom="1px solid rgba(255, 255, 255, 0.1)"
          >
            <Heading size="lg" color="white">
              📝 Electronic Document Signing
            </Heading>
            <Text color="gray.200" fontSize="md" mt={2}>
              {template?.template_name || 'Loading document...'}
            </Text>
          </ModalHeader>
          
          <ModalCloseButton color="white" />
          
          <ModalBody p={6} maxH="70vh" overflowY="auto">
            {template ? (
              <VStack spacing={6} align="stretch">
                {/* Document Content */}
                <Card
                  bg="rgba(255, 255, 255, 0.1)"
                  backdropFilter="blur(10px)"
                  borderRadius="20px"
                  border="1px solid rgba(255, 255, 255, 0.1)"
                >
                  <CardHeader>
                    <Heading size="md" color="white">Document Information</Heading>
                  </CardHeader>
                  <CardBody>
                    <div
                      dangerouslySetInnerHTML={{ __html: template.template_content }}
                      style={{ color: 'white' }}
                    />
                  </CardBody>
                </Card>

                {/* Form Fields */}
                <Card
                  bg="rgba(255, 255, 255, 0.1)"
                  backdropFilter="blur(10px)"
                  borderRadius="20px"
                  border="1px solid rgba(255, 255, 255, 0.1)"
                >
                  <CardHeader>
                    <Heading size="md" color="white">Required Information</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      {template.fields_schema.map(renderFormField)}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Signature Section */}
                <Card
                  bg="rgba(255, 255, 255, 0.1)"
                  backdropFilter="blur(10px)"
                  borderRadius="20px"
                  border="1px solid rgba(255, 255, 255, 0.1)"
                >
                  <CardHeader>
                    <Heading size="md" color="white">Electronic Signature</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4}>
                      <Box
                        border="2px solid rgba(255, 255, 255, 0.3)"
                        borderRadius="md"
                        bg="white"
                        p={2}
                      >
                        <SignatureCanvas
                          ref={signatureRef}
                          canvasProps={{
                            width: 500,
                            height: 200,
                            className: 'signature-canvas'
                          }}
                        />
                      </Box>
                      <Button
                        onClick={clearSignature}
                        variant="outline"
                        size="sm"
                        color="white"
                        borderColor="rgba(255, 255, 255, 0.3)"
                      >
                        Clear Signature
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Agreement */}
                <Alert
                  status="info"
                  bg="rgba(6, 182, 212, 0.15)"
                  border="1px solid rgba(6, 182, 212, 0.3)"
                  borderRadius="md"
                >
                  <AlertIcon color="cyan.300" />
                  <VStack align="start" spacing={2}>
                    <Text color="white" fontWeight="bold">
                      Electronic Signature Agreement
                    </Text>
                                         <Checkbox
                       isChecked={agreementChecked}
                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgreementChecked(e.target.checked)}
                       colorScheme="cyan"
                    >
                      <Text color="gray.200" fontSize="sm">
                        I agree that my electronic signature has the same legal effect as a handwritten signature
                      </Text>
                    </Checkbox>
                  </VStack>
                </Alert>
              </VStack>
            ) : (
              <Text color="white" textAlign="center">Loading document template...</Text>
            )}
          </ModalBody>

          <ModalFooter
            bg="rgba(255, 255, 255, 0.1)"
            backdropFilter="blur(10px)"
            borderTop="1px solid rgba(255, 255, 255, 0.1)"
          >
            <HStack spacing={4}>
              <Button
                variant="outline"
                onClick={onClose}
                color="white"
                borderColor="rgba(255, 255, 255, 0.3)"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                isLoading={isLoading}
                loadingText="Signing..."
                bg="rgba(59, 130, 246, 0.8)"
                color="white"
                _hover={{ bg: 'rgba(59, 130, 246, 1)' }}
                isDisabled={!template}
              >
                ✍️ Sign Document
              </Button>
            </HStack>
          </ModalFooter>
        </Box>
      </ModalContent>
    </Modal>
  );
};

export default ElectronicSignature; 