/**
 * UserDashboard Component - User-specific Dashboard with Pending Tasks
 * 
 * This dashboard is designed for regular users to see their pending tasks,
 * including document signatures, assigned assets, and notifications.
 * Users cannot access the main assets page - this is their primary interface.
 */

import React, { useState, useEffect } from 'react';
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
  Avatar,
  useColorModeValue,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  List,
  ListItem,
  Progress,
  Skeleton,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useDisclosure,
} from '@chakra-ui/react';
import {
  InfoIcon,
  CheckIcon,
  WarningIcon,
  TimeIcon,
  CalendarIcon,
  EditIcon,
} from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';
import ElectronicSignature from './ElectronicSignature';

/**
 * Interfaces for user dashboard data
 */
interface PendingDocument {
  id: number;
  asset_id: number;
  document_type: string;
  status: string;
  created_at: string;
  expires_at: string;
  template_name?: string;
}

interface AssignedAsset {
  id: number;
  asset_id: string;
  brand: string;
  model: string;
  type: string;
  assigned_date: string;
}

interface UserTask {
  id: string;
  type: 'document' | 'asset_return' | 'maintenance';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  due_date: string;
  asset_id?: number;
  document_type?: string;
}

/**
 * Document type display names
 */
const DOCUMENT_NAMES = {
  declaration_form: 'Declaration Form for Holding Company IT Asset',
  it_orientation: 'IT Orientation Acknowledgment Form',
  handover_form: 'Equipment Takeover/Handover Form',
};

/**
 * Priority colors
 */
const PRIORITY_COLORS = {
  high: 'red',
  medium: 'orange',
  low: 'green',
};

/**
 * UserDashboard Component
 */
const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>([]);
  const [assignedAssets, setAssignedAssets] = useState<AssignedAsset[]>([]);
  const [userTasks, setUserTasks] = useState<UserTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDocumentType, setCurrentDocumentType] = useState<string>('');
  const [currentAssetId, setCurrentAssetId] = useState<number>(0);
  
  const { isOpen: isSigningOpen, onOpen: onSigningOpen, onClose: onSigningClose } = useDisclosure();

  // Theme colors
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.600, purple.600, teal.500)',
    'linear(to-br, gray.900, blue.900, purple.900)'
  );
  
  const glassEffect = {
    bg: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  };

  useEffect(() => {
    if (user) {
      fetchUserDashboardData();
    }
  }, [user]);

  const fetchUserDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch pending documents for all user's assets
      const documentsResponse = await fetch(`http://localhost:8000/api/documents/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (documentsResponse.ok) {
        const documents = await documentsResponse.json();
        console.log('Fetched documents:', documents); // Debug log
        const pending = documents.filter((doc: any) => doc.status === 'pending');
        console.log('Pending documents:', pending); // Debug log
        setPendingDocuments(pending);
        
        // Generate user tasks immediately after fetching documents
        generateUserTasks(pending);
      } else {
        const errorText = await documentsResponse.text();
        console.error('Failed to fetch documents:', errorText);
        toast({
          title: 'Error Loading Documents',
          description: 'Failed to load pending documents',
          status: 'error',
          duration: 3000,
        });
      }

      // Fetch user's assigned assets - use correct API endpoint
      const assetsResponse = await fetch(`http://localhost:8000/api/v1/assets/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (assetsResponse.ok) {
        const allAssets = await assetsResponse.json();
        // Filter for assets assigned to current user
        const userAssets = allAssets.filter((asset: any) => asset.assigned_user_id === user.id);
        setAssignedAssets(userAssets);
      } else {
        console.error('Failed to fetch assets:', await assetsResponse.text());
      }
      
    } catch (error) {
      console.error('Failed to fetch user dashboard data:', error);
      toast({
        title: 'Error Loading Dashboard',
        description: 'Failed to load your dashboard data',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const generateUserTasks = (documents?: any[]) => {
    const tasks: UserTask[] = [];
    
    // Use provided documents or fallback to state
    const docsToProcess = documents || pendingDocuments;
    
    // Add document signing tasks
    docsToProcess.forEach((doc, index) => {
      const daysLeft = Math.ceil(
        (new Date(doc.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      
      tasks.push({
        id: `doc-${doc.id}`,
        type: 'document',
        title: `Sign ${doc.template_name || DOCUMENT_NAMES[doc.document_type as keyof typeof DOCUMENT_NAMES] || doc.document_type}`,
        description: `Electronic signature required for asset documentation`,
        priority: daysLeft <= 2 ? 'high' : daysLeft <= 5 ? 'medium' : 'low',
        due_date: doc.expires_at,
        asset_id: doc.asset_id,
        document_type: doc.document_type,
      });
    });

    setUserTasks(tasks);
  };

  const handleSignDocument = (assetId: number, documentType: string) => {
    setCurrentAssetId(assetId);
    setCurrentDocumentType(documentType);
    onSigningOpen();
  };

  const handleSigningComplete = () => {
    // Refresh dashboard data after signing
    fetchUserDashboardData();
    onSigningClose();
    toast({
      title: 'Document Signed Successfully',
      description: 'Your electronic signature has been recorded',
      status: 'success',
      duration: 3000,
    });
  };

  if (loading) {
    return (
      <Container maxW="6xl" py={8}>
        <VStack spacing={6}>
          <Skeleton height="100px" width="100%" borderRadius="20px" />
          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6} width="100%">
            <Skeleton height="150px" borderRadius="20px" />
            <Skeleton height="150px" borderRadius="20px" />
            <Skeleton height="150px" borderRadius="20px" />
          </Grid>
          <Skeleton height="300px" width="100%" borderRadius="20px" />
        </VStack>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW="6xl" py={8}>
        {/* Welcome Header */}
        <Card {...glassEffect} mb={8}>
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={2}>
                <Heading color="white" size="lg">
                  Welcome back, {user?.full_name}!
                </Heading>
                <Text color="gray.200">
                  Here's what needs your attention today
                </Text>
              </VStack>
              <HStack>
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                  onClick={fetchUserDashboardData}
                  isLoading={loading}
                >
                  Refresh
                </Button>
                <Avatar size="lg" name={user?.full_name} />
              </HStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Stats Cards */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6} mb={8}>
          {/* Pending Tasks */}
          <Card {...glassEffect}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.300">Pending Tasks</StatLabel>
                <StatNumber color="white" fontSize="3xl">
                  {userTasks.length}
                </StatNumber>
                <StatHelpText color="gray.400">
                  {userTasks.filter(t => t.priority === 'high').length} high priority
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          {/* Assigned Assets */}
          <Card {...glassEffect}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.300">Assigned Assets</StatLabel>
                <StatNumber color="white" fontSize="3xl">
                  {assignedAssets.length}
                </StatNumber>
                <StatHelpText color="gray.400">
                  Currently in your possession
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          {/* Document Status */}
          <Card {...glassEffect}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.300">Pending Signatures</StatLabel>
                <StatNumber color="white" fontSize="3xl">
                  {pendingDocuments.length}
                </StatNumber>
                <StatHelpText color="gray.400">
                  Electronic signatures required
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
          {/* Pending Tasks */}
          <VStack spacing={6} align="stretch">
            <Card {...glassEffect}>
              <CardHeader>
                <HStack>
                  <WarningIcon color="orange.400" />
                  <Heading size="md" color="white">Pending Tasks</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                {userTasks.length === 0 ? (
                  <Alert status="success" bg="rgba(72, 187, 120, 0.1)" border="1px solid rgba(72, 187, 120, 0.3)" borderRadius="md">
                    <AlertIcon />
                    <AlertDescription color="white">
                      All caught up! No pending tasks.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <List spacing={4}>
                    {userTasks.map((task) => {
                      const daysLeft = Math.ceil(
                        (new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                      );
                      
                      return (
                        <ListItem key={task.id}>
                          <HStack justify="space-between" p={4} bg="rgba(255, 255, 255, 0.05)" borderRadius="md">
                            <VStack align="start" spacing={2} flex={1}>
                              <HStack>
                                <Badge colorScheme={PRIORITY_COLORS[task.priority]} size="sm">
                                  {task.priority.toUpperCase()}
                                </Badge>
                                <Text color="white" fontWeight="semibold">
                                  {task.title}
                                </Text>
                              </HStack>
                              <Text color="gray.300" fontSize="sm">
                                {task.description}
                              </Text>
                              <HStack>
                                <CalendarIcon color="gray.400" />
                                <Text color="gray.400" fontSize="xs">
                                  Due in {daysLeft} days
                                </Text>
                              </HStack>
                              <Progress 
                                value={Math.max(0, (daysLeft / 7) * 100)} 
                                size="sm" 
                                colorScheme={daysLeft > 3 ? "green" : daysLeft > 1 ? "yellow" : "red"}
                                width="100%"
                              />
                            </VStack>
                            {task.type === 'document' && (
                              <Button
                                size="sm"
                                colorScheme="blue"
                                onClick={() => handleSignDocument(task.asset_id!, task.document_type!)}
                              >
                                Sign Now
                              </Button>
                            )}
                          </HStack>
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              </CardBody>
            </Card>
          </VStack>

          {/* Sidebar */}
          <VStack spacing={6} align="stretch">
            {/* My Assets */}
            <Card {...glassEffect}>
              <CardHeader>
                <HStack>
                  <InfoIcon color="blue.400" />
                  <Heading size="sm" color="white">My Assets</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                {assignedAssets.length === 0 ? (
                  <Text color="gray.400" fontSize="sm">
                    No assets currently assigned
                  </Text>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {assignedAssets.slice(0, 5).map((asset) => (
                      <Box key={asset.id} p={3} bg="rgba(255, 255, 255, 0.05)" borderRadius="md">
                        <Text color="white" fontWeight="semibold" fontSize="sm">
                          {asset.asset_id}
                        </Text>
                        <Text color="gray.300" fontSize="xs">
                          {asset.brand} {asset.model}
                        </Text>
                      </Box>
                    ))}
                    {assignedAssets.length > 5 && (
                      <Text color="gray.400" fontSize="xs" textAlign="center">
                        +{assignedAssets.length - 5} more assets
                      </Text>
                    )}
                  </VStack>
                )}
              </CardBody>
            </Card>

            {/* Quick Actions */}
            <Card {...glassEffect}>
              <CardHeader>
                <Heading size="sm" color="white">Quick Actions</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={3}>
                  <Button
                    width="100%"
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    onClick={fetchUserDashboardData}
                  >
                    Refresh Dashboard
                  </Button>
                  {pendingDocuments.length > 0 && (
                    <Button
                      width="100%"
                      size="sm"
                      colorScheme="green"
                      onClick={() => handleSignDocument(pendingDocuments[0].asset_id, pendingDocuments[0].document_type)}
                    >
                      Start Signing Documents
                    </Button>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Grid>

        {/* Electronic Signature Modal */}
        {currentAssetId && currentDocumentType && (
          <ElectronicSignature
            assetId={currentAssetId}
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

export default UserDashboard; 