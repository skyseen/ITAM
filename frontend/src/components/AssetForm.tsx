import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Heading,
  useToast,
  HStack,
} from '@chakra-ui/react';

interface AssetFormData {
  asset_id: string;
  type: string;
  brand: string;
  model: string;
  department: string;
  purchase_date: string;
  warranty_expiry: string;
}

const initialFormData: AssetFormData = {
  asset_id: '',
  type: '',
  brand: '',
  model: '',
  department: '',
  purchase_date: '',
  warranty_expiry: '',
};

const AssetForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState<AssetFormData>(initialFormData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      fetchAsset();
    }
  }, [id]);

  const fetchAsset = async () => {
    try {
      // TODO: Replace with actual API call
      // Mock data for now
      setFormData({
        asset_id: 'LAP001',
        type: 'Laptop',
        brand: 'Dell',
        model: 'XPS 13',
        department: 'Engineering',
        purchase_date: '2023-01-01',
        warranty_expiry: '2026-01-01',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch asset details',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Replace with actual API call
      // Mock success for now
      toast({
        title: 'Success',
        description: `Asset ${id ? 'updated' : 'created'} successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/assets');
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${id ? 'update' : 'create'} asset`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Box>
      <Heading mb={6}>{id === 'new' ? 'Add New Asset' : 'Edit Asset'}</Heading>

      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Asset ID</FormLabel>
            <Input
              name="asset_id"
              value={formData.asset_id}
              onChange={handleChange}
              placeholder="Enter asset ID"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Type</FormLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              placeholder="Select asset type"
            >
              <option value="Laptop">Laptop</option>
              <option value="Desktop">Desktop</option>
              <option value="Monitor">Monitor</option>
              <option value="Printer">Printer</option>
              <option value="Other">Other</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Brand</FormLabel>
            <Input
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="Enter brand name"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Model</FormLabel>
            <Input
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="Enter model name"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Department</FormLabel>
            <Select
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Select department"
            >
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="HR">HR</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Purchase Date</FormLabel>
            <Input
              name="purchase_date"
              type="date"
              value={formData.purchase_date}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Warranty Expiry</FormLabel>
            <Input
              name="warranty_expiry"
              type="date"
              value={formData.warranty_expiry}
              onChange={handleChange}
            />
          </FormControl>

          <HStack spacing={4} justify="flex-end">
            <Button
              onClick={() => navigate('/assets')}
              variant="outline"
              isDisabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={loading}
              loadingText={id ? 'Updating...' : 'Creating...'}
            >
              {id ? 'Update Asset' : 'Create Asset'}
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
};

export default AssetForm; 