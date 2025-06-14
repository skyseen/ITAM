import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  FormControl,
  FormLabel,
  Select,
  Alert,
  AlertIcon,
  Progress,
  Badge,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import ElectronicSignature from './ElectronicSignature';

interface AssetIssuanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: number;
  assetName: string;
  onIssuanceComplete: () => void;
}

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
}

interface DocumentRequirement {
  type: string;
  name: string;
  required: boolean;
  signed: boolean;
}

const AssetIssuanceModal: React.FC<AssetIssuanceModalProps> = ({
  isOpen,
  onClose,
  assetId,
  assetName,
  onIssuanceComplete,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [documentRequirements, setDocumentRequirements] = useState<DocumentRequirement[]>([
    { type: 'declaration_form', name: 'Declaration Form for Holding Company IT Asset', required: true, signed: false },
    { type: 'it_orientation', name: 'IT Orientation Acknowledgment Form', required: true, signed: false },
    { type: 'handover_form', name: 'Equipment Takeover/Handover Form', required: true, signed: false },
  ]);
  const [currentDocumentType, setCurrentDocumentType] = useState<string | null>(null);
  const [isSigningModalOpen, setIsSigningModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const bgGradient = useColorModeValue(
    'linear(to-br, purple.900, blue.800, teal.700)',
    'linear(to-br, gray.900, purple.900, blue.900)'
  );

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const userData = await response.json();
        setUsers(userData);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load users',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const initiateDocumentSigning = async () => {
    if (!selectedUserId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/documents/initiate/${assetId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          document_types: documentRequirements.map(doc => doc.type),
          target_user_id: selectedUserId,
        }),
      });

      if (response.ok) {
        setCurrentStep(2);
        toast({
          title: 'Document Signing Initiated',
          description: 'User can now sign the required documents',
          status: 'success',
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initiate document signing',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentSigning = (documentType: string) => {
    setCurrentDocumentType(documentType);
    setIsSigningModalOpen(true);
  };

  const handleSigningComplete = () => {
    if (currentDocumentType) {
      setDocumentRequirements(prev =>
        prev.map(doc =>
          doc.type === currentDocumentType
            ? { ...doc, signed: true }
            : doc
        )
      );
    }
    setIsSigningModalOpen(false);
    setCurrentDocumentType(null);

    // Check if all documents are signed
    const allSigned = documentRequirements.every(doc => doc.signed || !doc.required);
    if (allSigned) {
      setCurrentStep(3);
    }
  };

  const completeIssuance = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/assets/${assetId}/issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          user_id: selectedUserId,
          issue_date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast({
          title: 'Asset Issued Successfully',
          description: 'All documents signed and asset issued to user',
          status: 'success',
          duration: 3000,
        });
        onIssuanceComplete();
        onClose();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete asset issuance',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStepProgress = () => {
    return (currentStep / 3) * 100;
  };

  const selectedUser = users.find(user => user.id === selectedUserId);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" closeOnOverlayClick={false}>
        <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(10px)" />
        <ModalContent
          bg="transparent"
          boxShadow="none"
          maxW="80vw"
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
              <VStack align="start" spacing={2}>
                <Heading size="lg" color="white">
                  🚀 Asset Issuance Workflow
                </Heading>
                <Text color="gray.200" fontSize="md">
                  Asset: {assetName}
                </Text>
                <Progress
                  value={getStepProgress()}
                  colorScheme="blue"
                  size="sm"
                  width="100%"
                  bg="rgba(255, 255, 255, 0.1)"
                />
              </VStack>
            </ModalHeader>
            
            <ModalCloseButton color="white" />
            
            <ModalBody p={6}>
              <VStack spacing={6} align="stretch">
                {/* Step 1: User Selection */}
                {currentStep === 1 && (
                  <Card
                    bg="rgba(255, 255, 255, 0.1)"
                    backdropFilter="blur(10px)"
                    borderRadius="20px"
                    border="1px solid rgba(255, 255, 255, 0.1)"
                  >
                    <CardHeader>
                      <Heading size="md" color="white">
                        👤 Step 1: Select User
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <FormControl>
                        <FormLabel color="white" fontWeight="semibold">
                          Assign Asset To:
                        </FormLabel>
                        <Select
                          placeholder="Select a user..."
                          value={selectedUserId || ''}
                                                     onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedUserId(Number(e.target.value))}
                          bg="rgba(255, 255, 255, 0.1)"
                          border="1px solid rgba(255, 255, 255, 0.2)"
                          color="white"
                          _focus={{ borderColor: 'blue.300' }}
                        >
                          {users.map(user => (
                            <option key={user.id} value={user.id} style={{ background: '#2D3748', color: 'white' }}>
                              {user.full_name} ({user.email})
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    </CardBody>
                  </Card>
                )}

                {/* Step 2: Document Signing */}
                {currentStep === 2 && (
                  <Card
                    bg="rgba(255, 255, 255, 0.1)"
                    backdropFilter="blur(10px)"
                    borderRadius="20px"
                    border="1px solid rgba(255, 255, 255, 0.1)"
                  >
                    <CardHeader>
                      <Heading size="md" color="white">
                        📝 Step 2: Document Signing
                      </Heading>
                      <Text color="gray.200" fontSize="sm">
                        User: {selectedUser?.full_name}
                      </Text>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Alert
                          status="info"
                          bg="rgba(6, 182, 212, 0.15)"
                          border="1px solid rgba(6, 182, 212, 0.3)"
                          borderRadius="md"
                        >
                          <AlertIcon color="cyan.300" />
                          <Text color="white" fontSize="sm">
                            The following documents must be signed before asset issuance
                          </Text>
                        </Alert>

                        {documentRequirements.map((doc, index) => (
                          <HStack
                            key={doc.type}
                            justify="space-between"
                            p={4}
                            bg="rgba(255, 255, 255, 0.05)"
                            borderRadius="md"
                            border="1px solid rgba(255, 255, 255, 0.1)"
                          >
                            <VStack align="start" spacing={1}>
                              <Text color="white" fontWeight="semibold">
                                {index + 1}. {doc.name}
                              </Text>
                              <Badge
                                colorScheme={doc.signed ? 'green' : 'orange'}
                                variant="subtle"
                              >
                                {doc.signed ? '✅ Signed' : '⏳ Pending'}
                              </Badge>
                            </VStack>
                            <Button
                              size="sm"
                              onClick={() => handleDocumentSigning(doc.type)}
                              isDisabled={doc.signed}
                              bg={doc.signed ? 'green.500' : 'blue.500'}
                              color="white"
                              _hover={{ bg: doc.signed ? 'green.600' : 'blue.600' }}
                            >
                              {doc.signed ? 'Signed' : 'Sign Now'}
                            </Button>
                          </HStack>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                {/* Step 3: Complete Issuance */}
                {currentStep === 3 && (
                  <Card
                    bg="rgba(255, 255, 255, 0.1)"
                    backdropFilter="blur(10px)"
                    borderRadius="20px"
                    border="1px solid rgba(255, 255, 255, 0.1)"
                  >
                    <CardHeader>
                      <Heading size="md" color="white">
                        ✅ Step 3: Complete Issuance
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <Alert
                        status="success"
                        bg="rgba(72, 187, 120, 0.15)"
                        border="1px solid rgba(72, 187, 120, 0.3)"
                        borderRadius="md"
                      >
                        <AlertIcon color="green.300" />
                        <VStack align="start" spacing={2}>
                          <Text color="white" fontWeight="bold">
                            All Documents Signed Successfully!
                          </Text>
                          <Text color="gray.200" fontSize="sm">
                            Ready to complete asset issuance to {selectedUser?.full_name}
                          </Text>
                        </VStack>
                      </Alert>
                    </CardBody>
                  </Card>
                )}
              </VStack>
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
                
                {currentStep === 1 && (
                  <Button
                    onClick={initiateDocumentSigning}
                    isLoading={isLoading}
                    loadingText="Initiating..."
                    bg="rgba(59, 130, 246, 0.8)"
                    color="white"
                    _hover={{ bg: 'rgba(59, 130, 246, 1)' }}
                    isDisabled={!selectedUserId}
                  >
                    📋 Initiate Document Signing
                  </Button>
                )}
                
                {currentStep === 3 && (
                  <Button
                    onClick={completeIssuance}
                    isLoading={isLoading}
                    loadingText="Completing..."
                    bg="rgba(34, 197, 94, 0.8)"
                    color="white"
                    _hover={{ bg: 'rgba(34, 197, 94, 1)' }}
                  >
                    🎉 Complete Issuance
                  </Button>
                )}
              </HStack>
            </ModalFooter>
          </Box>
        </ModalContent>
      </Modal>

      {/* Electronic Signature Modal */}
      {currentDocumentType && (
        <ElectronicSignature
          assetId={assetId}
          documentType={currentDocumentType}
          onSigningComplete={handleSigningComplete}
          isOpen={isSigningModalOpen}
          onClose={() => setIsSigningModalOpen(false)}
        />
      )}
    </>
  );
};

export default AssetIssuanceModal; 