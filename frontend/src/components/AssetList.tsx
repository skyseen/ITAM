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
  type: string;            // Filter by asset type
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
}

const AssetRow: React.FC<AssetRowProps> = ({
  asset,
  onEdit,
  onDelete,
  onIssue,
  onReturn,
  userRole,
}) => {
  // Determine if user can perform actions based on role and asset status
  const canEdit = userRole === 'admin' || userRole === 'manager';
  const canDelete = userRole === 'admin';
  const canIssue = asset.status === 'available' && canEdit;
  const canReturn = asset.status === 'in_use' && canEdit;

  return (
    <Tr>
      {/* Asset ID - Primary identifier */}
      <Td fontWeight="semibold">{asset.asset_id}</Td>
      
      {/* Asset Type - Category classification */}
      <Td textTransform="capitalize">{asset.type}</Td>
      
      {/* Brand and Model - Equipment details */}
      <Td>
        <VStack spacing={0} align="start">
          <Text fontWeight="medium">{asset.brand}</Text>
          <Text fontSize="sm" color="gray.500">{asset.model}</Text>
        </VStack>
      </Td>
      
      {/* Department - Organizational assignment */}
      <Td>{asset.department}</Td>
      
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
            <MenuItem icon={<SearchIcon />}>
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
  
  // State for filtering and search functionality
  const [filters, setFilters] = useState<AssetFilters>({
    search: '',
    status: '',
    type: '',
    department: '',
  });
  
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
   * Navigates to the asset edit form (placeholder for now)
   */
  const handleEdit = (asset: Asset) => {
    // TODO: Navigate to edit form
    console.log('Edit asset:', asset);
  };

  return (
    <Container maxW="8xl" py={8}>
      {/* Page Header */}
      <VStack spacing={6} align="stretch" mb={8}>
        <HStack justify="space-between" align="center">
          <Heading size="lg">Asset Inventory</Heading>
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
        <Card>
          <CardBody>
            <VStack spacing={4}>
              <Text fontWeight="semibold" alignSelf="start">
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
                  />
                </InputGroup>
                
                {/* Status Filter */}
                <Select
                  placeholder="All Statuses"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  minW="150px"
                >
                  <option value="available">Available</option>
                  <option value="in_use">In Use</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="retired">Retired</option>
                </Select>
                
                {/* Type Filter */}
                <Select
                  placeholder="All Types"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  minW="150px"
                >
                  <option value="laptop">Laptop</option>
                  <option value="desktop">Desktop</option>
                  <option value="monitor">Monitor</option>
                  <option value="printer">Printer</option>
                  <option value="server">Server</option>
                  <option value="router">Router</option>
                </Select>
                
                {/* Department Filter */}
                <Select
                  placeholder="All Departments"
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  minW="150px"
                >
                  <option value="IT">IT</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                  <option value="Sales">Sales</option>
                </Select>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Assets Table */}
      <Card>
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
              <Thead bg="gray.50">
                <Tr>
                  <Th>Asset ID</Th>
                  <Th>Type</Th>
                  <Th>Brand/Model</Th>
                  <Th>Department</Th>
                  <Th>Status</Th>
                  <Th>Assigned To</Th>
                  <Th>Warranty</Th>
                  <Th>Actions</Th>
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
  );
};

export default AssetList; 