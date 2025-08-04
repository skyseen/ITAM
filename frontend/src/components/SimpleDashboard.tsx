import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  VStack,
  HStack,
  Text,
  Box,
  Card,
  CardBody,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  Button,
  Progress,
  Flex,
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react';
import {
  ViewIcon,
  CheckIcon,
  WarningIcon,
  TimeIcon,
  InfoIcon,
} from '@chakra-ui/icons';
import { useAssets } from '../contexts/AssetContext';
import { useAuth } from '../contexts/AuthContext';

const SimpleDashboard: React.FC = () => {
  const { assets, dashboardData, fetchAssets, fetchDashboardData } = useAssets();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssets();
    fetchDashboardData();
  }, [fetchAssets, fetchDashboardData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'green';
      case 'in_use': return 'blue';
      case 'maintenance': return 'orange';
      case 'retired': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckIcon />;
      case 'in_use': return <ViewIcon />;
      case 'maintenance': return <WarningIcon />;
      case 'retired': return <TimeIcon />;
      default: return <InfoIcon />;
    }
  };

  const totalAssets = assets.length;
  const availableAssets = assets.filter((a: any) => a.status === 'available').length;
  const inUseAssets = assets.filter((a: any) => a.status === 'in_use').length;
  const maintenanceAssets = assets.filter((a: any) => a.status === 'maintenance').length;

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Text fontSize="3xl" fontWeight="bold" mb={2}>
            Asset Management Dashboard
          </Text>
          <Text fontSize="lg" color="gray.600">
            Welcome back, {user?.username}! Here's your asset overview.
          </Text>
        </Box>

        {/* Main Stats */}
        <Grid templateColumns="repeat(4, 1fr)" gap={6}>
          <GridItem>
            <Card 
              cursor="pointer" 
              _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
              onClick={() => navigate('/assets')}
            >
              <CardBody>
                <Stat>
                  <StatLabel>Total Assets</StatLabel>
                  <StatNumber fontSize="3xl">{totalAssets}</StatNumber>
                  <StatHelpText>All managed assets</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card 
              cursor="pointer" 
              _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
              onClick={() => navigate('/assets?status=available')}
            >
              <CardBody>
                <Stat>
                  <StatLabel>Available</StatLabel>
                  <StatNumber fontSize="3xl" color="green.500">{availableAssets}</StatNumber>
                  <StatHelpText>Ready for assignment</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card 
              cursor="pointer" 
              _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
              onClick={() => navigate('/assets?status=in_use')}
            >
              <CardBody>
                <Stat>
                  <StatLabel>In Use</StatLabel>
                  <StatNumber fontSize="3xl" color="blue.500">{inUseAssets}</StatNumber>
                  <StatHelpText>Currently assigned</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card 
              cursor="pointer" 
              _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
              onClick={() => navigate('/assets?status=maintenance')}
            >
              <CardBody>
                <Stat>
                  <StatLabel>Maintenance</StatLabel>
                  <StatNumber fontSize="3xl" color="orange.500">{maintenanceAssets}</StatNumber>
                  <StatHelpText>Needs attention</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Asset Status Distribution */}
        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <GridItem>
            <Card>
              <CardBody>
                <Text fontSize="lg" fontWeight="semibold" mb={4}>
                  Asset Status Overview
                </Text>
                <VStack spacing={4} align="stretch">
                  {['available', 'pending_for_signature', 'in_use', 'maintenance', 'retired'].map((status) => {
                    const count = assets.filter((a: any) => a.status === status).length;
                    const percentage = totalAssets > 0 ? (count / totalAssets) * 100 : 0;
                    
                    return (
                      <Box key={status}>
                        <Flex justify="space-between" mb={2}>
                          <HStack>
                            {getStatusIcon(status)}
                            <Text fontSize="sm" fontWeight="medium">
                              {status.replace('_', ' ').toUpperCase()}
                            </Text>
                          </HStack>
                          <Text fontSize="sm" fontWeight="bold">
                            {count} ({percentage.toFixed(1)}%)
                          </Text>
                        </Flex>
                        <Progress 
                          value={percentage} 
                          size="sm" 
                          colorScheme={getStatusColor(status)}
                        />
                      </Box>
                    );
                  })}
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card>
              <CardBody>
                <Text fontSize="lg" fontWeight="semibold" mb={4}>
                  Asset Types
                </Text>
                <VStack spacing={3} align="stretch">
                  {Object.entries(
                    assets.reduce((acc: Record<string, number>, asset: any) => {
                      acc[asset.type] = (acc[asset.type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => (
                    <Flex key={type} justify="space-between" align="center">
                      <Text fontSize="sm" fontWeight="medium">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                      <Badge colorScheme="blue" variant="solid">
                        {String(count)}
                      </Badge>
                    </Flex>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Recent Activity */}
        <Card>
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4}>
              Recent Activity
            </Text>
            <VStack spacing={4} align="stretch">
              {assets
                .filter((asset: any) => asset.status === 'in_use' && asset.assigned_user_name)
                .slice(0, 5)
                .map((asset: any) => (
                  <Flex key={asset.id} justify="space-between" align="center" p={3} bg="gray.50" borderRadius="md">
                    <HStack spacing={3}>
                      <CheckIcon color="green.500" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium">
                          {asset.asset_id} ({asset.type}) issued to {asset.assigned_user_name}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          Department: {asset.department}
                        </Text>
                      </VStack>
                    </HStack>
                    <Badge colorScheme="green" size="sm">
                      In Use
                    </Badge>
                  </Flex>
                ))}
              
              {assets.filter((asset: any) => asset.status === 'in_use' && asset.assigned_user_name).length === 0 && (
                <Text color="gray.500" textAlign="center" py={4}>
                  No recent asset assignments found
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default SimpleDashboard; 