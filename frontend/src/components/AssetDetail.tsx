/**
 * AssetDetail Component - Futuristic Asset Detail View
 * 
 * This component provides a comprehensive view of a single asset with all its details,
 * history, and actions. Features a modern, futuristic design with glass-morphism effects.
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
  Table,
  Tbody,
  Tr,
  Td,
  Avatar,
  Skeleton,
  useColorModeValue,
  Icon,
  Flex,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import {
  ArrowBackIcon,
  EditIcon,
  InfoIcon,
  CalendarIcon,
  ViewIcon,
  CheckIcon,
  WarningIcon,
  TimeIcon,
  BellIcon,
  StarIcon,
  SettingsIcon,
  AttachmentIcon,
  ExternalLinkIcon,
} from '@chakra-ui/icons';
import { useAssets, Asset } from '../contexts/AssetContext';
import { useAuth } from '../contexts/AuthContext';
// import IssueAssetModal from './IssueAssetModal';

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
 * Main AssetDetail Component
 */
const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { assets, loading, fetchAssets, returnAsset } = useAssets();
  
  const [asset, setAsset] = useState<Asset | null>(null);
  const [assetHistory, setAssetHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const { isOpen: isIssueOpen, onOpen: onIssueOpen, onClose: onIssueClose } = useDisclosure();

  // Theme colors for futuristic design
  const bgGradient = useColorModeValue(
    'linear(to-br, purple.900, blue.800, teal.700)',
    'linear(to-br, gray.900, purple.900, blue.900)'
  );
  const cardBg = useColorModeValue(
    'rgba(255, 255, 255, 0.1)',
    'rgba(45, 55, 72, 0.1)'
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
    // Simulate fetching asset history (implement API call here)
    if (asset) {
      setLoadingHistory(true);
      // TODO: Implement actual history fetching
      setTimeout(() => {
        setAssetHistory([
          {
            id: 1,
            action: 'Created',
            date: asset.created_at,
            user: 'System',
            details: 'Asset added to inventory'
          },
          {
            id: 2,
            action: 'Issued',
            date: '2023-06-01T10:00:00',
            user: 'Admin',
            details: `Issued to ${asset.assigned_user_name || 'User'}`
          }
        ]);
        setLoadingHistory(false);
      }, 1000);
    }
  }, [asset]);

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
        <Flex justify="space-between" align="center" mb={8}>
          <HStack spacing={4}>
            <Button
              leftIcon={<ArrowBackIcon />}
              variant="ghost"
              onClick={() => navigate('/assets')}
              color="white"
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
                                    leftIcon={<InfoIcon />}
                colorScheme="green"
                onClick={onIssueOpen}
              >
                Issue Asset
              </Button>
            )}
            {canReturn && (
              <Button
                                    leftIcon={<TimeIcon />}
                colorScheme="orange"
                onClick={handleReturn}
              >
                Return Asset
              </Button>
            )}
          </HStack>
        </Flex>

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
          {/* Main Asset Information */}
          <VStack spacing={6} align="stretch">
            {/* Basic Information Card */}
            <Card {...glassEffect}>
              <CardHeader>
                <HStack>
                                        <InfoIcon color="blue.300" />
                  <Heading size="md" color="white">Asset Information</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                  <VStack align="start" spacing={4}>
                    <Box>
                      <Text fontSize="sm" color="gray.300">Asset ID</Text>
                      <Text fontSize="lg" fontWeight="bold" color="white">
                        {asset.asset_id}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.300">Type</Text>
                      <Text fontSize="lg" color="white" textTransform="capitalize">
                        {asset.type}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.300">Brand</Text>
                      <Text fontSize="lg" color="white">{asset.brand}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.300">Model</Text>
                      <Text fontSize="lg" color="white">{asset.model}</Text>
                    </Box>
                  </VStack>
                  
                  <VStack align="start" spacing={4}>
                    <Box>
                      <Text fontSize="sm" color="gray.300">Status</Text>
                      <Badge 
                        colorScheme={STATUS_COLORS[asset.status as keyof typeof STATUS_COLORS]}
                        size="lg"
                        textTransform="capitalize"
                      >
                        {asset.status.replace('_', ' ')}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.300">Department</Text>
                      <Text fontSize="lg" color="white">{asset.department}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.300">Serial Number</Text>
                      <Text fontSize="lg" color="white">
                        {asset.serial_number || 'N/A'}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.300">Location</Text>
                      <HStack>
                        <ViewIcon color="green.300" />
                        <Text fontSize="lg" color="white">
                          {asset.location || 'Not specified'}
                        </Text>
                      </HStack>
                    </Box>
                  </VStack>
                </Grid>
              </CardBody>
            </Card>

            {/* Financial Information */}
            <Card {...glassEffect}>
              <CardHeader>
                <HStack>
                  <CheckIcon color="green.300" />
                  <Heading size="md" color="white">Financial & Warranty</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                  <Box>
                    <Text fontSize="sm" color="gray.300">Purchase Cost</Text>
                    <Text fontSize="lg" fontWeight="bold" color="green.300">
                      {asset.purchase_cost || 'N/A'}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.300">Purchase Date</Text>
                    <HStack>
                      <CalendarIcon color="blue.300" />
                      <Text fontSize="lg" color="white">
                        {new Date(asset.purchase_date).toLocaleDateString()}
                      </Text>
                    </HStack>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.300">Warranty Status</Text>
                    <VStack align="start" spacing={1}>
                      <Badge 
                        colorScheme={warrantyDays < 0 ? 'red' : warrantyDays <= 30 ? 'orange' : 'green'}
                      >
                        {warrantyDays < 0 ? 'Expired' : `${warrantyDays} days left`}
                      </Badge>
                      <Text fontSize="sm" color="gray.400">
                        Expires: {new Date(asset.warranty_expiry).toLocaleDateString()}
                      </Text>
                    </VStack>
                  </Box>
                </Grid>
              </CardBody>
            </Card>
          </VStack>

          {/* Sidebar */}
          <VStack spacing={6} align="stretch">
            {/* Assignment Information */}
            <Card {...glassEffect}>
              <CardHeader>
                <HStack>
                  <InfoIcon color="purple.300" />
                  <Heading size="md" color="white">Assignment</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                {asset.assigned_user_name ? (
                  <VStack spacing={4}>
                    <Avatar name={asset.assigned_user_name} size="lg" />
                    <Text fontSize="lg" color="white" textAlign="center">
                      {asset.assigned_user_name}
                    </Text>
                    <Text fontSize="sm" color="gray.300" textAlign="center">
                      Currently assigned
                    </Text>
                  </VStack>
                ) : (
                  <VStack spacing={4}>
                    <Avatar size="lg" />
                    <Text fontSize="lg" color="gray.300" textAlign="center">
                      Not assigned
                    </Text>
                    <Text fontSize="sm" color="gray.400" textAlign="center">
                      Available for assignment
                    </Text>
                  </VStack>
                )}
              </CardBody>
            </Card>

            {/* Quick Actions */}
            <Card {...glassEffect}>
              <CardHeader>
                <HStack>
                  <SettingsIcon color="orange.300" />
                  <Heading size="md" color="white">Quick Actions</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={3}>
                  <Button
                    width="100%"
                    leftIcon={<TimeIcon />}
                    variant="outline"
                    colorScheme="blue"
                    onClick={() => {/* TODO: View history */}}
                  >
                    View History
                  </Button>
                  <Button
                    width="100%"
                    leftIcon={<StarIcon />}
                    variant="outline"
                    colorScheme="green"
                    onClick={() => {/* TODO: Generate QR */}}
                  >
                    Generate QR Code
                  </Button>
                  {asset.notes && (
                    <Box w="100%" p={4} bg="rgba(255,255,255,0.1)" borderRadius="md">
                      <Text fontSize="sm" color="gray.300" mb={2}>Notes:</Text>
                      <Text fontSize="sm" color="white">{asset.notes}</Text>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Grid>
      </Container>

      {/* Issue Asset Modal */}
      {/* {asset && (
        <IssueAssetModal
          isOpen={isIssueOpen}
          onClose={onIssueClose}
          asset={asset}
        />
      )} */}
    </Box>
  );
};

export default AssetDetail; 