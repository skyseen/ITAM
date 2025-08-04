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
import { useAuth, api } from '../contexts/AuthContext';

interface Server {
  id: number;
  assigned_id: string;
  server_description: string;
  server_name: string;
  model: string;
  asset_tag: string;
  location: string;
  status: 'available' | 'pending_for_signature' | 'in_use' | 'maintenance' | 'retired';
  os: string;
  os_version: string;
  asset_checked: boolean;
  remark: string;
}

const SERVER_STATUSES = [
  { value: 'available', label: 'Available', color: 'blue' },
  { value: 'pending_for_signature', label: 'Pending Signature', color: 'yellow' },
  { value: 'in_use', label: 'In Use', color: 'green' },
  { value: 'maintenance', label: 'Maintenance', color: 'orange' },
  { value: 'retired', label: 'Retired', color: 'red' },
];

const ServerManagement: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  
  const [servers, setServers] = useState<Server[]>([]);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [lastUpdatedId, setLastUpdatedId] = useState<number | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isDeleteAllOpen, onOpen: onDeleteAllOpen, onClose: onDeleteAllClose } = useDisclosure();
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [serverToDelete, setServerToDelete] = useState<Server | null>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const [formData, setFormData] = useState({
    server_description: '',
    server_name: '',
    model: '',
    asset_tag: '',
    location: '',
    status: 'available',
    os: '',
    os_version: '',
    asset_checked: false,
    remark: '',
  });
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch servers from API
  const fetchServers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/assets/list/servers');
      if (response.ok) {
        const data = await response.json();
        // Transform backend data to frontend format
        const transformedServers: Server[] = data.map((asset: any) => {
          // Extract server info from notes
          const notes = asset.notes || '';
          const serverNameMatch = notes.match(/Server: ([^|]*)/);
          const descriptionMatch = notes.match(/Description: ([^|]*)/);
          const remarkMatch = notes.match(/Remark: (.*)/);
          const assetCheckedMatch = notes.match(/Asset Checked: ([^|]*)/);
          
          return {
            id: asset.id,
            assigned_id: asset.asset_id, // System-generated ID
            server_description: descriptionMatch ? descriptionMatch[1].trim() : asset.model,
            server_name: asset.serial_number || (serverNameMatch ? serverNameMatch[1].trim() : `Server ${asset.asset_id}`),
            model: asset.model,
            asset_tag: asset.asset_tag || '', // Finance department assigned tag
            location: asset.location || '',
            status: asset.status === 'available' ? 'available' : 
                   asset.status === 'in_use' ? 'in_use' :
                   asset.status === 'maintenance' ? 'maintenance' : 'retired',
            os: asset.os || '',  // Use separate OS field from database
            os_version: asset.os_version || '',  // Use separate OS version field from database
            asset_checked: assetCheckedMatch ? assetCheckedMatch[1].trim() === 'Yes' : false,
            remark: remarkMatch ? remarkMatch[1].trim() : '',
          };
        });
        
        // Sort servers consistently by assigned_id to maintain order
        const sortedServers = transformedServers.sort((a, b) => {
          // If there's a recently updated item, prioritize it for visual feedback
          if (lastUpdatedId) {
            if (a.id === lastUpdatedId) return -1;
            if (b.id === lastUpdatedId) return 1;
          }
          // Otherwise sort by assigned_id
          return a.assigned_id.localeCompare(b.assigned_id);
        });
        
        setServers(sortedServers);
        
        // Clear the last updated ID after a short delay to return to normal sorting
        if (lastUpdatedId) {
          setTimeout(() => setLastUpdatedId(null), 3000);
        }
      }
    } catch (error) {
      console.error('Error fetching servers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch servers',
        status: 'error',
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  // Generate system-assigned ID for new servers
  const generateAssignedId = (): string => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `SRV-${timestamp}${random}`;
  };

  const handleAddServer = () => {
    setFormData({
      server_description: '',
      server_name: '',
      model: '',
      asset_tag: '',
      location: '',
      status: 'available',
      os: '',
      os_version: '',
      asset_checked: false,
      remark: '',
    });
    setSelectedServer(null);
    onOpen();
  };

  const handleSubmit = async () => {
    try {
      if (selectedServer) {
        // Update existing server
        const updateData = {
          type: 'server',
          brand: formData.model.split(' ')[0] || 'Generic', // Extract brand from model
          model: formData.model,
          serial_number: formData.server_name || null, // Use server name as serial for uniqueness
          asset_tag: formData.asset_tag,
          department: 'IT',
          location: formData.location,
          condition: 'Good',
          status: formData.status, // Use form status for updates
          os: formData.os || null, // Store OS in separate field
          os_version: formData.os_version || null, // Store OS version in separate field
          notes: `Server: ${formData.server_name} | Description: ${formData.server_description} | Asset Checked: ${formData.asset_checked ? 'Yes' : 'No'} | Remark: ${formData.remark}`
        };

        const response = await api.put(`/assets/${selectedServer.id}`, updateData);

        // Axios automatically handles success
        setLastUpdatedId(selectedServer.id);
        toast({
          title: 'Server Updated',
          description: `${selectedServer.assigned_id} has been updated successfully.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Refresh the server list
        fetchServers();
      } else {
        // Generate unique server ID
        const existingIds = servers
          .filter(s => s.assigned_id.startsWith('SRV-'))
          .map(s => parseInt(s.assigned_id.split('-')[1]) || 0);
        const nextNumber = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
        const serverId = `SRV-${nextNumber.toString().padStart(3, '0')}`;

        // Create new server
        const createData = {
          asset_id: serverId,
          type: 'server',
          brand: formData.model.split(' ')[0] || 'Generic', // Extract brand from model
          model: formData.model,
          serial_number: formData.server_name || null, // Use server name as serial for uniqueness
          asset_tag: formData.asset_tag,
          department: 'IT',
          location: formData.location,
          purchase_date: new Date().toISOString(),
          warranty_expiry: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 3 years from now
          condition: 'Good',
          status: 'available', // Default status for new servers
          os: formData.os || null, // Store OS in separate field
          os_version: formData.os_version || null, // Store OS version in separate field
          notes: `Server: ${formData.server_name} | Description: ${formData.server_description} | Asset Checked: ${formData.asset_checked ? 'Yes' : 'No'} | Remark: ${formData.remark}`
        };

        const response = await fetch('http://localhost:8000/api/v1/assets/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createData),
        });

        if (response.ok) {
          toast({
            title: 'Server Created',
            description: `${createData.asset_id} has been created successfully.`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          
          // Refresh the server list
          fetchServers();
        } else {
          const result = await response.json();
          throw new Error(result.detail || 'Failed to create server');
        }
      }
      
      onClose();
    } catch (error: any) {
      toast({
        title: selectedServer ? 'Update Failed' : 'Creation Failed',
        description: error.message || 'An error occurred while saving the server',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle individual server deletion
  const handleDelete = async (server: Server) => {
    try {
      const response = await api.delete(`/assets/${server.id}`);

      // Axios automatically handles success
      toast({
        title: 'Server Deleted',
        description: `Server ${server.assigned_id} has been deleted successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh the server list
      fetchServers();
    } catch (error: any) {
      toast({
        title: 'Delete Error',
        description: 'Network error occurred during deletion',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Prepare individual delete action
  const prepareDelete = (server: Server) => {
    setServerToDelete(server);
    onDeleteOpen();
  };

  // Filter servers based on search and status filters
  const filteredServers = servers.filter(server => {
    const matchesSearch = !filters.search || 
      server.assigned_id.toLowerCase().includes(filters.search.toLowerCase()) ||
      server.server_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      server.server_description.toLowerCase().includes(filters.search.toLowerCase()) ||
      server.model.toLowerCase().includes(filters.search.toLowerCase()) ||
      server.asset_tag.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = !filters.status || server.status === filters.status;
    
    return matchesSearch && matchesStatus;
  });

  // Export CSV function
  const handleExport = () => {
    const csvContent = [
      // CSV headers
      [
        'Assigned ID',
        'Server Description', 
        'Server Name',
        'Model',
        'Asset Tag',
        'Location',
        'Status',
        'OS',
        'OS Version',
        'Asset Checked',
        'Remark'
      ],
      // CSV data rows (filtered servers)
      ...filteredServers.map(server => [
        server.assigned_id,
        server.server_description,
        server.server_name,
        server.model,
        server.asset_tag,
        server.location,
        SERVER_STATUSES.find(s => s.value === server.status)?.label || server.status,
        server.os,
        server.os_version,
        server.asset_checked ? 'Yes' : 'No',
        server.remark
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
      link.setAttribute('download', `servers_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast({
      title: 'Export Successful',
      description: `Exported ${filteredServers.length} servers to CSV`,
      status: 'success',
      duration: 3000,
    });
  };

  // Download CSV template
  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/assets/import/servers/template');
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'servers_import_template.csv';
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
          title: 'Template Downloaded',
          description: 'Server import template has been downloaded successfully.',
          status: 'success',
          duration: 3000,
        });
      } else {
        throw new Error('Failed to download template');
      }
    } catch (error) {
      toast({
        title: 'Download Error',
        description: 'Failed to download server import template.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Delete all servers (for testing purposes)
  const handleDeleteAll = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/assets/delete-all/servers', {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'All Servers Deleted',
          description: `${result.deleted_count} servers have been deleted successfully.`,
          status: 'success',
          duration: 5000,
        });
        
        // Refresh the server list
        fetchServers();
        onDeleteAllClose();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Delete Failed',
          description: errorData.detail || 'Failed to delete all servers',
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
      const response = await fetch('http://localhost:8000/api/v1/assets/import/servers', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Import Successful',
          description: `${result.imported_count} servers imported successfully${result.skipped_count > 0 ? `, ${result.skipped_count} duplicates skipped` : ''}`,
          status: 'success',
          duration: 5000,
        });
        
        // Refresh the server list
        fetchServers();
      } else {
        toast({
          title: 'Import Failed',
          description: result.detail || 'Failed to import servers',
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
          <HStack justify="space-between" align="start" mb={6}>
            <Heading 
              size="xl" 
              color="white" 
              fontWeight="bold"
              textShadow="2px 2px 4px rgba(0,0,0,0.3)"
            >
              🖥️ Server Management
            </Heading>
            {/* Improved Button Layout */}
            <Flex direction={{ base: 'column', lg: 'row' }} gap={6} w="100%" align="start">
              
              <Spacer />

              {/* Main Action Buttons - Always Visible - Moved to Right */}
              <VStack spacing={3} align="stretch" minW={{ base: "100%", lg: "300px" }}>
                <Text color="white" fontSize="sm" fontWeight="bold" mb={1} textAlign="right">
                  📋 Quick Actions
                </Text>
                <HStack spacing={3} justifyContent="flex-end" flexWrap="wrap">
                  <Button 
                    leftIcon={<AddIcon />} 
                    colorScheme="blue" 
                    size="md"
                    onClick={handleAddServer}
                    minW="140px"
                    _hover={{
                      transform: 'translateY(-1px)',
                      boxShadow: 'lg'
                    }}
                    transition="all 0.2s"
                  >
                    Add New
                  </Button>
                  <Button
                    leftIcon={<DownloadIcon />}
                    variant="outline"
                    size="md"
                    color="white"
                    borderColor="rgba(255, 255, 255, 0.4)"
                    _hover={{
                      borderColor: 'rgba(255, 255, 255, 0.7)',
                      bg: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-1px)',
                      boxShadow: 'lg'
                    }}
                    onClick={handleExport}
                    minW="140px"
                    transition="all 0.2s"
                  >
                    Export CSV
                  </Button>
                </HStack>
              </VStack>

              {/* Admin/Manager Functions */}
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <VStack spacing={3} align="stretch" minW={{ base: "100%", lg: "350px" }}>
                  <Text color="white" fontSize="sm" fontWeight="bold" mb={1} textAlign="right">
                    🔧 Management Tools
                  </Text>
                  
                  {/* Import Section */}
                  <Card bg="rgba(255, 255, 255, 0.05)" borderRadius="md" p={3}>
                    <VStack spacing={3} align="stretch">
                      <Text color="gray.300" fontSize="xs" fontWeight="medium">
                        Import Servers
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
                            bg: 'rgba(255, 255, 255, 0.1)',
                            transform: 'translateY(-1px)'
                          }}
                          onClick={handleDownloadTemplate}
                          flex="1"
                          transition="all 0.2s"
                        >
                          Template
                        </Button>
                        
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleImport}
                          style={{ display: 'none' }}
                          id="server-csv-import"
                        />
                        <Button
                          as="label"
                          htmlFor="server-csv-import"
                          leftIcon={<AttachmentIcon />}
                          colorScheme="green"
                          variant="outline"
                          size="sm"
                          isLoading={isImporting}
                          loadingText="Importing..."
                          cursor="pointer"
                          flex="1"
                          _hover={{
                            transform: 'translateY(-1px)',
                            boxShadow: 'md'
                          }}
                          transition="all 0.2s"
                        >
                          Import CSV
                        </Button>
                      </HStack>
                    </VStack>
                  </Card>
                  
                  {/* Testing Section */}
                  <Card bg="rgba(255, 165, 0, 0.1)" borderRadius="md" p={3} borderColor="rgba(255, 165, 0, 0.3)" borderWidth="1px">
                    <VStack spacing={3} align="stretch">
                      <Text color="orange.300" fontSize="xs" fontWeight="bold">
                        ⚠️ Testing Functions
                      </Text>
                      <Button
                        leftIcon={<WarningIcon />}
                        colorScheme="red"
                        variant="outline"
                        size="sm"
                        onClick={onDeleteAllOpen}
                        isLoading={isDeleting}
                        loadingText="Deleting..."
                        _hover={{
                          transform: 'translateY(-1px)',
                          boxShadow: 'md'
                        }}
                        transition="all 0.2s"
                      >
                        Delete All Records
                      </Button>
                    </VStack>
                  </Card>
                </VStack>
              )}
            </Flex>
          </HStack>

          <Card bg="rgba(255, 255, 255, 0.1)" backdropFilter="blur(10px)" borderRadius="xl" border="1px solid rgba(255, 255, 255, 0.1)">
            <CardBody>
              <VStack spacing={3} align="stretch">
                <Text color="white" fontSize="sm" fontWeight="bold">
                  🔍 Search & Filter
                </Text>
                <HStack spacing={4} w="100%" flexWrap="wrap">
                  <InputGroup flex="1" minW="250px">
                    <InputLeftElement>
                      <SearchIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search by ID, name, model, or asset tag..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      bg="rgba(255, 255, 255, 0.1)"
                      color="white"
                      borderColor="rgba(255, 255, 255, 0.2)"
                      _hover={{
                        borderColor: 'rgba(255, 255, 255, 0.3)'
                      }}
                      _focus={{
                        borderColor: 'blue.400',
                        boxShadow: '0 0 0 1px rgba(66, 153, 225, 0.6)'
                      }}
                    />
                  </InputGroup>
                  
                  <Select
                    placeholder="All Statuses"
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    minW="150px"
                    bg="rgba(255, 255, 255, 0.1)"
                    color="white"
                    borderColor="rgba(255, 255, 255, 0.2)"
                    _hover={{
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    }}
                    _focus={{
                      borderColor: 'blue.400'
                    }}
                  >
                    {SERVER_STATUSES.map(status => (
                      <option key={status.value} value={status.value} style={{ background: '#2D3748', color: 'white' }}>
                        {status.label}
                      </option>
                    ))}
                  </Select>
                  

                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>

        <Card bg="rgba(255, 255, 255, 0.1)" backdropFilter="blur(10px)" borderRadius="xl" border="1px solid rgba(255, 255, 255, 0.1)">
          <CardBody p={0}>
            <Box overflowX="auto">
              <Table variant="simple">
              <Thead bg="rgba(255, 255, 255, 0.15)">
                <Tr>
                  <Th color="white">Assigned ID</Th>
                  <Th color="white">Description</Th>
                  <Th color="white">Server Name</Th>
                  <Th color="white">Model</Th>
                  <Th color="white">Asset Tag</Th>
                  <Th color="white">Location</Th>
                  <Th color="white">Status</Th>
                  <Th color="white">OS</Th>
                  <Th color="white">OS Version</Th>
                  <Th color="white">Checked</Th>
                  <Th color="white">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredServers.map((server) => (
                  <Tr 
                    key={server.id}
                    bg={server.id === lastUpdatedId ? 'rgba(66, 153, 225, 0.2)' : 'transparent'}
                    _hover={{
                      bg: server.id === lastUpdatedId ? 'rgba(66, 153, 225, 0.3)' : 'rgba(255, 255, 255, 0.05)'
                    }}
                    transition="all 0.3s"
                  >
                    <Td color="white">
                      <HStack spacing={2}>
                        <Text>{server.assigned_id}</Text>
                        {server.id === lastUpdatedId && (
                          <Badge colorScheme="blue" size="sm" fontSize="xs">
                            ✨ Updated
                          </Badge>
                        )}
                      </HStack>
                    </Td>
                    <Td color="white">{server.server_description}</Td>
                    <Td color="white">{server.server_name}</Td>
                    <Td color="gray.200">{server.model}</Td>
                    <Td color="gray.200">
                      {server.asset_tag || (
                        <Text color="gray.400" fontSize="sm" fontStyle="italic">
                          Not assigned
                        </Text>
                      )}
                    </Td>
                    <Td color="gray.200">{server.location}</Td>
                    <Td>
                      <Badge colorScheme={SERVER_STATUSES.find(s => s.value === server.status)?.color}>
                        {SERVER_STATUSES.find(s => s.value === server.status)?.label}
                      </Badge>
                    </Td>
                    <Td color="gray.200">{server.os || '-'}</Td>
                    <Td color="gray.200">{server.os_version || '-'}</Td>
                    <Td>
                      <Badge colorScheme={server.asset_checked ? 'green' : 'red'}>
                        {server.asset_checked ? 'Yes' : 'No'}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          icon={<EditIcon />}
                          size="sm"
                          variant="solid"
                          bg="white"
                          color="gray.800"
                          aria-label="Edit server"
                          _hover={{
                            bg: 'gray.100',
                            transform: 'translateY(-1px)',
                            boxShadow: 'md'
                          }}
                          transition="all 0.2s"
                          onClick={() => {
                            setFormData({
                              server_description: server.server_description,
                              server_name: server.server_name,
                              model: server.model,
                              asset_tag: server.asset_tag,
                              location: server.location,
                              status: server.status,
                              os: server.os,
                              os_version: server.os_version,
                              asset_checked: server.asset_checked,
                              remark: server.remark,
                            });
                            setSelectedServer(server);
                            onOpen();
                          }}
                        />
                        <IconButton
                          icon={<DeleteIcon />}
                          size="sm"
                          variant="outline"
                          colorScheme="red"
                          aria-label="Delete server"
                          _hover={{
                            transform: 'translateY(-1px)',
                            boxShadow: 'md'
                          }}
                          transition="all 0.2s"
                          onClick={() => prepareDelete(server)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            </Box>
          </CardBody>
        </Card>

        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay bg="rgba(0, 0, 0, 0.6)" backdropFilter="blur(4px)" />
          <ModalContent bg="rgba(26, 32, 44, 0.95)" borderRadius="xl" border="1px solid rgba(255, 255, 255, 0.1)">
            <ModalHeader 
              color="white" 
              bg="rgba(255, 255, 255, 0.05)" 
              borderBottom="1px solid rgba(255, 255, 255, 0.1)"
              borderTopRadius="xl"
              fontSize="lg"
              fontWeight="bold"
            >
              🖥️ {selectedServer ? 'Edit' : 'Add New'} Server
            </ModalHeader>
            <ModalCloseButton 
              color="white" 
              _hover={{
                bg: 'rgba(255, 255, 255, 0.1)'
              }}
            />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel color="white">Server Description</FormLabel>
                  <Input
                    value={formData.server_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, server_description: e.target.value }))}
                    bg="rgba(255, 255, 255, 0.1)"
                    color="white"
                    placeholder="Brief description of the server purpose"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="white">Server Name</FormLabel>
                  <Input
                    value={formData.server_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, server_name: e.target.value }))}
                    bg="rgba(255, 255, 255, 0.1)"
                    color="white"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="white">Model</FormLabel>
                  <Input
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    bg="rgba(255, 255, 255, 0.1)"
                    color="white"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="white">Asset Tag</FormLabel>
                  <Input
                    value={formData.asset_tag}
                    onChange={(e) => setFormData(prev => ({ ...prev, asset_tag: e.target.value }))}
                    bg="rgba(255, 255, 255, 0.1)"
                    color="white"
                    placeholder="e.g., FIN-2024-001, COMP-12345"
                  />
                  <Text color="gray.300" fontSize="sm" mt={1}>
                    Finance department assigned tag for asset tracking
                  </Text>
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
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    bg="rgba(255, 255, 255, 0.1)"
                    color="white"
                  >
                    {SERVER_STATUSES.map(status => (
                      <option key={status.value} value={status.value} style={{ background: '#2D3748', color: 'white' }}>
                        {status.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel color="white">Operating System</FormLabel>
                  <Input
                    value={formData.os}
                    onChange={(e) => setFormData(prev => ({ ...prev, os: e.target.value }))}
                    bg="rgba(255, 255, 255, 0.1)"
                    color="white"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="white">OS Version</FormLabel>
                  <Input
                    value={formData.os_version}
                    onChange={(e) => setFormData(prev => ({ ...prev, os_version: e.target.value }))}
                    bg="rgba(255, 255, 255, 0.1)"
                    color="white"
                  />
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
            <ModalFooter bg="rgba(255, 255, 255, 0.05)" borderTop="1px solid rgba(255, 255, 255, 0.1)">
              <Button 
                variant="outline" 
                mr={3} 
                onClick={onClose}
                color="white"
                borderColor="rgba(255, 255, 255, 0.3)"
                _hover={{
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  bg: 'rgba(255, 255, 255, 0.1)'
                }}
              >
                Cancel
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={handleSubmit}
                _hover={{
                  transform: 'translateY(-1px)',
                  boxShadow: 'lg'
                }}
                transition="all 0.2s"
              >
                {selectedServer ? 'Update' : 'Create'} Server
              </Button>
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
                Delete All Servers
              </AlertDialogHeader>

              <AlertDialogBody color="white">
                <VStack align="start" spacing={3}>
                  <Text>
                    Are you sure you want to delete <strong>ALL</strong> servers? 
                    This action cannot be undone.
                  </Text>
                  <Text color="orange.300" fontSize="sm">
                    This will permanently remove all servers from the database.
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

        {/* Individual Delete Confirmation Dialog */}
        <AlertDialog
          isOpen={isDeleteOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeleteClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent bg="rgba(26, 32, 44, 0.95)">
              <AlertDialogHeader fontSize="lg" fontWeight="bold" color="white">
                Delete Server
              </AlertDialogHeader>

              <AlertDialogBody color="white">
                {serverToDelete && (
                  <VStack align="start" spacing={3}>
                    <Text>
                      Are you sure you want to delete <strong>{serverToDelete.assigned_id}</strong>?
                    </Text>
                    <Text color="gray.300" fontSize="sm">
                      <strong>Server Name:</strong> {serverToDelete.server_name}
                    </Text>
                    <Text color="gray.300" fontSize="sm">
                      <strong>Model:</strong> {serverToDelete.model}
                    </Text>
                    <Text color="red.300" fontSize="sm">
                      This action cannot be undone.
                    </Text>
                  </VStack>
                )}
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onDeleteClose}>
                  Cancel
                </Button>
                <Button 
                  colorScheme="red" 
                  onClick={() => {
                    if (serverToDelete) {
                      handleDelete(serverToDelete);
                      onDeleteClose();
                      setServerToDelete(null);
                    }
                  }} 
                  ml={3}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Container>
    </Box>
  );
};

export default ServerManagement;
