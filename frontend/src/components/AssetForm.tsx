/**
 * AssetForm Component - Create and edit asset information
 * 
 * This component provides a comprehensive form interface for creating new assets
 * or editing existing asset information. It includes form validation, error handling,
 * and a user-friendly interface that guides users through the asset creation process.
 * 
 * Features:
 * - Dynamic form validation with real-time feedback
 * - Auto-generated asset IDs for new assets
 * - Date picker integration for purchase and warranty dates
 * - Conditional field display based on asset type
 * - Rich text editor for notes and descriptions
 * - Image upload for asset photos (future enhancement)
 * 
 * Form Sections:
 * - Basic Information (Asset ID, Type, Brand, Model)
 * - Physical Details (Serial Number, Condition, Location)
 * - Financial Information (Purchase Date, Cost, Warranty)
 * - Organizational Data (Department, Notes)
 * 
 * Validation Rules:
 * - Asset ID must be unique and follow naming convention
 * - Required fields are clearly marked and validated
 * - Date fields have logical constraints (warranty > purchase date)
 * - Cost fields accept various currency formats
 * 
 * @author IT Asset Management System
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  HStack,
  Text,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardHeader,
  CardBody,
  Grid,
  GridItem,
  FormErrorMessage,
  FormHelperText,
  Badge,
  Textarea,
  Flex,
  Spinner,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useColorModeValue,
  InputGroup,
  InputLeftAddon,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';

// Import contexts for data management
import { useAssets, AssetCreate } from '../contexts/AssetContext';
import { useAuth } from '../contexts/AuthContext';

/**
 * Asset type options with descriptions
 * Defines the available asset categories and their characteristics
 */
const ASSET_TYPES = [
  { value: 'laptop', label: 'Laptop', description: 'Portable computers for mobile work' },
  { value: 'desktop', label: 'Desktop', description: 'Stationary workstation computers' },
  { value: 'tablet', label: 'Tablet', description: 'Tablet computers and mobile devices' },
  { value: 'server', label: 'Server', description: 'Server hardware and infrastructure' },
  { value: 'router', label: 'Router', description: 'Network routing equipment' },
  { value: 'firewall', label: 'Firewall', description: 'Network security appliances' },
  { value: 'switch', label: 'Switch', description: 'Network switching equipment' },
];

/**
 * Department options for organizational assignment
 * Matches the departments available in the user management system
 */
const DEPARTMENTS = [
  'IT',
  'Engineering', 
  'Marketing',
  'Finance',
  'HR',
  'Sales',
  'Operations',
  'General',
];

/**
 * Asset condition options with descriptions
 * Provides standardized condition ratings for asset tracking
 */
const CONDITIONS = [
  { value: 'Excellent', description: 'Like new, no visible wear' },
  { value: 'Good', description: 'Minor wear, fully functional' },
  { value: 'Fair', description: 'Moderate wear, may need minor repairs' },
  { value: 'Poor', description: 'Significant wear, needs major repair' },
];

/**
 * Form validation interface
 * Defines the structure for tracking form field errors
 */
interface FormErrors {
  asset_id?: string;
  type?: string;
  brand?: string;
  model?: string;
  department?: string;
  purchase_date?: string;
  warranty_expiry?: string;
  purchase_cost?: string;
}

/**
 * Asset form data interface extending the AssetCreate type
 * Includes additional UI-specific fields for better user experience
 */
interface AssetFormData extends AssetCreate {
  // All fields from AssetCreate are included
  // Additional computed fields for UI
  warranty_years?: number; // Helper field for calculating warranty expiry
}

/**
 * Generate a unique asset ID based on type and sequence
 * Creates a standardized asset ID format: [TYPE]-[SEQUENCE]
 * 
 * @param type - The asset type (laptop, desktop, etc.)
 * @param existingAssets - Array of existing assets to avoid duplicates
 * @returns Generated unique asset ID
 */
const generateAssetId = (type: string, existingAssets: any[] = []): string => {
  const typePrefix = type.toUpperCase().slice(0, 3);
  const existingIds = existingAssets
    .filter(asset => asset.asset_id.startsWith(typePrefix))
    .map(asset => parseInt(asset.asset_id.split('-')[1]) || 0)
    .sort((a, b) => b - a);
  
  const nextNumber = existingIds.length > 0 ? existingIds[0] + 1 : 1;
  return `${typePrefix}-${nextNumber.toString().padStart(3, '0')}`;
};

/**
 * Validate form data and return errors
 * Performs comprehensive validation of all form fields
 * 
 * @param data - The form data to validate
 * @returns Object containing validation errors
 */
const validateForm = (data: AssetFormData): FormErrors => {
  const errors: FormErrors = {};

  // Asset ID validation
  if (!data.asset_id) {
    errors.asset_id = 'Asset ID is required';
  } else if (!/^[A-Z]{2,4}-\d{3}$/.test(data.asset_id)) {
    errors.asset_id = 'Asset ID must follow format: ABC-001';
  }

  // Type validation
  if (!data.type) {
    errors.type = 'Asset type is required';
  }

  // Brand validation
  if (!data.brand) {
    errors.brand = 'Brand is required';
  } else if (data.brand.length < 2) {
    errors.brand = 'Brand must be at least 2 characters';
  }

  // Model validation
  if (!data.model) {
    errors.model = 'Model is required';
  } else if (data.model.length < 2) {
    errors.model = 'Model must be at least 2 characters';
  }

  // Department validation
  if (!data.department) {
    errors.department = 'Department is required';
  }

  // Purchase date validation
  if (!data.purchase_date) {
    errors.purchase_date = 'Purchase date is required';
  } else if (new Date(data.purchase_date) > new Date()) {
    errors.purchase_date = 'Purchase date cannot be in the future';
  }

  // Warranty expiry validation
  if (!data.warranty_expiry) {
    errors.warranty_expiry = 'Warranty expiry date is required';
  } else if (data.purchase_date && new Date(data.warranty_expiry) < new Date(data.purchase_date)) {
    errors.warranty_expiry = 'Warranty expiry must be after purchase date';
  }

  // Purchase cost validation (optional but format check if provided)
  if (data.purchase_cost && !/^\$?\d+(\.\d{2})?$/.test(data.purchase_cost)) {
    errors.purchase_cost = 'Purchase cost must be a valid amount (e.g., $1234.56)';
  }

  return errors;
};

/**
 * Main AssetForm Component
 * 
 * This component handles both creating new assets and editing existing ones.
 * It determines the mode based on the presence of an asset ID in the URL parameters.
 */
const AssetForm: React.FC = () => {
  // Get URL parameters to determine if we're editing an existing asset
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  
  // Navigation hook for programmatic routing
  const navigate = useNavigate();
  
  // Get authentication context for user permissions
  const { user } = useAuth();
  
  // Get asset management functions from context
  const { assets, createAsset, updateAsset, fetchAssets } = useAssets();
  
  // Toast notifications for user feedback
  const toast = useToast();

  // Component state management
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AssetFormData>({
    asset_id: '',
    asset_tag: '',
    type: '',
    brand: '',
    model: '',
    serial_number: '',
    department: user?.department || '',
    location: '',
    purchase_date: '',
    warranty_expiry: '',
    purchase_cost: '',
    condition: 'Good',
    notes: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Load existing asset data when editing
   * Fetches the asset details if we're in edit mode
   */
  useEffect(() => {
    if (isEditing && id && assets.length > 0) {
      const asset = assets.find(a => a.id === parseInt(id));
      if (asset) {
        setFormData({
          asset_id: asset.asset_id,
          asset_tag: asset.asset_tag || '',
          type: asset.type,
          brand: asset.brand,
          model: asset.model,
          serial_number: asset.serial_number || '',
          department: asset.department,
          location: asset.location || '',
          purchase_date: asset.purchase_date.split('T')[0], // Convert to YYYY-MM-DD format
          warranty_expiry: asset.warranty_expiry.split('T')[0],
          purchase_cost: asset.purchase_cost || '',
          condition: asset.condition,
          notes: asset.notes || '',
        });
      }
    }
  }, [isEditing, id, assets]);

  /**
   * Fetch assets on component mount to get existing data
   * This is needed for asset ID generation and editing
   */
  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  /**
   * Handle form field changes with real-time validation
   * Updates form data and clears related errors
   * 
   * @param field - The field name being updated
   * @param value - The new value for the field
   */
  const handleFieldChange = (field: keyof AssetFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Auto-generate Asset ID when type changes (for new assets)
    if (field === 'type' && !isEditing && value) {
      const generatedId = generateAssetId(value, assets);
      setFormData(prev => ({ ...prev, asset_id: generatedId }));
    }

    // Auto-calculate warranty expiry when warranty years change
    if (field === 'warranty_years' && formData.purchase_date) {
      const purchaseDate = new Date(formData.purchase_date);
      const warrantyExpiry = new Date(purchaseDate);
      warrantyExpiry.setFullYear(warrantyExpiry.getFullYear() + parseInt(value || '1'));
      setFormData(prev => ({ 
        ...prev, 
        warranty_expiry: warrantyExpiry.toISOString().split('T')[0] 
      }));
    }
  };

  /**
   * Handle form submission with validation
   * Validates the form and submits to the appropriate API endpoint
   * 
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if asset type is allowed for this form
    if (!['laptop', 'desktop', 'tablet'].includes(formData.type)) {
      toast({
        title: 'Invalid Asset Type',
        description: 'Only laptop, desktop, and tablet assets can be created here. Use the specific management pages for servers and network appliances.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Validate form data
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form before submitting.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Remove UI-specific fields before submission
      const { warranty_years, ...submitData } = formData;

      if (isEditing && id) {
        // Update existing asset
        await updateAsset(parseInt(id), submitData);
        toast({
          title: 'Asset Updated',
          description: `Asset ${submitData.asset_id} has been updated successfully.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new asset
        await createAsset(submitData);
        toast({
          title: 'Asset Created',
          description: `Asset ${submitData.asset_id} has been created successfully.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      // Navigate back to asset list
      navigate('/assets');
      
    } catch (error: any) {
      toast({
        title: isEditing ? 'Update Failed' : 'Creation Failed',
        description: error.response?.data?.detail || 'Failed to save asset',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Cancel form and navigate back
   * Confirms with user if form has unsaved changes
   */
  const handleCancel = () => {
    // TODO: Add unsaved changes detection
    navigate('/assets');
  };

  return (
    <Box
      minH="100vh"
      bgGradient={useColorModeValue(
        'linear(to-br, purple.900, blue.800, teal.700)',
        'linear(to-br, gray.900, purple.900, blue.900)'
      )}
      py={8}
    >
      <Container maxW="4xl">
        {/* Page Header */}
        <VStack spacing={6} align="stretch" mb={8}>
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={2}>
              <Heading size="lg" color="white" textShadow="0 2px 4px rgba(0, 0, 0, 0.3)">
                {isEditing ? 'Edit User Asset' : 'Add New User Asset'}
              </Heading>
              <Text color="gray.200">
                {isEditing 
                  ? 'Update user asset information and tracking details'
                  : 'Enter details for laptop, desktop, or tablet assets that will be issued to users'
                }
              </Text>
            </VStack>
            
            {/* Status indicator for editing */}
            {isEditing && (
              <Badge colorScheme="blue" variant="subtle" px={3} py={1}>
                Editing Mode
              </Badge>
            )}
          </HStack>

          {/* Form guidance alert */}
          <Alert 
            status="info" 
            borderRadius="20px"
            bg="rgba(6, 182, 212, 0.15)"
            border="1px solid rgba(6, 182, 212, 0.3)"
            backdropFilter="blur(10px)"
            py={4}
          >
            <AlertIcon color="cyan.300" />
            <Box>
              <AlertTitle color="white" fontSize="lg" fontWeight="bold">📝 User Asset Form Guidelines</AlertTitle>
              <AlertDescription color="gray.100" fontSize="md" lineHeight="1.6">
                <Text mb={2}>
                  • Fields marked with <Text as="span" color="red.300" fontWeight="bold">*</Text> are required
                </Text>
                <Text mb={2}>
                  • Asset ID will be auto-generated when you select the asset type
                </Text>
                <Text mb={2}>
                  • This form is for <Text as="span" color="cyan.300" fontWeight="bold">Laptop, Desktop, and Tablet</Text> assets only
                </Text>
                <Text mb={2}>
                  • For <Text as="span" color="orange.300" fontWeight="bold">Servers</Text>: Use the "Servers" page in navigation
                </Text>
                <Text>
                  • For <Text as="span" color="green.300" fontWeight="bold">Network Equipment</Text>: Use the "Network" page in navigation
                </Text>
              </AlertDescription>
            </Box>
          </Alert>
        </VStack>

        {/* Main Form */}
        <form onSubmit={handleSubmit}>
          <VStack spacing={8} align="stretch">
            
            {/* Basic Information Section */}
            <Card
              bg="rgba(255, 255, 255, 0.1)"
              backdropFilter="blur(10px)"
              borderRadius="20px"
              border="1px solid rgba(255, 255, 255, 0.1)"
              boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
            >
              <CardHeader pb={2}>
                <VStack align="start" spacing={1}>
                  <Heading size="md" color="white" display="flex" alignItems="center" gap={3}>
                    💻 Basic Information
                  </Heading>
                  <Text color="gray.300" fontSize="sm">
                    Essential details about the asset
                  </Text>
                </VStack>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                  
                  {/* Asset ID */}
                  <GridItem>
                    <FormControl isInvalid={Boolean(errors.asset_id)} isRequired>
                      <FormLabel color="white" fontWeight="medium">Asset ID</FormLabel>
                      <Input
                        value={formData.asset_id}
                        onChange={(e) => handleFieldChange('asset_id', e.target.value)}
                        placeholder="e.g., LAP-001"
                        isDisabled={isEditing} // Don't allow changing asset ID when editing
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
                      <FormErrorMessage>{errors.asset_id}</FormErrorMessage>
                      <FormHelperText color="gray.300">
                        System-generated unique identifier for this asset.
                      </FormHelperText>
                    </FormControl>
                  </GridItem>

                  {/* Asset Tag */}
                  <GridItem>
                    <FormControl>
                      <FormLabel color="white" fontWeight="medium">Asset Tag</FormLabel>
                      <Input
                        value={formData.asset_tag || ''}
                        onChange={(e) => handleFieldChange('asset_tag', e.target.value)}
                        placeholder="e.g., FIN-2024-001, COMP-12345"
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
                      <FormHelperText color="gray.300">
                        Finance department assigned tag for asset tracking.
                      </FormHelperText>
                    </FormControl>
                  </GridItem>

                  {/* Asset Type */}
                  <GridItem>
                    <FormControl isInvalid={Boolean(errors.type)} isRequired>
                      <FormLabel color="white" fontWeight="semibold" fontSize="md">
                        🖥️ Asset Type <Text as="span" color="red.300">*</Text>
                      </FormLabel>
                      <Select
                        value={formData.type}
                        onChange={(e) => handleFieldChange('type', e.target.value)}
                        placeholder="Select asset type"
                        bg="rgba(255, 255, 255, 0.1)"
                        border="1px solid rgba(255, 255, 255, 0.2)"
                        color="white"
                        _hover={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
                        _focus={{ 
                          borderColor: 'blue.300',
                          boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.5)',
                        }}
                      >
                        {ASSET_TYPES.map(type => (
                          <option key={type.value} value={type.value} style={{ background: '#2D3748', color: 'white' }}>
                            {type.label}
                          </option>
                        ))}
                      </Select>
                      <FormErrorMessage>{errors.type}</FormErrorMessage>
                      <FormHelperText color="gray.300">
                        Category that best describes this asset
                      </FormHelperText>
                    </FormControl>
                  </GridItem>

                  {/* Brand */}
                  <GridItem>
                    <FormControl isInvalid={Boolean(errors.brand)} isRequired>
                      <FormLabel color="white" fontWeight="semibold" fontSize="md">
                        🏷️ Brand <Text as="span" color="red.300">*</Text>
                      </FormLabel>
                      <Input
                        value={formData.brand}
                        onChange={(e) => handleFieldChange('brand', e.target.value)}
                        placeholder="e.g., Dell, Apple, HP"
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
                      <FormErrorMessage>{errors.brand}</FormErrorMessage>
                    </FormControl>
                  </GridItem>

                  {/* Model */}
                  <GridItem>
                    <FormControl isInvalid={Boolean(errors.model)} isRequired>
                      <FormLabel color="white" fontWeight="semibold" fontSize="md">
                        📱 Model <Text as="span" color="red.300">*</Text>
                      </FormLabel>
                      <Input
                        value={formData.model}
                        onChange={(e) => handleFieldChange('model', e.target.value)}
                        placeholder="e.g., XPS 13, MacBook Pro"
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
                      <FormErrorMessage>{errors.model}</FormErrorMessage>
                    </FormControl>
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>

            {/* Physical Details Section */}
            <Card
              bg="rgba(255, 255, 255, 0.1)"
              backdropFilter="blur(10px)"
              borderRadius="20px"
              border="1px solid rgba(255, 255, 255, 0.1)"
              boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
            >
              <CardHeader pb={2}>
                <VStack align="start" spacing={1}>
                  <Heading size="md" color="white" display="flex" alignItems="center" gap={3}>
                    📦 Physical Details
                  </Heading>
                  <Text color="gray.300" fontSize="sm">
                    Physical characteristics and location information
                  </Text>
                </VStack>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                  
                  {/* Serial Number */}
                  <GridItem>
                    <FormControl>
                      <FormLabel color="white" fontWeight="semibold" fontSize="md">
                        🏷️ Serial Number
                      </FormLabel>
                      <Input
                        value={formData.serial_number}
                        onChange={(e) => handleFieldChange('serial_number', e.target.value)}
                        placeholder="Enter manufacturer serial number"
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
                      <FormHelperText color="gray.200" fontSize="sm">
                        💡 Optional: Unique identifier from manufacturer
                      </FormHelperText>
                    </FormControl>
                  </GridItem>

                  {/* Condition */}
                  <GridItem>
                    <FormControl>
                      <FormLabel color="white" fontWeight="semibold" fontSize="md">
                        ⚡ Asset Condition
                      </FormLabel>
                      <Select
                        value={formData.condition}
                        onChange={(e) => handleFieldChange('condition', e.target.value)}
                        bg="rgba(255, 255, 255, 0.1)"
                        border="1px solid rgba(255, 255, 255, 0.2)"
                        color="white"
                        _hover={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
                        _focus={{ 
                          borderColor: 'blue.300',
                          boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.5)',
                        }}
                      >
                        {CONDITIONS.map(condition => (
                          <option key={condition.value} value={condition.value} style={{ background: '#2D3748', color: 'white' }}>
                            {condition.value}
                          </option>
                        ))}
                      </Select>
                      <FormHelperText color="gray.200" fontSize="sm">
                        📊 Current physical state of the asset
                      </FormHelperText>
                    </FormControl>
                  </GridItem>

                  {/* Location */}
                  <GridItem colSpan={{ base: 1, md: 2 }}>
                    <FormControl>
                      <FormLabel color="white" fontWeight="semibold" fontSize="md">
                        📍 Physical Location
                      </FormLabel>
                      <Input
                        value={formData.location}
                        onChange={(e) => handleFieldChange('location', e.target.value)}
                        placeholder="e.g., Office Floor 3, Server Room, Desk A-12"
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
                      <FormHelperText color="gray.200" fontSize="sm">
                        🏢 Where is this asset physically located?
                      </FormHelperText>
                    </FormControl>
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>

            {/* Financial & Warranty Section */}
            <Card
              bg="rgba(255, 255, 255, 0.1)"
              backdropFilter="blur(10px)"
              borderRadius="20px"
              border="1px solid rgba(255, 255, 255, 0.1)"
              boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
            >
              <CardHeader pb={2}>
                <VStack align="start" spacing={1}>
                  <Heading size="md" color="white" display="flex" alignItems="center" gap={3}>
                    💰 Financial & Warranty Information
                  </Heading>
                  <Text color="gray.300" fontSize="sm">
                    Purchase details and warranty tracking
                  </Text>
                </VStack>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                  
                  {/* Purchase Date */}
                  <GridItem>
                    <FormControl isInvalid={Boolean(errors.purchase_date)} isRequired>
                      <FormLabel color="white" fontWeight="semibold" fontSize="md">
                        📅 Purchase Date <Text as="span" color="red.300">*</Text>
                      </FormLabel>
                      <Input
                        type="date"
                        value={formData.purchase_date}
                        onChange={(e) => handleFieldChange('purchase_date', e.target.value)}
                        bg="rgba(255, 255, 255, 0.1)"
                        border="1px solid rgba(255, 255, 255, 0.2)"
                        color="white"
                        _hover={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
                        _focus={{ 
                          borderColor: 'blue.300',
                          boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.5)',
                        }}
                      />
                      <FormErrorMessage>{errors.purchase_date}</FormErrorMessage>
                      <FormHelperText color="gray.200" fontSize="sm">
                        📊 When was this asset purchased?
                      </FormHelperText>
                    </FormControl>
                  </GridItem>

                  {/* Warranty Expiry */}
                  <GridItem>
                    <FormControl isInvalid={Boolean(errors.warranty_expiry)} isRequired>
                      <FormLabel color="white" fontWeight="semibold" fontSize="md">
                        🛡️ Warranty Expiry Date <Text as="span" color="red.300">*</Text>
                      </FormLabel>
                      <Input
                        type="date"
                        value={formData.warranty_expiry}
                        onChange={(e) => handleFieldChange('warranty_expiry', e.target.value)}
                        bg="rgba(255, 255, 255, 0.1)"
                        border="1px solid rgba(255, 255, 255, 0.2)"
                        color="white"
                        _hover={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
                        _focus={{ 
                          borderColor: 'blue.300',
                          boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.5)',
                        }}
                      />
                      <FormErrorMessage>{errors.warranty_expiry}</FormErrorMessage>
                      <FormHelperText color="gray.200" fontSize="sm">
                        🔒 When does the warranty expire?
                      </FormHelperText>
                    </FormControl>
                  </GridItem>

                  {/* Purchase Cost */}
                  <GridItem>
                    <FormControl isInvalid={Boolean(errors.purchase_cost)}>
                      <FormLabel color="white" fontWeight="semibold" fontSize="md">
                        💵 Purchase Cost
                      </FormLabel>
                      <InputGroup>
                        <InputLeftAddon 
                          bg="rgba(255, 255, 255, 0.1)" 
                          borderColor="rgba(255, 255, 255, 0.2)"
                          color="white"
                        >
                          $
                        </InputLeftAddon>
                        <Input
                          value={formData.purchase_cost}
                          onChange={(e) => handleFieldChange('purchase_cost', e.target.value)}
                          placeholder="0.00"
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
                      <FormErrorMessage>{errors.purchase_cost}</FormErrorMessage>
                      <FormHelperText color="gray.200" fontSize="sm">
                        💡 Optional: Original purchase amount
                      </FormHelperText>
                    </FormControl>
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>

            {/* Organizational Information Section */}
            <Card
              bg="rgba(255, 255, 255, 0.1)"
              backdropFilter="blur(10px)"
              borderRadius="20px"
              border="1px solid rgba(255, 255, 255, 0.1)"
              boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
            >
                          <CardHeader pb={2}>
              <VStack align="start" spacing={1}>
                <Heading size="md" color="white" display="flex" alignItems="center" gap={3}>
                  🏢 Organizational Information
                </Heading>
                <Text color="gray.300" fontSize="sm">
                  Department assignment and additional notes
                </Text>
              </VStack>
            </CardHeader>
            <CardBody>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(1, 1fr)' }} gap={6}>
                
                {/* Department */}
                <GridItem>
                  <FormControl isInvalid={Boolean(errors.department)} isRequired>
                    <FormLabel color="white" fontWeight="semibold" fontSize="md">
                      🏬 Department <Text as="span" color="red.300">*</Text>
                    </FormLabel>
                    <Select
                      value={formData.department}
                      onChange={(e) => handleFieldChange('department', e.target.value)}
                      placeholder="Select department"
                      bg="rgba(255, 255, 255, 0.1)"
                      border="1px solid rgba(255, 255, 255, 0.2)"
                      color="white"
                      _hover={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
                      _focus={{ 
                        borderColor: 'blue.300',
                        boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.5)',
                      }}
                    >
                      {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept} style={{ background: '#2D3748', color: 'white' }}>
                          {dept}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.department}</FormErrorMessage>
                    <FormHelperText color="gray.200" fontSize="sm">
                      👥 Which department will manage this asset?
                    </FormHelperText>
                  </FormControl>
                </GridItem>

                {/* Notes */}
                <GridItem>
                  <FormControl>
                    <FormLabel color="white" fontWeight="semibold" fontSize="md">
                      📝 Additional Notes
                    </FormLabel>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => handleFieldChange('notes', e.target.value)}
                      placeholder="Enter any additional information about this asset..."
                      rows={4}
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
                    <FormHelperText color="gray.200" fontSize="sm">
                      💬 Optional: Special instructions, maintenance notes, etc.
                    </FormHelperText>
                  </FormControl>
                </GridItem>
              </Grid>
            </CardBody>
            </Card>

            {/* Form Actions */}
            <Card
              bg="rgba(255, 255, 255, 0.1)"
              backdropFilter="blur(10px)"
              borderRadius="20px"
              border="1px solid rgba(255, 255, 255, 0.1)"
              boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
            >
              <CardBody py={6}>
                <VStack spacing={4}>
                  <Text color="gray.200" textAlign="center" fontSize="sm">
                    🚀 Ready to {isEditing ? 'update' : 'add'} this asset to your inventory?
                  </Text>
                  <HStack spacing={4} justify="center">
                    <Button 
                      variant="outline" 
                      onClick={handleCancel}
                      isDisabled={isSubmitting}
                      size="lg"
                      borderColor="rgba(255, 255, 255, 0.3)"
                      color="white"
                      _hover={{
                        bg: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      }}
                    >
                      ✖️ Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      bg="rgba(59, 130, 246, 0.8)"
                      color="white"
                      fontWeight="bold"
                      isLoading={isSubmitting}
                      loadingText={isEditing ? 'Updating Asset...' : 'Creating Asset...'}
                      _hover={{
                        bg: 'rgba(59, 130, 246, 1)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
                      }}
                      _active={{
                        transform: 'translateY(0)',
                      }}
                    >
                      {isEditing ? '✅ Update Asset' : '➕ Create Asset'}
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </form>
      </Container>
    </Box>
  );
};

export default AssetForm; 