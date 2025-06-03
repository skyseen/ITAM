/**
 * Dashboard Component - Main overview page for the IT Asset Management System
 * 
 * This component serves as the primary landing page after user authentication,
 * providing a comprehensive overview of the organization's IT assets. It displays
 * key metrics, charts, and alerts to give users immediate insight into asset
 * status and recent activity.
 * 
 * Features:
 * - Real-time asset status visualization with charts
 * - Quick access to recent asset issuances
 * - Warranty expiration alerts
 * - Idle asset notifications
 * - Responsive design for all screen sizes
 * 
 * Data Sources:
 * - Asset status distribution (available, in-use, maintenance, retired)
 * - Asset type breakdown (laptops, monitors, servers, etc.)
 * - Department-wise asset allocation
 * - Recent issuance activities
 * - System notifications and alerts
 * 
 * @author IT Asset Management System
 * @version 1.0.0
 */

import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Heading,
  Card,
  CardBody,
  Text,
  Badge,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';

// Import context for asset data management
import { useAssets } from '../../contexts/AssetContext';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Status color mapping for visual consistency
 * Maps asset statuses to Chakra UI color schemes for badges and indicators
 */
const STATUS_COLORS = {
  available: 'green',    // Available assets - ready for use
  in_use: 'blue',       // Assets currently assigned to users
  maintenance: 'orange', // Assets under repair or maintenance
  retired: 'gray',      // End-of-life assets
} as const;

/**
 * Quick statistics card component for displaying key metrics
 * 
 * @param title - The metric title (e.g., "Total Assets")
 * @param value - The numeric value to display
 * @param helpText - Additional context or description
 */
interface QuickStatProps {
  title: string;
  value: number | string;
  helpText?: string;
}

const QuickStat: React.FC<QuickStatProps> = ({ title, value, helpText }) => {
  // Use theme colors for consistent styling
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
      <CardBody>
        <Stat>
          <StatLabel fontSize="sm" color="gray.500">
            {title}
          </StatLabel>
          <StatNumber fontSize="2xl" fontWeight="bold">
            {value}
          </StatNumber>
          {helpText && (
            <StatHelpText fontSize="xs" color="gray.400">
              {helpText}
            </StatHelpText>
          )}
        </Stat>
      </CardBody>
    </Card>
  );
};

/**
 * Asset status breakdown component
 * Displays the distribution of assets across different statuses
 * 
 * @param statusData - Object containing asset counts by status
 */
interface StatusBreakdownProps {
  statusData: Record<string, number>;
}

const StatusBreakdown: React.FC<StatusBreakdownProps> = ({ statusData }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" h="100%">
      <CardBody>
        <Heading size="md" mb={4}>Asset Status Distribution</Heading>
        <VStack spacing={3} align="stretch">
          {Object.entries(statusData).map(([status, count]) => (
            <HStack key={status} justify="space-between">
              <HStack>
                <Badge 
                  colorScheme={STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'gray'}
                  variant="solid"
                  size="sm"
                >
                  {status.replace('_', ' ').toUpperCase()}
                </Badge>
              </HStack>
              <Text fontWeight="semibold">{count}</Text>
            </HStack>
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
};

/**
 * Recent activity component showing latest asset issuances
 * Helps users track recent asset assignments and system activity
 * 
 * @param recentIssuances - Array of recent asset issuance records
 */
interface RecentActivityProps {
  recentIssuances: any[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ recentIssuances }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const itemBg = useColorModeValue('gray.50', 'gray.600');

  return (
    <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" h="100%">
      <CardBody>
        <Heading size="md" mb={4}>Recent Asset Issuances</Heading>
        <VStack spacing={3} align="stretch" maxH="300px" overflowY="auto">
          {recentIssuances.length > 0 ? (
            recentIssuances.map((issuance, index) => (
              <Box 
                key={issuance.id || index} 
                p={3} 
                borderRadius="md" 
                bg={itemBg}
              >
                <HStack justify="space-between" mb={1}>
                  <Text fontWeight="semibold" fontSize="sm">
                    Asset #{issuance.asset_id}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {new Date(issuance.issued_date).toLocaleDateString()}
                  </Text>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  Issued to: {issuance.user_name}
                </Text>
                {issuance.notes && (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {issuance.notes}
                  </Text>
                )}
              </Box>
            ))
          ) : (
            <Text color="gray.500" textAlign="center" py={4}>
              No recent issuances
            </Text>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

/**
 * Alerts section component for displaying important notifications
 * Shows warranty expiration warnings and idle asset alerts
 * 
 * @param warrantyAlerts - Assets with warranties expiring soon
 * @param idleAssets - Assets that have been idle for an extended period
 */
interface AlertsSectionProps {
  warrantyAlerts: any[];
  idleAssets: any[];
}

const AlertsSection: React.FC<AlertsSectionProps> = ({ warrantyAlerts, idleAssets }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" h="100%">
      <CardBody>
        <Heading size="md" mb={4}>System Alerts</Heading>
        <VStack spacing={3} align="stretch">
          
          {/* Warranty Expiration Alerts */}
          {warrantyAlerts.length > 0 && (
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Warranty Expiring Soon!</AlertTitle>
                <AlertDescription>
                  {warrantyAlerts.length} asset(s) have warranties expiring within 30 days.
                  <VStack mt={2} spacing={1} align="start">
                    {warrantyAlerts.slice(0, 3).map((asset, index) => (
                      <Text key={asset.id || index} fontSize="sm">
                        • {asset.asset_id} - {asset.brand} {asset.model}
                      </Text>
                    ))}
                    {warrantyAlerts.length > 3 && (
                      <Text fontSize="sm" color="gray.600">
                        ...and {warrantyAlerts.length - 3} more
                      </Text>
                    )}
                  </VStack>
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Idle Assets Alerts */}
          {idleAssets.length > 0 && (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Idle Assets Detected</AlertTitle>
                <AlertDescription>
                  {idleAssets.length} asset(s) have been idle for more than 30 days.
                  <VStack mt={2} spacing={1} align="start">
                    {idleAssets.slice(0, 3).map((asset, index) => (
                      <Text key={asset.id || index} fontSize="sm">
                        • {asset.asset_id} - {asset.brand} {asset.model}
                      </Text>
                    ))}
                    {idleAssets.length > 3 && (
                      <Text fontSize="sm" color="gray.600">
                        ...and {idleAssets.length - 3} more
                      </Text>
                    )}
                  </VStack>
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* No Alerts State */}
          {warrantyAlerts.length === 0 && idleAssets.length === 0 && (
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>All Systems Normal</AlertTitle>
                <AlertDescription>
                  No warranty or idle asset alerts at this time.
                </AlertDescription>
              </Box>
            </Alert>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

/**
 * Main Dashboard Component
 * 
 * This is the primary component that orchestrates the entire dashboard view.
 * It fetches data from the API through the AssetContext and renders various
 * sub-components to provide a comprehensive overview of the system.
 */
const Dashboard: React.FC = () => {
  // Get current user information for personalization
  const { user } = useAuth();
  
  // Access asset data and functions from context
  const { dashboardData, loading, fetchDashboardData } = useAssets();

  /**
   * Fetch dashboard data on component mount
   * This ensures we have the latest information when the user views the dashboard
   */
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Show loading spinner while data is being fetched
  if (loading || !dashboardData) {
    return (
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="center" minH="400px" justify="center">
          <Spinner size="xl" color="blue.500" />
          <Text>Loading dashboard data...</Text>
        </VStack>
      </Container>
    );
  }

  // Extract data for easier access in render
  const {
    total_assets,
    assets_by_status,
    assets_by_type,
    assets_by_department,
    recent_issuances,
    warranty_alerts,
    idle_assets,
  } = dashboardData;

  return (
    <Container maxW="7xl" py={8}>
      {/* Welcome Header */}
      <VStack spacing={6} align="start" mb={8}>
        <Heading size="lg">
          Welcome back, {user?.full_name || 'User'}!
        </Heading>
        <Text color="gray.600">
          Here's an overview of your IT assets and recent activity.
        </Text>
      </VStack>

      {/* Quick Statistics Row */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6} mb={8}>
        <QuickStat 
          title="Total Assets" 
          value={total_assets} 
          helpText="All assets in the system"
        />
        <QuickStat 
          title="Available" 
          value={assets_by_status.available || 0} 
          helpText="Ready for assignment"
        />
        <QuickStat 
          title="In Use" 
          value={assets_by_status.in_use || 0} 
          helpText="Currently assigned"
        />
        <QuickStat 
          title="Maintenance" 
          value={assets_by_status.maintenance || 0} 
          helpText="Under repair"
        />
      </Grid>

      {/* Main Content Grid */}
      <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6} mb={8}>
        {/* Asset Status Distribution */}
        <StatusBreakdown statusData={assets_by_status} />
        
        {/* Recent Activity */}
        <RecentActivity recentIssuances={recent_issuances} />
      </Grid>

      {/* Alerts Section - Full Width */}
      <Box mb={6}>
        <AlertsSection 
          warrantyAlerts={warranty_alerts} 
          idleAssets={idle_assets} 
        />
      </Box>

      {/* Asset Type and Department Breakdown */}
      <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
        {/* Asset Types */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Assets by Type</Heading>
            <VStack spacing={2} align="stretch">
              {Object.entries(assets_by_type).map(([type, count]) => (
                <HStack key={type} justify="space-between">
                  <Text textTransform="capitalize">{type}</Text>
                  <Badge colorScheme="blue" variant="solid">
                    {count}
                  </Badge>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Assets by Department</Heading>
            <VStack spacing={2} align="stretch">
              {Object.entries(assets_by_department).map(([dept, count]) => (
                <HStack key={dept} justify="space-between">
                  <Text>{dept}</Text>
                  <Badge colorScheme="purple" variant="solid">
                    {count}
                  </Badge>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </Grid>
    </Container>
  );
};

export default Dashboard; 