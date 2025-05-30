import React, { useEffect, useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Heading,
  HStack,
  Select,
  Input,
  useToast,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

interface Asset {
  id: number;
  asset_id: string;
  type: string;
  brand: string;
  model: string;
  department: string;
  status: string;
  assigned_user: string | null;
}

const AssetList: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    department: '',
    search: '',
  });
  const toast = useToast();

  useEffect(() => {
    fetchAssets();
  }, [filter]);

  const fetchAssets = async () => {
    try {
      // TODO: Replace with actual API call
      // Mock data for now
      setAssets([
        {
          id: 1,
          asset_id: 'LAP001',
          type: 'Laptop',
          brand: 'Dell',
          model: 'XPS 13',
          department: 'Engineering',
          status: 'in_use',
          assigned_user: 'John Doe',
        },
        // Add more mock data as needed
      ]);
      setLoading(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch assets',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        // TODO: Replace with actual API call
        setAssets(assets.filter(asset => asset.id !== id));
        toast({
          title: 'Success',
          description: 'Asset deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete asset',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const filteredAssets = assets.filter(asset => {
    return (
      (filter.status === '' || asset.status === filter.status) &&
      (filter.department === '' || asset.department === filter.department) &&
      (filter.search === '' ||
        asset.asset_id.toLowerCase().includes(filter.search.toLowerCase()) ||
        asset.type.toLowerCase().includes(filter.search.toLowerCase()) ||
        asset.brand.toLowerCase().includes(filter.search.toLowerCase()) ||
        asset.model.toLowerCase().includes(filter.search.toLowerCase()))
    );
  });

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Asset List</Heading>
        <Button as={RouterLink} to="/assets/new" colorScheme="blue">
          Add New Asset
        </Button>
      </HStack>

      <HStack spacing={4} mb={6}>
        <Select
          placeholder="Filter by Status"
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        >
          <option value="in_use">In Use</option>
          <option value="available">Available</option>
          <option value="under_maintenance">Under Maintenance</option>
          <option value="retired">Retired</option>
        </Select>

        <Select
          placeholder="Filter by Department"
          value={filter.department}
          onChange={(e) => setFilter({ ...filter, department: e.target.value })}
        >
          <option value="Engineering">Engineering</option>
          <option value="Marketing">Marketing</option>
          <option value="Sales">Sales</option>
          <option value="HR">HR</option>
        </Select>

        <Input
          placeholder="Search assets..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
        />
      </HStack>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Asset ID</Th>
            <Th>Type</Th>
            <Th>Brand</Th>
            <Th>Model</Th>
            <Th>Department</Th>
            <Th>Status</Th>
            <Th>Assigned To</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredAssets.map((asset) => (
            <Tr key={asset.id}>
              <Td>{asset.asset_id}</Td>
              <Td>{asset.type}</Td>
              <Td>{asset.brand}</Td>
              <Td>{asset.model}</Td>
              <Td>{asset.department}</Td>
              <Td>{asset.status}</Td>
              <Td>{asset.assigned_user || '-'}</Td>
              <Td>
                <HStack spacing={2}>
                  <Button
                    as={RouterLink}
                    to={`/assets/${asset.id}`}
                    size="sm"
                    colorScheme="blue"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDelete(asset.id)}
                  >
                    Delete
                  </Button>
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default AssetList; 