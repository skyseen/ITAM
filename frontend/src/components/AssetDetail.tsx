/**
 * AssetDetail Component - Asset Detail View with Document Signing Integration
 * 
 * This component provides a comprehensive view of a single asset with all its details,
 * history, actions, and pending document signatures. Integrates with the electronic
 * signature workflow for asset issuance compliance.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Heading,
  Card,
  CardBody,
  CardHeader,
  Text,
  Badge,
  VStack,
  HStack,
  Button,
  Divider,
  Avatar,
  Skeleton,
  useColorModeValue,
  Flex,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  useDisclosure,
  List,
  ListItem,
  ListIcon,
  Progress,
} from '@chakra-ui/react';
import {
  ArrowBackIcon,
  EditIcon,
  InfoIcon,
  CalendarIcon,
  CheckIcon,
  WarningIcon,
  TimeIcon,
} from '@chakra-ui/icons';
import { useAssets, Asset } from '../contexts/AssetContext';
import { useAuth } from '../contexts/AuthContext';
import IssueAssetModal from './IssueAssetModal';
import ElectronicSignature from './ElectronicSignature';

/**
 * Document interface for pending signatures
 */
interface PendingDocument {
  id: number;
  document_type: string;
  status: string;
  created_at: string;
  expires_at: string;
}

/**
 * Status color mapping for consistent theming
 */
const STATUS_COLORS = {
  available: 'green',
  in_use: 'blue',
  maintenance: 'orange',
  retired: 'gray',
} as const;

/**
 * Document type display names
 */
const DOCUMENT_NAMES = {
  declaration_form: 'Declaration Form for Holding Company IT Asset',
  it_orientation: 'IT Orientation Acknowledgment Form',
  handover_form: 'Equipment Takeover/Handover Form',
};

/**
 * Main AssetDetail Component
 */
const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { assets, loading, fetchAssets, returnAsset } = useAssets();
  
  const [asset, setAsset] = useState<Asset | null>(null);
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [currentDocumentType, setCurrentDocumentType] = useState<string>('');
  
  const { isOpen: isIssueOpen, onOpen: onIssueOpen, onClose: onIssueClose } = useDisclosure();
  const { isOpen: isSigningOpen, onOpen: onSigningOpen, onClose: onSigningClose } = useDisclosure();

  // Theme colors for futuristic design
  const bgGradient = useColorModeValue(
    'linear(to-br, purple.900, blue.800, teal.700)',
    'linear(to-br, gray.900, purple.900, blue.900)'
  );
  
  const glassEffect = {
    bg: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  };

  useEffect(() => {
    if (id && assets.length > 0) {
      const foundAsset = assets.find(a => a.id === parseInt(id));
      setAsset(foundAsset || null);
      
      if (!foundAsset) {
        // If asset not found in current list, fetch all assets
        fetchAssets();
      }
    }
  }, [id, assets, fetchAssets]);

  useEffect(() => {
    // Fetch pending documents for the current user and asset
    if (asset && user) {
      fetchPendingDocuments();
    }
  }, [asset, user]);

  const fetchPendingDocuments = async () => {
    if (!asset || !user) return;
    
    setLoadingDocuments(true);
    try {
      const response = await fetch(`http://localhost:8000/api/documents/asset/${asset.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (response.ok) {
        const documents = await response.json();
        
        // Filter for pending documents for current user
        const userPendingDocs = documents.filter((doc: any) => 
          doc.status === 'pending' && doc.user_id === user.id
        );
        setPendingDocuments(userPendingDocs);
      }
    } catch (error) {
      console.error('Failed to fetch pending documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleSignDocument = (documentType: string) => {
    setCurrentDocumentType(documentType);
    onSigningOpen();
  };

  const handleSigningComplete = () => {
    // Refresh pending documents after signing
    fetchPendingDocuments();
    onSigningClose();
    toast({
      title: 'Document Signed Successfully',
      description: 'Your electronic signature has been recorded',
      status: 'success',
      duration: 3000,
    });
  };

  const handleReturn = async () => {
    if (!asset) return;
    
    try {
      await returnAsset(asset.id);
      toast({
        title: 'Asset Returned',
        description: `${asset.asset_id} has been returned successfully`,
        status: 'success',
        duration: 3000,
      });
      // Refresh asset data
      await fetchAssets();
    } catch (error) {
      toast({
        title: 'Return Failed',
        description: 'Failed to return asset',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const canEdit = user?.role === 'admin' || user?.role === 'manager';
  const canIssue = asset?.status === 'available' && canEdit;
  const canReturn = asset?.status === 'in_use' && canEdit;
  const isAssignedToCurrentUser = asset?.assigned_user_id === user?.id;

  if (loading && !asset) {
    return (
      <Container maxW="6xl" py={8}>
        <VStack spacing={6}>
          <Skeleton height="200px" width="100%" borderRadius="20px" />
          <Skeleton height="300px" width="100%" borderRadius="20px" />
        </VStack>
      </Container>
    );
  }

  if (!asset) {
    return (
      <Container maxW="6xl" py={8}>
        <Alert status="error" borderRadius="20px">
          <AlertIcon />
          <AlertDescription>Asset not found</AlertDescription>
        </Alert>
      </Container>
    );
  }

  const warrantyDays = Math.ceil(
    (new Date(asset.warranty_expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW="6xl" py={8}>
        {/* Header */}
        <HStack justify="space-between" mb={8}>
          <HStack>
            <Button
              leftIcon={<ArrowBackIcon />}
              variant="outline"
              onClick={() => navigate('/assets')}
              color="white"
              borderColor="rgba(255, 255, 255, 0.3)"
              _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
            >
              Back to Assets
            </Button>
            <Heading color="white" size="lg">
              {asset.asset_id}
            </Heading>
          </HStack>
          
          <HStack spacing={4}>
            {canEdit && (
              <Button
                leftIcon={<EditIcon />}
                colorScheme="blue"
                onClick={() => navigate(`/assets/${asset.id}/edit`)}
              >
                Edit Asset
              </Button>
            )}
            {canIssue && (
              <Button
                leftIcon={<CheckIcon />}
                colorScheme="green"
                onClick={onIssueOpen}
              >
                Issue Asset
              </Button>
            )}
            {canReturn && (
              <Button
                leftIcon={<ArrowBackIcon />}
                colorScheme="orange"
                onClick={handleReturn}
              >
                Return Asset
              </Button>
            )}
          </HStack>
        </HStack>

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
          {/* Main Asset Information */}
          <VStack spacing={6} align="stretch">
            {/* Asset Overview Card */}
            <Card {...glassEffect}>
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md" color="white">Asset Overview</Heading>
                  <Badge 
                    colorScheme={STATUS_COLORS[asset.status as keyof typeof STATUS_COLORS]}
                    size="lg"
                    textTransform="capitalize"
                  >
                    {asset.status.replace('_', ' ')}
                  </Badge>
                </HStack>
              </CardHeader>
              <CardBody>
                <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                  <VStack align="start" spacing={3}>
                    <Box>
                      <Text fontSize="sm" color="gray.300">Type</Text>
                      <Text color="white" fontWeight="semibold">{asset.type}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.300">Brand</Text>
                      <Text color="white" fontWeight="semibold">{asset.brand}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.300">Model</Text>
                      <Text color="white" fontWeight="semibold">{asset.model}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.300">Department</Text>
                      <Text color="white" fontWeight="semibold">{asset.department}</Text>
                    </Box>
                  </VStack>
                  
                  <VStack align="start" spacing={3}>
                    <Box>
                      <Text fontSize="sm" color="gray.300">Purchase Date</Text>
                      <Text color="white" fontWeight="semibold">
                        {new Date(asset.purchase_date).toLocaleDateString()}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.300">Warranty Status</Text>
                      <HStack>
                        {warrantyDays > 30 ? (
                          <CheckIcon color="green.400" />
                        ) : warrantyDays > 0 ? (
                          <WarningIcon color="orange.400" />
                        ) : (
                          <TimeIcon color="red.400" />
                        )}
                        <Text 
                          color={warrantyDays > 30 ? "green.400" : warrantyDays > 0 ? "orange.400" : "red.400"}
                          fontWeight="semibold"
                        >
                          {warrantyDays > 0 ? `${warrantyDays} days left` : 'Expired'}
                        </Text>
                      </HStack>
                    </Box>
                    {asset.assigned_user_name && (
                      <Box>
                        <Text fontSize="sm" color="gray.300">Assigned To</Text>
                        <HStack>
                          <Avatar size="sm" name={asset.assigned_user_name} />
                          <Text color="white" fontWeight="semibold">{asset.assigned_user_name}</Text>
                        </HStack>
                      </Box>
                    )}
                  </VStack>
                </Grid>
              </CardBody>
            </Card>

            {/* Pending Documents Card (only show if user has pending docs) */}
            {isAssignedToCurrentUser && pendingDocuments.length > 0 && (
              <Card {...glassEffect}>
                <CardHeader>
                  <HStack>
                    <InfoIcon color="yellow.400" />
                    <Heading size="md" color="white">Pending Document Signatures</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Alert status="warning" bg="rgba(255, 193, 7, 0.1)" border="1px solid rgba(255, 193, 7, 0.3)" borderRadius="md" mb={4}>
                    <AlertIcon />
                    <AlertDescription color="white">
                      You have {pendingDocuments.length} document(s) that require your electronic signature.
                    </AlertDescription>
                  </Alert>
                  
                  <List spacing={3}>
                    {pendingDocuments.map((doc, index) => {
                      const daysLeft = Math.ceil(
                        (new Date(doc.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                      );
                      
                      return (
                        <ListItem key={doc.id}>
                          <HStack justify="space-between" p={3} bg="rgba(255, 255, 255, 0.05)" borderRadius="md">
                            <VStack align="start" spacing={1}>
                              <Text color="white" fontWeight="semibold">
                                {DOCUMENT_NAMES[doc.document_type as keyof typeof DOCUMENT_NAMES]}
                              </Text>
                              <Text fontSize="sm" color="gray.300">
                                Expires in {daysLeft} days
                              </Text>
                              <Progress 
                                value={Math.max(0, (daysLeft / 7) * 100)} 
                                size="sm" 
                                colorScheme={daysLeft > 3 ? "green" : daysLeft > 1 ? "yellow" : "red"}
                                width="200px"
                              />
                            </VStack>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              onClick={() => handleSignDocument(doc.document_type)}
                            >
                              Sign Now
                            </Button>
                          </HStack>
                        </ListItem>
                      );
                    })}
                  </List>
                </CardBody>
              </Card>
            )}
          </VStack>

          {/* Sidebar with additional info */}
          <VStack spacing={6} align="stretch">
            {/* Quick Stats */}
            <Card {...glassEffect}>
              <CardHeader>
                <Heading size="sm" color="white">Quick Info</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text color="gray.300">Asset ID</Text>
                    <Text color="white" fontWeight="bold">{asset.asset_id}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.300">Status</Text>
                    <Badge colorScheme={STATUS_COLORS[asset.status as keyof typeof STATUS_COLORS]}>
                      {asset.status.replace('_', ' ')}
                    </Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.300">Created</Text>
                    <Text color="white">{new Date(asset.created_at).toLocaleDateString()}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.300">Last Updated</Text>
                    <Text color="white">{new Date(asset.updated_at).toLocaleDateString()}</Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Document Status Summary */}
            {isAssignedToCurrentUser && (
              <Card {...glassEffect}>
                <CardHeader>
                  <Heading size="sm" color="white">Document Status</Heading>
                </CardHeader>
                <CardBody>
                  {loadingDocuments ? (
                    <VStack spacing={2}>
                      <Skeleton height="20px" />
                      <Skeleton height="20px" />
                      <Skeleton height="20px" />
                    </VStack>
                  ) : pendingDocuments.length > 0 ? (
                    <VStack spacing={3} align="stretch">
                      <Alert status="warning" size="sm" bg="rgba(255, 193, 7, 0.1)" border="1px solid rgba(255, 193, 7, 0.3)" borderRadius="md">
                        <AlertIcon />
                        <AlertDescription fontSize="sm" color="white">
                          {pendingDocuments.length} pending signatures
                        </AlertDescription>
                      </Alert>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={() => handleSignDocument(pendingDocuments[0].document_type)}
                        width="100%"
                      >
                        Start Signing Process
                      </Button>
                    </VStack>
                  ) : (
                    <Alert status="success" size="sm" bg="rgba(72, 187, 120, 0.1)" border="1px solid rgba(72, 187, 120, 0.3)" borderRadius="md">
                      <AlertIcon />
                      <AlertDescription fontSize="sm" color="white">
                        All documents signed
                      </AlertDescription>
                    </Alert>
                  )}
                </CardBody>
              </Card>
            )}
          </VStack>
        </Grid>

        {/* Issue Asset Modal */}
        {asset && (
          <IssueAssetModal
            isOpen={isIssueOpen}
            onClose={onIssueClose}
            asset={asset}
          />
        )}

        {/* Electronic Signature Modal */}
        {asset && currentDocumentType && (
          <ElectronicSignature
            assetId={asset.id}
            documentType={currentDocumentType}
            onSigningComplete={handleSigningComplete}
            isOpen={isSigningOpen}
            onClose={onSigningClose}
          />
        )}
      </Container>
    </Box>
  );
};

export default AssetDetail; 