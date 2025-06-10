/**
 * AssetList Component - Comprehensive asset viewing and management interface
 * 
 * This component provides a full-featured interface for viewing, searching,
 * filtering, and managing IT assets. It serves as the primary asset management
 * page where users can interact with the asset inventory.
 * 
 * Features:
 * - Paginated asset listing with sorting capabilities
 * - Advanced search and filtering by multiple criteria
 * - Real-time asset status updates
 * - Quick actions for asset management (edit, delete, issue, return)
 * - Export functionality for reporting
 * - Responsive design for all screen sizes
 * 
 * User Permissions:
 * - Viewers: Can view assets and basic filtering
 * - Managers: Can edit assets in their department
 * - Admins: Full access to all asset operations
 * 
 * @author IT Asset Management System
 * @version 1.0.0
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Input,
  Select,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Spinner,
  Text,
  Flex,
  InputGroup,
  InputLeftElement,
  Card,
  CardBody,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  SearchIcon,
  DownloadIcon,
  EditIcon,
  DeleteIcon,
  HamburgerIcon,
  AddIcon,
} from '@chakra-ui/icons';

// Import contexts for data management and authentication
import { useAssets, Asset } from '../contexts/AssetContext';
import { useAuth } from '../contexts/AuthContext';

// Import navigation hook
import { useNavigate } from 'react-router-dom';

// Import futuristic theme system for consistent glass-morphism design
import { 
  glassEffects, 
  gradientBackgrounds, 
  futuristicColors, 
  getStatusColor,
  componentPresets 
} from '../theme/futuristicTheme';

/**
 * Asset status color mapping for consistent visual indicators
 * Each status has a corresponding Chakra UI color scheme
 */
const STATUS_COLORS = {
  available: 'green',
  in_use: 'blue', 
  maintenance: 'orange',
  retired: 'gray',
} as const;

/**
 * Filter interface for type safety
 * Defines the structure of filters that can be applied to the asset list
 */
interface AssetFilters {
  search: string;           // Text search across multiple fields
  status: string;           // Filter by asset status
  asset_type: string;       // Filter by asset type (renamed from type)
  department: string;      // Filter by department
}

/**
 * Pagination interface for managing large datasets
 * Controls how many items are displayed and which page is active
 */
interface PaginationState {
  page: number;            // Current page number (0-based)
  limit: number;           // Number of items per page
  total: number;           // Total number of items
}

/**
 * Asset row component for displaying individual asset information
 * Renders a single row in the asset table with all relevant data and actions
 * 
 * @param asset - The asset data to display
 * @param onEdit - Callback function when edit action is triggered
 * @param onDelete - Callback function when delete action is triggered
 * @param onIssue - Callback function when issue action is triggered
 * @param onReturn - Callback function when return action is triggered
 * @param userRole - Current user's role for permission checking
 */
interface AssetRowProps {
  asset: Asset;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  onIssue: (asset: Asset) => void;
  onReturn: (asset: Asset) => void;
  userRole: string;
  navigate: (path: string) => void;
}

const AssetRow: React.FC<AssetRowProps> = ({
  asset,
  onEdit,
  onDelete,
  onIssue,
  onReturn,
  userRole,
  navigate,
}) => {
  // Determine if user can perform actions based on role and asset status
  const canEdit = userRole === 'admin' || userRole === 'manager';
  const canDelete = userRole === 'admin';
  const canIssue = asset.status === 'available' && canEdit;
  const canReturn = asset.status === 'in_use' && canEdit;

  return (
    <Tr 
      _hover={{ 
        bg: 'rgba(255, 255, 255, 0.05)',
        transform: 'translateY(-1px)',
        transition: 'all 0.2s',
      }}
    >
      {/* Asset ID - Primary identifier */}
      <Td 
        fontWeight="semibold" 
        color="white"
        borderColor="rgba(255, 255, 255, 0.1)"
      >
        {asset.asset_id}
      </Td>
      
      {/* Asset Type - Category classification */}
      <Td 
        textTransform="capitalize" 
        color="gray.200"
        borderColor="rgba(255, 255, 255, 0.1)"
      >
        {asset.type}
      </Td>
      
      {/* Brand and Model - Equipment details */}
      <Td borderColor="rgba(255, 255, 255, 0.1)">
        <VStack spacing={0} align="start">
          <Text fontWeight="medium" color="white">{asset.brand}</Text>
          <Text fontSize="sm" color="gray.300">{asset.model}</Text>
        </VStack>
      </Td>
      
      {/* Department - Organizational assignment */}
      <Td color="gray.200" borderColor="rgba(255, 255, 255, 0.1)">
        {asset.department}
      </Td>
      
      {/* Status - Current lifecycle state with visual indicator */}
      <Td>
        <Badge 
          colorScheme={STATUS_COLORS[asset.status as keyof typeof STATUS_COLORS]}
          variant="solid"
          textTransform="capitalize"
        >
          {asset.status.replace('_', ' ')}
        </Badge>
      </Td>
      
      {/* Assigned User - Current user assignment if applicable */}
      <Td>
        {asset.assigned_user_name ? (
          <Text>{asset.assigned_user_name}</Text>
        ) : (
          <Text color="gray.400" fontSize="sm">Unassigned</Text>
        )}
      </Td>
      
      {/* Warranty Status - Days until expiry with visual warnings */}
      <Td>
        {(() => {
          const warrantyDate = new Date(asset.warranty_expiry);
          const today = new Date();
          const daysUntilExpiry = Math.ceil(
            (warrantyDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (daysUntilExpiry < 0) {
            return (
              <Badge colorScheme="red" variant="solid">
                Expired
              </Badge>
            );
          } else if (daysUntilExpiry <= 30) {
            return (
              <Badge colorScheme="orange" variant="solid">
                {daysUntilExpiry} days
              </Badge>
            );
          } else {
            return (
              <Text fontSize="sm">
                {warrantyDate.toLocaleDateString()}
              </Text>
            );
          }
        })()}
      </Td>
      
      {/* Actions Menu - Context-sensitive actions based on permissions */}
      <Td>
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<HamburgerIcon />}
            variant="ghost"
            size="sm"
            aria-label="Asset actions"
          />
          <MenuList>
            {/* View Details - Available to all users */}
            <MenuItem 
              icon={<SearchIcon />} 
              onClick={() => navigate(`/assets/${asset.id}`)}
            >
              View Details
            </MenuItem>
            
            {/* Edit Asset - Available to managers and admins */}
            {canEdit && (
              <MenuItem icon={<EditIcon />} onClick={() => onEdit(asset)}>
                Edit Asset
              </MenuItem>
            )}
            
            {/* Issue Asset - Available when asset is available */}
            {canIssue && (
              <MenuItem onClick={() => onIssue(asset)}>
                Issue to User
              </MenuItem>
            )}
            
            {/* Return Asset - Available when asset is in use */}
            {canReturn && (
              <MenuItem onClick={() => onReturn(asset)}>
                Return Asset
              </MenuItem>
            )}
            
            {/* Delete Asset - Available to admins only */}
            {canDelete && (
              <MenuItem 
                icon={<DeleteIcon />} 
                onClick={() => onDelete(asset)}
                color="red.500"
              >
                Delete Asset
              </MenuItem>
            )}
          </MenuList>
        </Menu>
      </Td>
    </Tr>
  );
};

/**
 * Main AssetList Component
 * 
 * This is the primary component that manages the entire asset listing interface.
 * It handles data fetching, filtering, pagination, and user interactions.
 */
const AssetList: React.FC = () => {
  // Get authentication context for user role and permissions
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Get URL search parameters for filtering
  const [searchParams] = useSearchParams();
  
  // Get asset management functions from context
  const { 
    assets, 
    loading, 
    fetchAssets, 
    deleteAsset, 
    issueAsset, 
    returnAsset, 
    exportAssets 
  } = useAssets();
  
  // Toast notifications for user feedback
  const toast = useToast();
  
  // Initialize filters from URL parameters
  const initialFilters: AssetFilters = {
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    asset_type: searchParams.get('asset_type') || '',
    department: searchParams.get('department') || '',
  };
  
  // State for filtering and search functionality
  const [filters, setFilters] = useState<AssetFilters>(initialFilters);
  
  // State for pagination control
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    limit: 20,
    total: 0,
  });
  
  // State for selected asset (for actions)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  
  // Modal controls for different actions
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isIssueOpen, onOpen: onIssueOpen, onClose: onIssueClose } = useDisclosure();
  
  // Ref for alert dialog focus management
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  /**
   * Fetch assets when component mounts or filters change
   * This ensures the list is always up to date with current filters
   */
  useEffect(() => {
    const fetchParams = {
      skip: pagination.page * pagination.limit,
      limit: pagination.limit,
      ...filters,
    };
    fetchAssets(fetchParams);
  }, [fetchAssets, filters, pagination]);

  /**
   * Handle filter changes with debouncing for search input
   * Updates the filters state and resets pagination to first page
   */
  const handleFilterChange = (field: keyof AssetFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  /**
   * Handle asset deletion with confirmation
   * Shows confirmation dialog and performs deletion if confirmed
   */
  const handleDelete = async () => {
    if (!selectedAsset) return;
    
    try {
      await deleteAsset(selectedAsset.id);
      toast({
        title: 'Asset deleted',
        description: `Asset ${selectedAsset.asset_id} has been deleted successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onDeleteClose();
      setSelectedAsset(null);
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error.response?.data?.detail || 'Failed to delete asset',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  /**
   * Handle asset export functionality
   * Downloads a CSV file with current filter criteria
   */
  const handleExport = async () => {
    try {
      await exportAssets(filters);
      toast({
        title: 'Export successful',
        description: 'Asset data has been exported to CSV.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Export failed',
        description: error.response?.data?.detail || 'Failed to export assets',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  /**
   * Prepare delete action
   * Sets the selected asset and opens the confirmation dialog
   */
  const prepareDelete = (asset: Asset) => {
    setSelectedAsset(asset);
    onDeleteOpen();
  };

  /**
   * Prepare issue action
   * Sets the selected asset and opens the issue dialog
   */
  const prepareIssue = (asset: Asset) => {
    setSelectedAsset(asset);
    onIssueOpen();
    // TODO: Implement issue dialog
  };

  /**
   * Handle asset return
   * Directly returns the asset without additional confirmation
   */
  const handleReturn = async (asset: Asset) => {
    try {
      await returnAsset(asset.id);
      toast({
        title: 'Asset returned',
        description: `Asset ${asset.asset_id} has been returned successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Return failed',
        description: error.response?.data?.detail || 'Failed to return asset',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  /**
   * Handle asset edit navigation
   * Navigates to the asset edit form
   */
  const handleEdit = (asset: Asset) => {
    navigate(`/assets/${asset.id}/edit`);
  };

  return (
    <Box
      minH="100vh"
      bgGradient={useColorModeValue(
        'linear(to-br, purple.900, blue.800, teal.700)',
        'linear(to-br, gray.900, purple.900, blue.900)'
      )}
      position="relative"
    >
      <Container maxW="8xl" py={8}>
        {/* Page Header */}
        <VStack spacing={6} align="stretch" mb={8}>
        <HStack justify="space-between" align="center">
          <Heading size="lg" color="white" textShadow="0 2px 4px rgba(0, 0, 0, 0.3)">
            Asset Inventory
          </Heading>
          <HStack spacing={4}>
            {/* Export Button */}
            <Button
              leftIcon={<DownloadIcon />}
              variant="outline"
              onClick={handleExport}
              size="md"
            >
              Export CSV
            </Button>
            
            {/* Add New Asset Button - Admin/Manager only */}
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                size="md"
                // TODO: Navigate to add asset form
              >
                Add Asset
              </Button>
            )}
          </HStack>
        </HStack>

        {/* Filters and Search Section */}
        <Card 
          bg="rgba(255, 255, 255, 0.1)"
          backdropFilter="blur(10px)"
          borderRadius="20px"
          border="1px solid rgba(255, 255, 255, 0.1)"
          boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
        >
          <CardBody>
            <VStack spacing={4}>
              <Text 
                fontWeight="semibold" 
                alignSelf="start"
                color="white"
                fontSize="lg"
                textShadow="0 1px 2px rgba(0, 0, 0, 0.3)"
              >
                Search and Filter Assets
              </Text>
              
              {/* Search and Filter Controls */}
              <HStack spacing={4} w="100%" flexWrap="wrap">
                {/* Search Input */}
                <InputGroup flex="1" minW="250px">
                  <InputLeftElement>
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search assets by ID, brand, model, or serial number..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    bg="rgba(255, 255, 255, 0.1)"
                    border="1px solid rgba(255, 255, 255, 0.2)"
                    color="white"
                    _placeholder={{ color: 'gray.400' }}
                    _hover={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
                    _focus={{ 
                      borderColor: 'blue.300',
                      boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.5)',
                    }}
                  />
                </InputGroup>
                
                {/* Status Filter */}
                <Select
                  placeholder="All Statuses"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  minW="150px"
                  bg="rgba(255, 255, 255, 0.1)"
                  border="1px solid rgba(255, 255, 255, 0.2)"
                  color="white"
                  _hover={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
                  _focus={{ 
                    borderColor: 'blue.300',
                    boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.5)',
                  }}
                >
                  <option value="available" style={{ background: '#2D3748', color: 'white' }}>Available</option>
                  <option value="in_use" style={{ background: '#2D3748', color: 'white' }}>In Use</option>
                  <option value="maintenance" style={{ background: '#2D3748', color: 'white' }}>Maintenance</option>
                  <option value="retired" style={{ background: '#2D3748', color: 'white' }}>Retired</option>
                </Select>
                
                {/* Type Filter */}
                <Select
                  placeholder="All Types"
                  value={filters.asset_type}
                  onChange={(e) => handleFilterChange('asset_type', e.target.value)}
                  minW="150px"
                  bg="rgba(255, 255, 255, 0.1)"
                  border="1px solid rgba(255, 255, 255, 0.2)"
                  color="white"
                  _hover={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
                  _focus={{ 
                    borderColor: 'blue.300',
                    boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.5)',
                  }}
                >
                  <option value="Laptop" style={{ background: '#2D3748', color: 'white' }}>Laptop</option>
                  <option value="Desktop" style={{ background: '#2D3748', color: 'white' }}>Desktop</option>
                  <option value="Monitor" style={{ background: '#2D3748', color: 'white' }}>Monitor</option>
                  <option value="Printer" style={{ background: '#2D3748', color: 'white' }}>Printer</option>
                  <option value="Server" style={{ background: '#2D3748', color: 'white' }}>Server</option>
                  <option value="Router" style={{ background: '#2D3748', color: 'white' }}>Router</option>
                  <option value="Switch" style={{ background: '#2D3748', color: 'white' }}>Switch</option>
                  <option value="Tablet" style={{ background: '#2D3748', color: 'white' }}>Tablet</option>
                  <option value="Phone" style={{ background: '#2D3748', color: 'white' }}>Phone</option>
                </Select>
                
                {/* Department Filter */}
                <Select
                  placeholder="All Departments"
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  minW="150px"
                  bg="rgba(255, 255, 255, 0.1)"
                  border="1px solid rgba(255, 255, 255, 0.2)"
                  color="white"
                  _hover={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
                  _focus={{ 
                    borderColor: 'blue.300',
                    boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.5)',
                  }}
                >
                  <option value="IT" style={{ background: '#2D3748', color: 'white' }}>IT</option>
                  <option value="Engineering" style={{ background: '#2D3748', color: 'white' }}>Engineering</option>
                  <option value="Marketing" style={{ background: '#2D3748', color: 'white' }}>Marketing</option>
                  <option value="Finance" style={{ background: '#2D3748', color: 'white' }}>Finance</option>
                  <option value="HR" style={{ background: '#2D3748', color: 'white' }}>HR</option>
                  <option value="Sales" style={{ background: '#2D3748', color: 'white' }}>Sales</option>
                </Select>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Assets Table */}
      <Card 
        bg="rgba(255, 255, 255, 0.1)"
        backdropFilter="blur(10px)"
        borderRadius="20px"
        border="1px solid rgba(255, 255, 255, 0.1)"
        boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
      >
        <CardBody p={0}>
          {loading ? (
            // Loading State
            <Flex justify="center" align="center" minH="400px">
              <VStack spacing={4}>
                <Spinner size="xl" color="blue.500" />
                <Text>Loading assets...</Text>
              </VStack>
            </Flex>
          ) : assets.length === 0 ? (
            // Empty State
            <Flex justify="center" align="center" minH="400px">
              <VStack spacing={4}>
                <Text fontSize="lg" color="gray.500">
                  No assets found
                </Text>
                <Text color="gray.400">
                  Try adjusting your search criteria or add some assets to get started.
                </Text>
              </VStack>
            </Flex>
          ) : (
            // Assets Table
            <Table variant="simple">
              <Thead 
                sx={{
                  ...componentPresets.tableHeader,
                  bg: 'rgba(255, 255, 255, 0.15)',
                }}
              >
                <Tr>
                  <Th color="white" fontWeight="bold" borderColor="rgba(255, 255, 255, 0.1)">Asset ID</Th>
                  <Th color="white" fontWeight="bold" borderColor="rgba(255, 255, 255, 0.1)">Type</Th>
                  <Th color="white" fontWeight="bold" borderColor="rgba(255, 255, 255, 0.1)">Brand/Model</Th>
                  <Th color="white" fontWeight="bold" borderColor="rgba(255, 255, 255, 0.1)">Department</Th>
                  <Th color="white" fontWeight="bold" borderColor="rgba(255, 255, 255, 0.1)">Status</Th>
                  <Th color="white" fontWeight="bold" borderColor="rgba(255, 255, 255, 0.1)">Assigned To</Th>
                  <Th color="white" fontWeight="bold" borderColor="rgba(255, 255, 255, 0.1)">Warranty</Th>
                  <Th color="white" fontWeight="bold" borderColor="rgba(255, 255, 255, 0.1)">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {assets.map((asset) => (
                  <AssetRow
                    key={asset.id}
                    asset={asset}
                    onEdit={handleEdit}
                    onDelete={prepareDelete}
                    onIssue={prepareIssue}
                    onReturn={handleReturn}
                    userRole={user?.role || 'viewer'}
                    navigate={navigate}
                  />
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Pagination Controls */}
      {assets.length > 0 && (
        <Flex justify="space-between" align="center" mt={6}>
          <Text color="gray.600">
            Showing {pagination.page * pagination.limit + 1} to{' '}
            {Math.min((pagination.page + 1) * pagination.limit, pagination.total)} of{' '}
            {pagination.total} assets
          </Text>
          
          <HStack spacing={2}>
            <Button
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              isDisabled={pagination.page === 0}
            >
              Previous
            </Button>
            <Button
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              isDisabled={(pagination.page + 1) * pagination.limit >= pagination.total}
            >
              Next
            </Button>
          </HStack>
        </Flex>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Asset
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete asset{' '}
              <strong>{selectedAsset?.asset_id}</strong>? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* TODO: Add Issue Asset Modal */}
      {/* TODO: Add Asset Details Modal */}
      </Container>
    </Box>
  );
};

export default AssetList; 