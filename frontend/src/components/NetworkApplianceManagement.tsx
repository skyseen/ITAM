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
  Text,
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
  useColorModeValue,
  FormControl,
  FormLabel,
  Textarea,
  Checkbox,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Divider,
  Flex,
  Spacer,
} from '@chakra-ui/react';
import {
  SearchIcon,
  EditIcon,
  DeleteIcon,
  HamburgerIcon,
  AddIcon,
  DownloadIcon,
  AttachmentIcon,
  WarningIcon,
} from '@chakra-ui/icons';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface NetworkAppliance {
  id: number;
  assigned_id: string;
  network_appliance_description: string;
  network_appliance_type: 'router' | 'firewall' | 'switch';
  brand: string;
  model: string;
  serial_number: string;
  asset_tag: string;
  location: string;
  status: 'not_setup' | 'in_use' | 'maintenance' | 'eol';
  asset_checked: boolean;
  remark: string;
}

interface NetworkApplianceFormData {
  network_appliance_description: string;
  network_appliance_type: 'router' | 'firewall' | 'switch';
  brand: string;
  model: string;
  serial_number: string;
  asset_tag: string;
  location: string;
  status: 'not_setup' | 'in_use' | 'maintenance' | 'eol';
  asset_checked: boolean;
  remark: string;
}

const APPLIANCE_TYPES = [
  { value: 'router', label: 'Router' },
  { value: 'firewall', label: 'Firewall' },
  { value: 'switch', label: 'Switch' },
];

const APPLIANCE_STATUSES = [
  { value: 'not_setup', label: 'Not Yet Setup', color: 'gray' },
  { value: 'in_use', label: 'In Use', color: 'green' },
  { value: 'maintenance', label: 'Maintenance', color: 'orange' },
  { value: 'eol', label: 'EOL', color: 'red' },
];

const NetworkApplianceManagement: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  
  const [appliances, setAppliances] = useState<NetworkAppliance[]>([]);
  const [filters, setFilters] = useState({ search: '', status: '', location: '', type: '' });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteAllOpen, onOpen: onDeleteAllOpen, onClose: onDeleteAllClose } = useDisclosure();
  const [selectedAppliance, setSelectedAppliance] = useState<NetworkAppliance | null>(null);
  const [formData, setFormData] = useState<NetworkApplianceFormData>({
    network_appliance_description: '',
    network_appliance_type: 'router',
    brand: '',
    model: '',
    serial_number: '',
    asset_tag: '',
    location: '',
    status: 'not_setup',
    asset_checked: false,
    remark: '',
  });
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  // Fetch network appliances from API
  const fetchAppliances = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/assets/list/network-appliances');
      if (response.ok) {
        const data = await response.json();
        // Transform backend data to frontend format
        const transformedAppliances: NetworkAppliance[] = data.map((asset: any) => {
          // Extract appliance info from notes
          const notes = asset.notes || '';
          const descriptionMatch = notes.match(/Description: ([^|]*)/);
          const remarkMatch = notes.match(/Remark: (.*)/);
          const assetCheckedMatch = notes.match(/Asset Checked: ([^|]*)/);
          
          return {
            id: asset.id,
            assigned_id: asset.asset_id, // System-generated ID
            network_appliance_description: descriptionMatch ? descriptionMatch[1].trim() : asset.model,
            network_appliance_type: asset.type as 'router' | 'firewall' | 'switch',
            brand: asset.brand || '',
            model: asset.model || '',
            serial_number: asset.serial_number || '',
            asset_tag: asset.asset_tag || '', // Finance department assigned tag
            location: asset.location || '',
            status: asset.status === 'AVAILABLE' ? 'not_setup' : 
                   asset.status === 'IN_USE' ? 'in_use' :
                   asset.status === 'MAINTENANCE' ? 'maintenance' : 'eol',
            asset_checked: assetCheckedMatch ? assetCheckedMatch[1].trim() === 'Yes' : false,
            remark: remarkMatch ? remarkMatch[1].trim() : '',
          };
        });
        setAppliances(transformedAppliances);
      }
    } catch (error) {
      console.error('Error fetching network appliances:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch network appliances',
        status: 'error',
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    fetchAppliances();
  }, []);

  // Handle URL parameters for filtering
  useEffect(() => {
    const typeFromUrl = searchParams.get('type');
    
    if (typeFromUrl && ['router', 'firewall', 'switch'].includes(typeFromUrl.toLowerCase())) {
      const normalizedType = typeFromUrl.toLowerCase();
      setFilters(prev => ({ ...prev, type: normalizedType }));
    } else {
      // Clear type filter if no valid type in URL
      setFilters(prev => ({ ...prev, type: '' }));
    }
  }, [searchParams]);

  const generateAssignedId = (type: string): string => {
    const prefixMap = {
      router: 'RTR',
      firewall: 'FWL',
      switch: 'SWT',
    };
    const prefix = prefixMap[type as keyof typeof prefixMap] || 'NET';
    const existingIds = appliances
      .filter(a => a.assigned_id.startsWith(prefix))
      .map(a => parseInt(a.assigned_id.split('-')[1]) || 0);
    const nextNumber = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    return `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
  };

  const handleAddAppliance = () => {
    setFormData({
      network_appliance_description: '',
      network_appliance_type: 'router',
      brand: '',
      model: '',
      serial_number: '',
      asset_tag: '',
      location: '',
      status: 'not_setup',
      asset_checked: false,
      remark: '',
    });
    setSelectedAppliance(null);
    onOpen();
  };

  const handleSubmit = () => {
    if (selectedAppliance) {
      // Update logic here
      const updatedAppliances = appliances.map(a => 
        a.id === selectedAppliance.id 
          ? { ...a, ...formData }
          : a
      );
      setAppliances(updatedAppliances);
    } else {
      // Add logic here
      const newAppliance: NetworkAppliance = {
        id: appliances.length + 1,
        assigned_id: generateAssignedId(formData.network_appliance_type),
        ...formData,
      };
      setAppliances([...appliances, newAppliance]);
    }
    onClose();
    toast({
      title: 'Network Appliance Saved',
      status: 'success',
      duration: 3000,
    });
  };

  const filteredAppliances = appliances.filter(appliance => {
    const matchesSearch = !filters.search || 
      appliance.assigned_id.toLowerCase().includes(filters.search.toLowerCase()) ||
      appliance.model.toLowerCase().includes(filters.search.toLowerCase()) ||
      appliance.asset_tag.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = !filters.status || appliance.status === filters.status;
    const matchesLocation = !filters.location || 
      appliance.location.toLowerCase().includes(filters.location.toLowerCase());
    const matchesType = !filters.type || appliance.network_appliance_type === filters.type;
    
    return matchesSearch && matchesStatus && matchesLocation && matchesType;
  });

  // Export CSV function
  const handleExport = () => {
    const csvContent = [
      // CSV headers
      [
        'Assigned ID',
        'Network Appliance Description',
        'Type',
        'Brand',
        'Model',
        'Serial Number',
        'Asset Tag',
        'Location',
        'Status',
        'Asset Checked',
        'Remark'
      ],
      // CSV data rows (filtered appliances)
      ...filteredAppliances.map(appliance => [
        appliance.assigned_id,
        appliance.network_appliance_description,
        appliance.network_appliance_type.charAt(0).toUpperCase() + appliance.network_appliance_type.slice(1),
        appliance.brand,
        appliance.model,
        appliance.serial_number,
        appliance.asset_tag,
        appliance.location,
        APPLIANCE_STATUSES.find(s => s.value === appliance.status)?.label || appliance.status,
        appliance.asset_checked ? 'Yes' : 'No',
        appliance.remark
      ])
    ];

    // Convert to CSV string
    const csvString = csvContent
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `network_appliances_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast({
      title: 'Export Successful',
      description: `Exported ${filteredAppliances.length} network appliances to CSV`,
      status: 'success',
      duration: 3000,
    });
  };

  // Download CSV template
  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/assets/import/network-appliances/template');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'network_appliances_import_template.csv';
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: 'Template Downloaded',
          description: 'Import template has been downloaded successfully',
          status: 'success',
          duration: 3000,
        });
      } else {
        throw new Error('Failed to download template');
      }
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to download import template',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Delete all network appliances
  const handleDeleteAll = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/assets/network-appliances/all', {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'All Records Deleted',
          description: `Successfully deleted ${result.deleted_count} network appliances`,
          status: 'success',
          duration: 5000,
        });
        
        // Refresh the appliance list
        fetchAppliances();
      } else {
        toast({
          title: 'Delete Failed',
          description: result.detail || 'Failed to delete network appliances',
          status: 'error',
          duration: 5000,
        });
      }
    } catch (error) {
      toast({
        title: 'Delete Error',
        description: 'Network error occurred during deletion',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
      onDeleteAllClose();
    }
  };

  // Import CSV function
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please select a CSV file',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/v1/assets/import/network-appliances', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Import Successful',
          description: `${result.imported_count} network appliances imported successfully${result.skipped_count > 0 ? `, ${result.skipped_count} duplicates skipped` : ''}`,
          status: 'success',
          duration: 5000,
        });
        
        // Refresh the appliance list
        fetchAppliances();
      } else {
        toast({
          title: 'Import Failed',
          description: result.detail || 'Failed to import network appliances',
          status: 'error',
          duration: 5000,
        });
      }
    } catch (error) {
      toast({
        title: 'Import Error',
        description: 'Network error occurred during import',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <Box minH="100vh" bgGradient="linear(to-br, purple.900, blue.800, teal.700)">
      <Container maxW="8xl" py={8}>
        <VStack spacing={6} align="stretch" mb={8}>
          <HStack justify="space-between" align="center">
            <Heading size="lg" color="white">
              Network Appliance Management
            </Heading>
            <Flex direction={{ base: 'column', md: 'row' }} gap={4} w="100%">
              {/* Export Section */}
              <HStack spacing={2}>
                <Button
                  leftIcon={<DownloadIcon />}
                  variant="outline"
                  size="md"
                  color="white"
                  borderColor="rgba(255, 255, 255, 0.3)"
                  _hover={{
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    bg: 'rgba(255, 255, 255, 0.1)'
                  }}
                  onClick={handleExport}
                >
                  Export CSV
                </Button>
              </HStack>

              <Spacer />

              {/* Import Section */}
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <VStack spacing={2} align="stretch" minW="300px">
                  <Text color="white" fontSize="sm" fontWeight="bold">
                    Import Network Appliances
                  </Text>
                  <HStack spacing={2}>
                    <Button
                      leftIcon={<DownloadIcon />}
                      variant="outline"
                      size="sm"
                      color="white"
                      borderColor="rgba(255, 255, 255, 0.3)"
                      _hover={{
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        bg: 'rgba(255, 255, 255, 0.1)'
                      }}
                      onClick={handleDownloadTemplate}
                      flex="1"
                    >
                      Download Template
                    </Button>
                    
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleImport}
                      style={{ display: 'none' }}
                      id="appliance-csv-import"
                    />
                    <Button
                      as="label"
                      htmlFor="appliance-csv-import"
                      leftIcon={<AttachmentIcon />}
                      variant="outline"
                      size="sm"
                      color="white"
                      borderColor="rgba(255, 255, 255, 0.3)"
                      _hover={{
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        bg: 'rgba(255, 255, 255, 0.1)'
                      }}
                      isLoading={isImporting}
                      loadingText="Importing..."
                      cursor="pointer"
                      flex="1"
                    >
                      Import CSV
                    </Button>
                  </HStack>
                  
                  {/* Testing Section */}
                  <Divider borderColor="rgba(255, 255, 255, 0.2)" />
                  <Text color="orange.300" fontSize="xs" fontWeight="bold">
                    Testing Functions
                  </Text>
                  <HStack spacing={2}>
                    <Button
                      leftIcon={<WarningIcon />}
                      colorScheme="red"
                      variant="outline"
                      size="sm"
                      onClick={onDeleteAllOpen}
                      isLoading={isDeleting}
                      loadingText="Deleting..."
                      flex="1"
                    >
                      Delete All Records
                    </Button>
                    <Button 
                      leftIcon={<AddIcon />} 
                      colorScheme="blue" 
                      size="sm"
                      onClick={handleAddAppliance}
                      flex="1"
                    >
                      Add Manual
                    </Button>
                  </HStack>
                </VStack>
              )}
            </Flex>
          </HStack>

          <Card bg="rgba(255, 255, 255, 0.1)" backdropFilter="blur(10px)">
            <CardBody>
              <HStack spacing={4} w="100%" flexWrap="wrap">
                <InputGroup flex="1" minW="250px">
                  <InputLeftElement>
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search network appliances..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    bg="rgba(255, 255, 255, 0.1)"
                    color="white"
                  />
                </InputGroup>
                
                <Select
                  placeholder="All Types"
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  minW="150px"
                  bg="rgba(255, 255, 255, 0.1)"
                  color="white"
                >
                  {APPLIANCE_TYPES.map(type => (
                    <option key={type.value} value={type.value} style={{ background: '#2D3748', color: 'white' }}>
                      {type.label}
                    </option>
                  ))}
                </Select>
                
                <Select
                  placeholder="All Statuses"
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  minW="150px"
                  bg="rgba(255, 255, 255, 0.1)"
                  color="white"
                >
                  {APPLIANCE_STATUSES.map(status => (
                    <option key={status.value} value={status.value} style={{ background: '#2D3748', color: 'white' }}>
                      {status.label}
                    </option>
                  ))}
                </Select>
              </HStack>
            </CardBody>
          </Card>
        </VStack>

        <Card bg="rgba(255, 255, 255, 0.1)" backdropFilter="blur(10px)">
          <CardBody p={0}>
            <Table variant="simple">
              <Thead bg="rgba(255, 255, 255, 0.15)">
                <Tr>
                  <Th color="white">Assigned ID</Th>
                  <Th color="white">Description</Th>
                  <Th color="white">Type</Th>
                  <Th color="white">Brand</Th>
                  <Th color="white">Model</Th>
                  <Th color="white">Asset Tag</Th>
                  <Th color="white">Location</Th>
                  <Th color="white">Status</Th>
                  <Th color="white">Checked</Th>
                  <Th color="white">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredAppliances.map((appliance) => (
                  <Tr key={appliance.id}>
                    <Td color="white">{appliance.assigned_id}</Td>
                    <Td color="white">{appliance.network_appliance_description}</Td>
                    <Td color="white" textTransform="capitalize">{appliance.network_appliance_type}</Td>
                    <Td color="gray.200">{appliance.brand}</Td>
                    <Td color="gray.200">{appliance.model}</Td>
                    <Td color="gray.200">
                      {appliance.asset_tag || (
                        <Text color="gray.400" fontSize="sm" fontStyle="italic">
                          Not assigned
                        </Text>
                      )}
                    </Td>
                    <Td color="gray.200">{appliance.location}</Td>
                    <Td>
                      <Badge colorScheme={APPLIANCE_STATUSES.find(s => s.value === appliance.status)?.color}>
                        {APPLIANCE_STATUSES.find(s => s.value === appliance.status)?.label}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme={appliance.asset_checked ? 'green' : 'red'}>
                        {appliance.asset_checked ? 'Yes' : 'No'}
                      </Badge>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton as={IconButton} icon={<HamburgerIcon />} variant="ghost" size="sm" />
                        <MenuList bg="rgba(26, 32, 44, 0.95)">
                          <MenuItem icon={<EditIcon />} onClick={() => {
                            setFormData({
                              network_appliance_description: appliance.network_appliance_description,
                              network_appliance_type: appliance.network_appliance_type,
                              brand: appliance.brand,
                              model: appliance.model,
                              serial_number: appliance.serial_number,
                              asset_tag: appliance.asset_tag,
                              location: appliance.location,
                              status: appliance.status,
                              asset_checked: appliance.asset_checked,
                              remark: appliance.remark,
                            });
                            setSelectedAppliance(appliance);
                            onOpen();
                          }}>
                            Edit
                          </MenuItem>
                          <MenuItem icon={<DeleteIcon />} color="red.500">Delete</MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>

        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent bg="rgba(26, 32, 44, 0.95)">
            <ModalHeader color="white">
              {selectedAppliance ? 'Edit' : 'Add'} Network Appliance
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel color="white">Network Appliance Type</FormLabel>
                  <Select
                    value={formData.network_appliance_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, network_appliance_type: e.target.value as 'router' | 'firewall' | 'switch' }))}
                    bg="rgba(255, 255, 255, 0.1)"
                    color="white"
                  >
                    {APPLIANCE_TYPES.map(type => (
                      <option key={type.value} value={type.value} style={{ background: '#2D3748', color: 'white' }}>
                        {type.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel color="white">Network Appliance Description</FormLabel>
                  <Input
                    value={formData.network_appliance_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, network_appliance_description: e.target.value }))}
                    bg="rgba(255, 255, 255, 0.1)"
                    color="white"
                    placeholder="Brief description of the network appliance purpose"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="white">Brand (Required)</FormLabel>
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    bg="rgba(255, 255, 255, 0.1)"
                    color="white"
                    placeholder="Manufacturer brand (e.g., Cisco, Fortinet)"
                    required
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="white">Model (Required)</FormLabel>
                  <Input
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    bg="rgba(255, 255, 255, 0.1)"
                    color="white"
                    placeholder="Specific model (e.g., ISR 4431, FortiGate 60F)"
                    required
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="white">Serial Number</FormLabel>
                  <Input
                    value={formData.serial_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, serial_number: e.target.value }))}
                    bg="rgba(255, 255, 255, 0.1)"
                    color="white"
                    placeholder="Manufacturer serial number (optional)"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="white">Asset Tag</FormLabel>
                  <Input
                    value={formData.asset_tag}
                    onChange={(e) => setFormData(prev => ({ ...prev, asset_tag: e.target.value }))}
                    bg="rgba(255, 255, 255, 0.1)"
                    color="white"
                    placeholder="Asset tag from finance department"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="white">Location</FormLabel>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    bg="rgba(255, 255, 255, 0.1)"
                    color="white"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="white">Status</FormLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'not_setup' | 'in_use' | 'maintenance' | 'eol' }))}
                    bg="rgba(255, 255, 255, 0.1)"
                    color="white"
                  >
                    {APPLIANCE_STATUSES.map(status => (
                      <option key={status.value} value={status.value} style={{ background: '#2D3748', color: 'white' }}>
                        {status.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <Checkbox
                    isChecked={formData.asset_checked}
                    onChange={(e) => setFormData(prev => ({ ...prev, asset_checked: e.target.checked }))}
                    colorScheme="blue"
                    color="white"
                  >
                    Asset Checked
                  </Checkbox>
                </FormControl>
                <FormControl>
                  <FormLabel color="white">Remark</FormLabel>
                  <Textarea
                    value={formData.remark}
                    onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
                    bg="rgba(255, 255, 255, 0.1)"
                    color="white"
                    rows={3}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
              <Button colorScheme="blue" onClick={handleSubmit}>Save</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete All Confirmation Dialog */}
        <AlertDialog
          isOpen={isDeleteAllOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeleteAllClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent bg="rgba(26, 32, 44, 0.95)">
              <AlertDialogHeader fontSize="lg" fontWeight="bold" color="white">
                Delete All Network Appliances
              </AlertDialogHeader>

              <AlertDialogBody color="white">
                <VStack align="start" spacing={3}>
                  <Text>
                    Are you sure you want to delete <strong>ALL</strong> network appliances? 
                    This action cannot be undone.
                  </Text>
                  <Text color="orange.300" fontSize="sm">
                    This will permanently remove all routers, firewalls, and switches from the database.
                  </Text>
                  <Text color="red.300" fontSize="sm" fontWeight="bold">
                    ⚠️ This is intended for testing purposes only!
                  </Text>
                </VStack>
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onDeleteAllClose}>
                  Cancel
                </Button>
                <Button 
                  colorScheme="red" 
                  onClick={handleDeleteAll} 
                  ml={3}
                  isLoading={isDeleting}
                  loadingText="Deleting..."
                >
                  Delete All
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Container>
    </Box>
  );
};

export default NetworkApplianceManagement;
