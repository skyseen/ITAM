/**
 * FuturisticDashboard Component - Next-Gen Asset Management Overview
 * 
 * A modern, interactive dashboard with glass-morphism design, clickable elements,
 * and visual data representations for better insights.
 */

import React, { useEffect } from 'react';
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
  CircularProgress,
  CircularProgressLabel,
  Avatar,
  useColorModeValue,
  Skeleton,
  SimpleGrid,
} from '@chakra-ui/react';
// Using Chakra UI icons instead of react-icons for better compatibility
import { 
  ViewIcon, 
  InfoIcon, 
  TimeIcon
} from '@chakra-ui/icons';
import { useAssets } from '../../contexts/AssetContext';
import { useAuth } from '../../contexts/AuthContext';
import PendingAssetsWidget from './PendingAssetsWidget';



/**
 * Circular Progress Card for Asset Status
 */
interface CircularStatCardProps {
  title: string;
  data: Record<string, number>;
  total: number;
  onClick?: (status: string) => void;
  onTotalClick?: () => void;
}

const CircularStatCard: React.FC<CircularStatCardProps> = ({ title, data, total, onClick, onTotalClick }) => {
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

  // Define all possible asset statuses with their display names and colors
  const allStatuses = [
    { key: 'total', label: 'Total Assets', color: 'purple', value: total },
    { key: 'available', label: 'Available', color: 'green', value: data.available || 0 },
    { key: 'pending_for_signature', label: 'Pending Signature', color: 'yellow', value: data.pending_for_signature || 0 },
    { key: 'in_use', label: 'In Use', color: 'blue', value: data.in_use || 0 },
    { key: 'maintenance', label: 'Maintenance', color: 'orange', value: data.maintenance || 0 },
    { key: 'retired', label: 'Scrapped', color: 'gray', value: data.retired || 0 },
  ];

  const getPercentage = (value: number) => total > 0 ? (value / total) * 100 : 0;

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
            <Text color="gray.300" fontSize="xs" textAlign="center" mt={2}>
              Total Assets
            </Text>
          </Box>
          
          <VStack spacing={3} w="100%">
            {allStatuses.map((status) => (
              <HStack
                key={status.key}
                justify="space-between"
                w="100%"
                p={3}
                borderRadius="md"
                bg="rgba(255,255,255,0.05)"
                cursor={onClick || (status.key === 'total' && onTotalClick) ? "pointer" : "default"}
                _hover={onClick || (status.key === 'total' && onTotalClick) ? { bg: "rgba(255,255,255,0.1)" } : {}}
                onClick={() => {
                  if (status.key === 'total' && onTotalClick) {
                    onTotalClick();
                  } else if (status.key !== 'total' && onClick) {
                    onClick(status.key);
                  }
                }}
                transition="all 0.2s"
              >
                <HStack>
                  <Box
                    w={3}
                    h={3}
                    borderRadius="full"
                    bg={`${status.color}.400`}
                  />
                  <Text color="gray.300" fontSize="sm" fontWeight="medium">
                    {status.label}
                  </Text>
                </HStack>
                <VStack spacing={0} align="end">
                  <Badge 
                    colorScheme={status.color}
                    variant="subtle"
                    fontSize="sm"
                  >
                    {status.value}
                  </Badge>
                  {status.key !== 'total' && total > 0 && (
                    <Text color="gray.400" fontSize="xs">
                      {getPercentage(status.value).toFixed(1)}%
                    </Text>
                  )}
                </VStack>
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
          {onViewAll && (
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
          )}
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {activities.length === 0 ? (
            <Text color="gray.400" textAlign="center" py={4}>
              No recent activity
            </Text>
          ) : (
            activities.slice(0, 5).map((activity, index) => {
              // Map actions to colors
              const getActionColor = (action: string) => {
                switch (action.toLowerCase()) {
                  case 'create': return 'green';
                  case 'update': return 'blue';
                  case 'delete': return 'red';
                  case 'assign': return 'purple';
                  case 'unassign': return 'orange';
                  case 'status_change': return 'teal';
                  case 'sign_document': return 'cyan';
                  case 'cancel_issuance': return 'red';
                  default: return 'gray';
                }
              };

              // Format timestamp to relative time
              const formatTimestamp = (timestamp: string) => {
                const date = new Date(timestamp);
                const now = new Date();
                const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
                
                if (diffInMinutes < 1) return 'Just now';
                if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
                
                const diffInHours = Math.floor(diffInMinutes / 60);
                if (diffInHours < 24) return `${diffInHours}h ago`;
                
                const diffInDays = Math.floor(diffInHours / 24);
                if (diffInDays < 7) return `${diffInDays}d ago`;
                
                return date.toLocaleDateString();
              };

              return (
                <HStack 
                  key={activity.id || index} 
                  p={3} 
                  bg="rgba(255,255,255,0.05)" 
                  borderRadius="md"
                  spacing={3}
                >
                  <Avatar size="sm" name={activity.user_name} bg="cyan.500" />
                  <VStack align="start" spacing={0} flex={1}>
                    <Text color="white" fontSize="sm" fontWeight="medium">
                      {activity.description}
                    </Text>
                    <Text color="gray.400" fontSize="xs">
                      {formatTimestamp(activity.timestamp)} • {activity.user_name}
                    </Text>
                  </VStack>
                  <Badge colorScheme={getActionColor(activity.action)} variant="subtle">
                    {activity.action.replace('_', ' ').toUpperCase()}
                  </Badge>
                </HStack>
              );
            })
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
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} w="100%">
              <Skeleton height="400px" borderRadius="20px" />
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

  const handleAssetTypeNavigation = (type: string) => {
    const lowerType = type.toLowerCase().trim();
    
    // Navigate to specific pages for servers and network appliances
    if (lowerType === 'server') {
      // Server page only has servers, no filtering needed
      navigate('/servers');
    } else if (['router', 'firewall', 'switch'].includes(lowerType)) {
      // Network appliances page with filter for specific type
      navigate(`/network-appliances?type=${lowerType}`);
    } else if (['desktop', 'laptop', 'tablet'].includes(lowerType)) {
      // For user assets (laptop, desktop, tablet), go to assets page with filter
      const params = new URLSearchParams();
      params.set('asset_type', lowerType.toUpperCase());
      navigate(`/assets?${params.toString()}`);
    } else {
      // Fallback to assets page for unknown types
      navigate('/assets');
    }
  };

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



          {/* Charts and Activity Section */}
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr 1fr' }} gap={8}>
            {/* User Asset Status Distribution */}
            <CircularStatCard
              title="User Asset Status"
              data={dashboardData.assets_by_status}
              total={dashboardData.total_assets}
              onClick={(status) => handleAssetFilter(status)}
              onTotalClick={() => navigate('/assets')}
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
                  {(() => {
                    // Define all asset types with their display labels
                    const allAssetTypes = [
                      { key: 'desktop', type: 'DESKTOP', label: 'DESKTOP (User Assets)' },
                      { key: 'laptop', type: 'LAPTOP', label: 'LAPTOP (User Assets)' },
                      { key: 'tablet', type: 'TABLET', label: 'TABLET (User Assets)' },
                      { key: 'server', type: 'SERVER', label: 'SERVER' },
                      { key: 'router', type: 'ROUTER', label: 'ROUTER' },
                      { key: 'firewall', type: 'FIREWALL', label: 'FIREWALL' },
                      { key: 'switch', type: 'SWITCH', label: 'SWITCH' }
                    ];
                    
                    return allAssetTypes.map(({ key, type, label }) => {
                      const count = dashboardData.assets_by_type[type] || 0;
                      
                      return (
                        <HStack
                          key={key}
                          justify="space-between"
                          w="100%"
                          p={3}
                          bg="rgba(255,255,255,0.05)"
                          borderRadius="md"
                          cursor="pointer"
                          _hover={{ bg: "rgba(255,255,255,0.1)" }}
                          onClick={() => handleAssetTypeNavigation(key)}
                          transition="all 0.2s"
                        >
                          <Text color="gray.300" fontSize="sm">{label}</Text>
                          <Badge colorScheme="teal">{count}</Badge>
                        </HStack>
                      );
                    });
                  })()}
                </VStack>
              </CardBody>
            </Card>

            {/* Recent Activity */}
            <ActivityFeed
              activities={dashboardData.recent_activities}
            />
          </Grid>

          {/* Pending Assets Widget */}
          <Box maxW="600px" mx="auto">
            <PendingAssetsWidget />
          </Box>

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