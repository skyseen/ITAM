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
} from '@chakra-ui/react';
import {
  SearchIcon,
  EditIcon,
  DeleteIcon,
  HamburgerIcon,
  AddIcon,
  DownloadIcon,
  AttachmentIcon,
} from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';

interface Server {
  id: number;
  assigned_id: string;
  server_description: string;
  server_name: string;
  model: string;
  asset_tag: string;
  location: string;
  status: 'available' | 'in_use' | 'maintenance' | 'retired';
  os: string;
  os_version: string;
  asset_checked: boolean;
  remark: string;
}

const SERVER_STATUSES = [
  { value: 'available', label: 'Available', color: 'blue' },
  { value: 'in_use', label: 'In Use', color: 'green' },
  { value: 'maintenance', label: 'Maintenance', color: 'orange' },
  { value: 'retired', label: 'Retired', color: 'red' },
];

const ServerManagement: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  
  const [servers, setServers] = useState<Server[]>([]);
  const [filters, setFilters] = useState({ search: '', status: '', location: '' });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
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
          const serverMatch = notes.match(/Server: ([^|]*)/);
          const osMatch = notes.match(/OS: ([^|]*)/);
          const remarkMatch = notes.match(/Remark: (.*)/);
          
          return {
            id: asset.id,
            assigned_id: asset.asset_id, // System-generated ID
            server_description: serverMatch ? serverMatch[1].trim() : asset.model,
            server_name: serverMatch ? serverMatch[1].trim() : `Server ${asset.asset_id}`,
            model: asset.model,
            asset_tag: asset.asset_tag || '', // Finance department assigned tag
            location: asset.location || '',
            status: asset.status === 'available' ? 'available' : 
                   asset.status === 'in_use' ? 'in_use' :
                   asset.status === 'maintenance' ? 'maintenance' : 'retired',
            os: osMatch ? osMatch[1].trim().split(' ')[0] : '',
            os_version: osMatch ? osMatch[1].trim().split(' ').slice(1).join(' ') : '',
            asset_checked: Math.random() > 0.5, // Random for now, you can add this field to backend
            remark: remarkMatch ? remarkMatch[1].trim() : '',
          };
        });
        setServers(transformedServers);
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
          status: formData.status,
          notes: `Server: ${formData.server_name} | OS: ${formData.os} ${formData.os_version} | Description: ${formData.server_description} | Remark: ${formData.remark}`
        };

        const response = await fetch(`http://localhost:8000/api/v1/assets/${selectedServer.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        if (response.ok) {
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
          const result = await response.json();
          throw new Error(result.detail || 'Failed to update server');
        }
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
          notes: `Server: ${formData.server_name} | OS: ${formData.os} ${formData.os_version} | Description: ${formData.server_description} | Remark: ${formData.remark}`
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
      const response = await fetch(`http://localhost:8000/api/v1/assets/${server.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Server Deleted',
          description: `Server ${server.assigned_id} has been deleted successfully.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Refresh the server list
        fetchServers();
      } else {
        const result = await response.json();
        toast({
          title: 'Delete Failed',
          description: result.detail || 'Failed to delete server',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
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
    const matchesLocation = !filters.location || 
      server.location.toLowerCase().includes(filters.location.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesLocation;
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
          <HStack justify="space-between" align="center">
            <Heading size="lg" color="white">
              Server Management
            </Heading>
            <HStack spacing={4}>
              {/* Export Button */}
              <Button
                leftIcon={<DownloadIcon />}
                variant="outline"
                onClick={handleExport}
                size="md"
                color="white"
                borderColor="rgba(255, 255, 255, 0.3)"
                _hover={{
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  bg: 'rgba(255, 255, 255, 0.1)'
                }}
              >
                Export CSV
              </Button>
              
              {/* Import Button */}
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <Box>
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
                    variant="outline"
                    size="md"
                    color="white"
                    borderColor="rgba(255, 255, 255, 0.3)"
                    _hover={{
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      bg: 'rgba(255, 255, 255, 0.1)'
                    }}
                    isLoading={isImporting}
                    loadingText="Importing..."
                    cursor="pointer"
                  >
                    Import CSV
                  </Button>
                </Box>
              )}
              
              {/* Add Server Button */}
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleAddServer}>
                  Add Server
                </Button>
              )}
            </HStack>
          </HStack>

          <Card bg="rgba(255, 255, 255, 0.1)" backdropFilter="blur(10px)">
            <CardBody>
              <HStack spacing={4} w="100%">
                <InputGroup flex="1">
                  <InputLeftElement>
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search servers..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    bg="rgba(255, 255, 255, 0.1)"
                    color="white"
                  />
                </InputGroup>
                
                <Select
                  placeholder="All Statuses"
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  minW="150px"
                  bg="rgba(255, 255, 255, 0.1)"
                  color="white"
                >
                  {SERVER_STATUSES.map(status => (
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
                  <Th color="white">Server Description</Th>
                  <Th color="white">Server Name</Th>
                  <Th color="white">Model</Th>
                  <Th color="white">Asset Tag</Th>
                  <Th color="white">Location</Th>
                  <Th color="white">Status</Th>
                  <Th color="white">OS</Th>
                  <Th color="white">assetChecked</Th>
                  <Th color="white">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredServers.map((server) => (
                  <Tr key={server.id}>
                    <Td color="white">{server.assigned_id}</Td>
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
                    <Td color="gray.200">{server.os} {server.os_version}</Td>
                    <Td>
                      <Badge colorScheme={server.asset_checked ? 'green' : 'red'}>
                        {server.asset_checked ? 'Yes' : 'No'}
                      </Badge>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton as={IconButton} icon={<HamburgerIcon />} variant="ghost" size="sm" />
                        <MenuList bg="rgba(26, 32, 44, 0.95)">
                          <MenuItem icon={<EditIcon />} onClick={() => {
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
                          }}>
                            Edit
                          </MenuItem>
                          <MenuItem 
                            icon={<DeleteIcon />} 
                            color="red.500"
                            onClick={() => prepareDelete(server)}
                          >
                            Delete
                          </MenuItem>
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
              {selectedServer ? 'Edit' : 'Add'} Server
            </ModalHeader>
            <ModalCloseButton color="white" />
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
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
              <Button colorScheme="blue" onClick={handleSubmit}>Save</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

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
