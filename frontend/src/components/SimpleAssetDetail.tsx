import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Grid,
  GridItem,
  Badge,
  Progress,
  Flex,
  Divider,
  Avatar,
  useToast,
} from '@chakra-ui/react';
import {
  ArrowBackIcon,
  EditIcon,
  InfoIcon,
  CalendarIcon,
  ViewIcon,
  CheckIcon,
  WarningIcon,
} from '@chakra-ui/icons';
import { useAssets, Asset } from '../contexts/AssetContext';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

const SimpleAssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { assets, fetchAssets } = useAssets();
  const { user } = useAuth();
  const toast = useToast();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id && assets.length > 0) {
      const foundAsset = assets.find(a => a.id === parseInt(id));
      setAsset(foundAsset || null);
      setIsLoading(false);
    } else if (id) {
      fetchAssets().then(() => setIsLoading(false));
    }
  }, [id, assets, fetchAssets]);

  if (isLoading) {
    return (
      <Container maxW="6xl" py={8}>
        <Text>Loading asset details...</Text>
      </Container>
    );
  }

  if (!asset) {
    return (
      <Container maxW="6xl" py={8}>
        <VStack spacing={4}>
          <Text fontSize="xl" color="red.500">Asset not found</Text>
          <Button leftIcon={<ArrowBackIcon />} onClick={() => navigate('/assets')}>
            Back to Assets
          </Button>
        </VStack>
      </Container>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'green';
      case 'in_use': return 'blue';
      case 'maintenance': return 'orange';
      case 'retired': return 'gray';
      default: return 'gray';
    }
  };

  const canEdit = user?.role === 'admin' || user?.role === 'manager';
  const canIssue = canEdit && asset.status === 'available';

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Card>
          <CardBody>
            <Flex justify="space-between" align="center">
              <HStack spacing={4}>
                <Button
                  leftIcon={<ArrowBackIcon />}
                  variant="ghost"
                  onClick={() => navigate('/assets')}
                >
                  Back to Assets
                </Button>
                <Text fontSize="2xl" fontWeight="bold">
                  {asset.asset_id}
                </Text>
                <Badge colorScheme={getStatusColor(asset.status)} size="lg">
                  {asset.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </HStack>
              
              <HStack spacing={2}>
                {canEdit && (
                  <Button
                    leftIcon={<EditIcon />}
                    colorScheme="blue"
                    onClick={() => navigate(`/assets/${asset.id}/edit`)}
                  >
                    Edit
                  </Button>
                )}
                {canIssue && (
                  <Button
                    leftIcon={<CheckIcon />}
                    colorScheme="green"
                    onClick={() => {
                      toast({
                        title: "Issue Asset",
                        description: "Issue functionality will be available soon",
                        status: "info",
                        duration: 3000,
                        isClosable: true,
                      });
                    }}
                  >
                    Issue
                  </Button>
                )}
              </HStack>
            </Flex>
          </CardBody>
        </Card>

        {/* Asset Information */}
        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          {/* Basic Information */}
          <GridItem>
            <Card>
              <CardHeader>
                <Text fontSize="lg" fontWeight="semibold">Basic Information</Text>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontSize="sm" color="gray.500">Type</Text>
                    <Text fontSize="md" fontWeight="medium">{asset.type}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">Brand</Text>
                    <Text fontSize="md" fontWeight="medium">{asset.brand}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">Model</Text>
                    <Text fontSize="md" fontWeight="medium">{asset.model}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">Serial Number</Text>
                    <Text fontSize="md" fontWeight="medium">{asset.serial_number}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">Department</Text>
                    <Text fontSize="md" fontWeight="medium">{asset.department}</Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* Assignment & Status */}
          <GridItem>
            <Card>
              <CardHeader>
                <Text fontSize="lg" fontWeight="semibold">Assignment & Status</Text>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontSize="sm" color="gray.500">Current Status</Text>
                    <Badge colorScheme={getStatusColor(asset.status)} size="lg">
                      {asset.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </Box>
                  {asset.assigned_user_name && (
                    <Box>
                      <Text fontSize="sm" color="gray.500">Assigned To</Text>
                      <HStack>
                        <Avatar size="sm" name={asset.assigned_user_name} />
                        <Text fontSize="md" fontWeight="medium">{asset.assigned_user_name}</Text>
                      </HStack>
                    </Box>
                  )}
                  <Box>
                    <Text fontSize="sm" color="gray.500">Location</Text>
                    <Text fontSize="md" fontWeight="medium">{asset.location}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">Purchase Date</Text>
                    <Text fontSize="md" fontWeight="medium">
                      {new Date(asset.purchase_date).toLocaleDateString()}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">Purchase Cost</Text>
                    <Text fontSize="md" fontWeight="medium">
                      ${asset.purchase_cost?.toLocaleString() || 'N/A'}
                    </Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Warranty Information */}
        <Card>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold">Warranty Information</Text>
          </CardHeader>
          <CardBody>
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              <Box>
                <Text fontSize="sm" color="gray.500">Warranty Expiry</Text>
                <Text fontSize="md" fontWeight="medium">
                  {asset.warranty_expiry ? new Date(asset.warranty_expiry).toLocaleDateString() : 'N/A'}
                </Text>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.500">Status</Text>
                {asset.warranty_expiry ? (
                  <Badge 
                    colorScheme={new Date(asset.warranty_expiry) > new Date() ? 'green' : 'red'}
                  >
                    {new Date(asset.warranty_expiry) > new Date() ? 'Active' : 'Expired'}
                  </Badge>
                ) : (
                  <Badge colorScheme="gray">Unknown</Badge>
                )}
              </Box>
            </Grid>
          </CardBody>
        </Card>

        {/* Notes */}
        {asset.notes && (
          <Card>
            <CardHeader>
              <Text fontSize="lg" fontWeight="semibold">Notes</Text>
            </CardHeader>
            <CardBody>
              <Text>{asset.notes}</Text>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  );
};

export default SimpleAssetDetail; 