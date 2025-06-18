/**
 * FuturisticDashboard Component - Next-Gen Asset Management Overview
 * 
 * A modern, interactive dashboard with glass-morphism design, clickable elements,
 * and visual data representations for better insights.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Progress,
  CircularProgress,
  CircularProgressLabel,
  Flex,
  Icon,
  Avatar,
  useColorModeValue,
  Skeleton,
  Tooltip,
  SimpleGrid,
} from '@chakra-ui/react';
// Using Chakra UI icons instead of react-icons for better compatibility
import { 
  ViewIcon, 
  ArrowForwardIcon, 
  InfoIcon, 
  WarningIcon, 
  TimeIcon,
  SettingsIcon,
  CheckCircleIcon,
  AtSignIcon,
  StarIcon,
  BellIcon
} from '@chakra-ui/icons';
import { useAssets } from '../../contexts/AssetContext';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Interactive Stat Card Component
 */
interface InteractiveStatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: any;
  color: string;
  onClick?: () => void;
  percentage?: number;
  trend?: 'up' | 'down' | 'neutral';
}

const InteractiveStatCard: React.FC<InteractiveStatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  onClick,
  percentage,
  trend = 'neutral'
}) => {
  const cardBg = useColorModeValue(
    'rgba(255, 255, 255, 0.1)',
    'rgba(45, 55, 72, 0.1)'
  );
  
  const glassEffect = {
    bg: cardBg,
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: '1px solid',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.3s ease',
    _hover: onClick ? {
      transform: 'translateY(-5px)',
      boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.5)',
      borderColor: `${color}.300`,
    } : {},
  };

  return (
    <Card {...glassEffect} onClick={onClick}>
      <CardBody>
        <HStack justify="space-between" mb={4}>
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" color="gray.300">{title}</Text>
            <Heading size="lg" color="white" fontWeight="bold">
              {value}
            </Heading>
            {subtitle && (
              <Text fontSize="xs" color="gray.400">{subtitle}</Text>
            )}
          </VStack>
          <Box p={3} bg={`${color}.100`} borderRadius="full">
            <Icon as={icon} w={6} h={6} color={`${color}.500`} />
          </Box>
        </HStack>
        
        {percentage !== undefined && (
          <VStack align="stretch" spacing={2}>
            <Progress 
              value={percentage} 
              colorScheme={color} 
              size="sm" 
              borderRadius="full"
              bg="rgba(255,255,255,0.1)"
            />
            <HStack justify="space-between">
              <Text fontSize="xs" color="gray.400">Progress</Text>
              <Text fontSize="xs" color={`${color}.300`}>{percentage}%</Text>
            </HStack>
          </VStack>
        )}
        
        {onClick && (
          <Flex justify="flex-end" mt={2}>
            <ArrowForwardIcon color="gray.400" />
          </Flex>
        )}
      </CardBody>
    </Card>
  );
};

/**
 * Circular Progress Card for Asset Status
 */
interface CircularStatCardProps {
  title: string;
  data: Record<string, number>;
  total: number;
  onClick?: (status: string) => void;
}

const CircularStatCard: React.FC<CircularStatCardProps> = ({ title, data, total, onClick }) => {
  const cardBg = useColorModeValue(
    'rgba(255, 255, 255, 0.1)',
    'rgba(45, 55, 72, 0.1)'
  );
  
  const glassEffect = {
    bg: cardBg,
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: '1px solid',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  };

  const statusColors = {
    available: 'green',
    in_use: 'blue',
    maintenance: 'orange',
    retired: 'gray',
  };

  const getPercentage = (value: number) => (value / total) * 100;

  return (
    <Card {...glassEffect}>
      <CardHeader>
        <HStack>
          <InfoIcon color="purple.300" />
          <Heading size="md" color="white">{title}</Heading>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={6}>
          <Box position="relative">
            <CircularProgress
              value={getPercentage(data.available || 0)}
              color="green.400"
              trackColor="rgba(255,255,255,0.1)"
              size="120px"
              thickness="8px"
            >
              <CircularProgressLabel color="white" fontSize="lg" fontWeight="bold">
                {total}
              </CircularProgressLabel>
            </CircularProgress>
          </Box>
          
          <VStack spacing={3} w="100%">
            {Object.entries(data).map(([status, count]) => (
              <HStack
                key={status}
                justify="space-between"
                w="100%"
                p={2}
                borderRadius="md"
                bg="rgba(255,255,255,0.05)"
                cursor={onClick ? "pointer" : "default"}
                _hover={onClick ? { bg: "rgba(255,255,255,0.1)" } : {}}
                onClick={() => onClick?.(status)}
              >
                <HStack>
                  <Box
                    w={3}
                    h={3}
                    borderRadius="full"
                    bg={`${statusColors[status as keyof typeof statusColors] || 'gray'}.400`}
                  />
                  <Text color="gray.300" fontSize="sm" textTransform="capitalize">
                    {status.replace('_', ' ')}
                  </Text>
                </HStack>
                <Badge 
                  colorScheme={statusColors[status as keyof typeof statusColors] || 'gray'}
                  variant="subtle"
                >
                  {count}
                </Badge>
              </HStack>
            ))}
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

/**
 * Activity Feed Component
 */
interface ActivityFeedProps {
  activities: any[];
  onViewAll?: () => void;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, onViewAll }) => {
  const cardBg = useColorModeValue(
    'rgba(255, 255, 255, 0.1)',
    'rgba(45, 55, 72, 0.1)'
  );
  
  const glassEffect = {
    bg: cardBg,
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: '1px solid',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  };

  return (
    <Card {...glassEffect}>
      <CardHeader>
        <HStack justify="space-between">
          <HStack>
            <TimeIcon color="cyan.300" boxSize={5} />
            <Heading size="md" color="white">Recent Activity</Heading>
          </HStack>
          <Button
            size="sm"
            variant="ghost"
            rightIcon={<ViewIcon />}
            color="cyan.300"
            onClick={onViewAll}
            _hover={{ bg: 'rgba(0, 255, 255, 0.1)' }}
          >
            View All
          </Button>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {activities.length === 0 ? (
            <Text color="gray.400" textAlign="center" py={4}>
              No recent activity
            </Text>
          ) : (
            activities.slice(0, 5).map((activity, index) => (
              <HStack 
                key={index} 
                p={3} 
                bg="rgba(255,255,255,0.05)" 
                borderRadius="md"
                spacing={3}
              >
                <Avatar size="sm" name={activity.user_name} bg="cyan.500" />
                <VStack align="start" spacing={0} flex={1}>
                  <Text color="white" fontSize="sm" fontWeight="medium">
                    {activity.asset_id} → {activity.user_name}
                  </Text>
                  <Text color="gray.400" fontSize="xs">
                    {new Date(activity.issued_date).toLocaleDateString()}
                  </Text>
                </VStack>
                <Badge colorScheme="cyan" variant="subtle">
                  Assigned
                </Badge>
              </HStack>
            ))
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

/**
 * Main Dashboard Component
 */
const FuturisticDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { dashboardData, fetchDashboardData, loading } = useAssets();
  const { user } = useAuth();

  // Glass-morphism background gradient
  const bgGradient = useColorModeValue(
    'linear(to-br, purple.900, blue.800, teal.700)',
    'linear(to-br, gray.900, purple.900, blue.900)'
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading || !dashboardData) {
    return (
      <Box minH="100vh" bgGradient={bgGradient}>
        <Container maxW="8xl" py={8}>
          <VStack spacing={8}>
            <Skeleton height="100px" width="100%" borderRadius="20px" />
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="100%">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} height="150px" borderRadius="20px" />
              ))}
            </SimpleGrid>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} w="100%">
              <Skeleton height="400px" borderRadius="20px" />
              <Skeleton height="400px" borderRadius="20px" />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>
    );
  }

  const handleAssetFilter = (status?: string, asset_type?: string, department?: string) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (asset_type) params.set('asset_type', asset_type);
    if (department) params.set('department', department);
    navigate(`/assets?${params.toString()}`);
  };

  const scrappedAssets = dashboardData.assets_by_status.retired || 0;

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW="8xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header Section */}
          <VStack spacing={4} align="start">
            <Heading color="white" size="xl" fontWeight="bold">
              Welcome back, {user?.full_name}! 🚀
            </Heading>
            <Text color="gray.200" fontSize="lg">
              Here's your asset management overview for today
            </Text>
          </VStack>

          {/* Quick Stats Grid */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <InteractiveStatCard
              title="Total Assets"
              value={dashboardData.total_assets}
              subtitle="Across all departments"
              icon={SettingsIcon}
              color="blue"
              onClick={() => navigate('/assets')}
              percentage={100}
            />
            
            <InteractiveStatCard
              title="Available Assets"
              value={dashboardData.assets_by_status.available || 0}
              subtitle="Ready for assignment"
              icon={CheckCircleIcon}
              color="green"
              onClick={() => handleAssetFilter('available')}
              percentage={((dashboardData.assets_by_status.available || 0) / dashboardData.total_assets) * 100}
            />
            
            <InteractiveStatCard
              title="Assets in Use"
              value={dashboardData.assets_by_status.in_use || 0}
              subtitle="Currently assigned"
              icon={AtSignIcon}
              color="purple"
              onClick={() => handleAssetFilter('in_use')}
              percentage={((dashboardData.assets_by_status.in_use || 0) / dashboardData.total_assets) * 100}
            />
            
            <InteractiveStatCard
              title="Scrapped Assets"
              value={scrappedAssets}
              subtitle="Retired from service"
              icon={WarningIcon}
              color="red"
              onClick={() => handleAssetFilter('retired')}
              percentage={((scrappedAssets) / dashboardData.total_assets) * 100}
            />
          </SimpleGrid>

          {/* Charts and Activity Section */}
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr 1fr' }} gap={8}>
            {/* Asset Status Distribution */}
            <CircularStatCard
              title="Asset Status"
              data={dashboardData.assets_by_status}
              total={dashboardData.total_assets}
              onClick={(status) => handleAssetFilter(status)}
            />

            {/* Asset Types Distribution */}
            <Card
              bg="rgba(255, 255, 255, 0.1)"
              backdropFilter="blur(10px)"
              borderRadius="20px"
              border="1px solid rgba(255, 255, 255, 0.1)"
              boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
            >
              <CardHeader>
                <HStack>
                  <InfoIcon color="teal.300" />
                  <Heading size="md" color="white">Asset Types</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  {Object.entries(dashboardData.assets_by_type).map(([type, count]) => (
                    <HStack
                      key={type}
                      justify="space-between"
                      w="100%"
                      p={3}
                      bg="rgba(255,255,255,0.05)"
                      borderRadius="md"
                      cursor="pointer"
                      _hover={{ bg: "rgba(255,255,255,0.1)" }}
                      onClick={() => handleAssetFilter(undefined, type)}
                    >
                      <Text color="gray.300">{type}</Text>
                      <Badge colorScheme="teal">{count}</Badge>
                    </HStack>
                  ))}
                </VStack>
              </CardBody>
            </Card>

            {/* Recent Activity */}
            <ActivityFeed
              activities={dashboardData.recent_issuances}
              onViewAll={() => navigate('/assets?status=in_use')}
            />
          </Grid>

          {/* Department Distribution */}
          <Card
            bg="rgba(255, 255, 255, 0.1)"
            backdropFilter="blur(10px)"
            borderRadius="20px"
            border="1px solid rgba(255, 255, 255, 0.1)"
            boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
          >
            <CardHeader>
              <HStack justify="space-between">
                <HStack>
                  <ViewIcon color="pink.300" />
                  <Heading size="md" color="white">Department Distribution</Heading>
                </HStack>
                <Button
                  size="sm"
                  variant="ghost"
                  rightIcon={<ViewIcon />}
                  color="pink.300"
                  onClick={() => navigate('/assets')}
                  _hover={{ bg: 'rgba(236, 72, 153, 0.1)' }}
                >
                  View All Assets
                </Button>
              </HStack>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={4}>
                {Object.entries(dashboardData.assets_by_department).map(([dept, count]) => (
                  <VStack
                    key={dept}
                    p={4}
                    bg="rgba(255,255,255,0.05)"
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ bg: "rgba(255,255,255,0.1)", transform: 'translateY(-2px)' }}
                    transition="all 0.2s"
                    onClick={() => handleAssetFilter(undefined, undefined, dept)}
                  >
                    <Text color="white" fontWeight="bold" fontSize="lg">{count}</Text>
                    <Text color="gray.300" fontSize="sm" textAlign="center">{dept}</Text>
                  </VStack>
                ))}
              </SimpleGrid>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default FuturisticDashboard; 