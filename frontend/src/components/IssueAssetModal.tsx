/**
 * IssueAssetModal Component - Futuristic Asset Issuance Interface
 * 
 * Modal component for issuing assets to users with a modern, glass-morphism design
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  VStack,
  HStack,
  Text,
  Badge,
  useToast,
  Box,
  Avatar,
  Icon,
  useColorModeValue,
  Input,
} from '@chakra-ui/react';
import { 
  CalendarIcon, 
  EditIcon, 
  ViewIcon, 
  InfoIcon,
  CheckIcon,
  TimeIcon
} from '@chakra-ui/icons';
import { useAssets, Asset } from '../contexts/AssetContext';

interface User {
  id: number;
  full_name: string;
  department: string;
  email: string;
}

interface IssueAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
}

const IssueAssetModal: React.FC<IssueAssetModalProps> = ({ isOpen, onClose, asset }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [expectedReturnDate, setExpectedReturnDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const { issueAsset, fetchAssets } = useAssets();
  const toast = useToast();

  // Theme for futuristic design
  const overlayBg = useColorModeValue(
    'rgba(0, 0, 0, 0.4)',
    'rgba(0, 0, 0, 0.6)'
  );
  const modalBg = useColorModeValue(
    'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    'linear-gradient(135deg, rgba(45, 55, 72, 0.9) 0%, rgba(26, 32, 44, 0.9) 100%)'
  );

  // Mock users data - replace with actual API call
  useEffect(() => {
    if (isOpen) {
      setLoadingUsers(true);
      // Simulate API call for users
      setTimeout(() => {
        setUsers([
          { id: 1, full_name: 'John Doe', department: 'Engineering', email: 'john@company.com' },
          { id: 2, full_name: 'Jane Smith', department: 'Marketing', email: 'jane@company.com' },
          { id: 3, full_name: 'Mike Johnson', department: 'Finance', email: 'mike@company.com' },
          { id: 4, full_name: 'Alice Johnson', department: 'Engineering', email: 'alice@company.com' },
          { id: 5, full_name: 'Bob Smith', department: 'Marketing', email: 'bob@company.com' },
        ]);
        setLoadingUsers(false);
      }, 1000);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!selectedUserId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a user',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const issueData = {
        user_id: parseInt(selectedUserId),
        expected_return_date: expectedReturnDate || null,
        notes: notes || null,
        issued_by: 'Current User', // Replace with actual user
      };

      await issueAsset(asset.id, issueData);
      
      toast({
        title: 'Asset Issued Successfully',
        description: `${asset.asset_id} has been issued to the selected user`,
        status: 'success',
        duration: 3000,
      });

      // Reset form
      setSelectedUserId('');
      setExpectedReturnDate('');
      setNotes('');
      
      // Refresh assets and close modal
      await fetchAssets();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Issue Failed',
        description: error.response?.data?.detail || 'Failed to issue asset',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedUserId('');
    setExpectedReturnDate('');
    setNotes('');
    onClose();
  };

  const selectedUser = users.find(u => u.id === parseInt(selectedUserId));

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay bg={overlayBg} backdropFilter="blur(10px)" />
      <ModalContent
        bg={modalBg}
        backdropFilter="blur(20px)"
        border="1px solid"
        borderColor="rgba(255, 255, 255, 0.1)"
        borderRadius="20px"
        boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
      >
        <ModalHeader color="white">
          <HStack>
            <EditIcon color="blue.300" />
            <Text>Issue Asset: {asset.asset_id}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="white" />
        
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Asset Information */}
            <Box 
              p={4} 
              bg="rgba(255, 255, 255, 0.05)" 
              borderRadius="12px"
              border="1px solid rgba(255, 255, 255, 0.1)"
            >
              <Text fontSize="sm" color="gray.300" mb={2}>Asset Details</Text>
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text color="white" fontWeight="bold">{asset.brand} {asset.model}</Text>
                  <Text color="gray.300" fontSize="sm">{asset.type}</Text>
                </VStack>
                <Badge colorScheme="green" size="lg">
                  Available
                </Badge>
              </HStack>
            </Box>

            {/* Document Signing Notice */}
            <Box 
              p={4} 
              bg="rgba(59, 130, 246, 0.1)" 
              borderRadius="12px"
              border="1px solid rgba(59, 130, 246, 0.3)"
            >
              <HStack mb={3}>
                <InfoIcon color="blue.300" />
                <Text color="white" fontWeight="bold">Electronic Signature Required</Text>
              </HStack>
              <Text color="gray.200" fontSize="sm" mb={3}>
                After issuance, the user will need to sign the following documents electronically:
              </Text>
              <VStack align="start" spacing={2} pl={4}>
                <HStack>
                  <Text color="blue.300" fontSize="sm">📝</Text>
                  <Text color="gray.200" fontSize="sm">Declaration Form for Holding Company IT Asset</Text>
                </HStack>
                <HStack>
                  <Text color="blue.300" fontSize="sm">🎓</Text>
                  <Text color="gray.200" fontSize="sm">IT Orientation Acknowledgment Form</Text>
                </HStack>
                <HStack>
                  <Text color="blue.300" fontSize="sm">📋</Text>
                  <Text color="gray.200" fontSize="sm">Equipment Takeover/Handover Form</Text>
                </HStack>
              </VStack>
              <Text color="yellow.300" fontSize="xs" mt={3}>
                ⚠️ Documents must be signed within 7 days of issuance
              </Text>
            </Box>

            {/* User Selection */}
            <FormControl>
              <FormLabel color="white">
                <HStack>
                  <ViewIcon color="purple.300" />
                  <Text>Select User</Text>
                </HStack>
              </FormLabel>
              <Select
                placeholder={loadingUsers ? "Loading users..." : "Choose a user..."}
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                bg="rgba(255, 255, 255, 0.1)"
                border="1px solid rgba(255, 255, 255, 0.2)"
                color="white"
                _placeholder={{ color: 'gray.400' }}
                _hover={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
                _focus={{ borderColor: 'blue.300', boxShadow: '0 0 0 1px rgba(66, 153, 225, 0.6)' }}
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id.toString()}>
                    {user.full_name} - {user.department}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Selected User Info */}
            {selectedUser && (
              <Box 
                p={4} 
                bg="rgba(66, 153, 225, 0.1)" 
                borderRadius="12px"
                border="1px solid rgba(66, 153, 225, 0.2)"
              >
                <Text fontSize="sm" color="blue.300" mb={2}>Selected User</Text>
                <HStack>
                  <Avatar size="sm" name={selectedUser.full_name} />
                  <VStack align="start" spacing={0}>
                    <Text color="white" fontWeight="medium">{selectedUser.full_name}</Text>
                    <Text color="gray.300" fontSize="sm">{selectedUser.email}</Text>
                    <Badge colorScheme="blue" size="sm">{selectedUser.department}</Badge>
                  </VStack>
                </HStack>
              </Box>
            )}

            {/* Expected Return Date */}
            <FormControl>
              <FormLabel color="white">
                <HStack>
                  <CalendarIcon color="green.300" />
                  <Text>Expected Return Date (Optional)</Text>
                </HStack>
              </FormLabel>
              <Input
                type="date"
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                bg="rgba(255, 255, 255, 0.1)"
                border="1px solid rgba(255, 255, 255, 0.2)"
                color="white"
                _hover={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
                _focus={{ borderColor: 'green.300', boxShadow: '0 0 0 1px rgba(72, 187, 120, 0.6)' }}
              />
            </FormControl>

            {/* Notes */}
            <FormControl>
              <FormLabel color="white">
                <HStack>
                  <InfoIcon color="orange.300" />
                  <Text>Notes (Optional)</Text>
                </HStack>
              </FormLabel>
              <Textarea
                placeholder="Add any notes about this issuance..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                bg="rgba(255, 255, 255, 0.1)"
                border="1px solid rgba(255, 255, 255, 0.2)"
                color="white"
                _placeholder={{ color: 'gray.400' }}
                _hover={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
                _focus={{ borderColor: 'orange.300', boxShadow: '0 0 0 1px rgba(251, 211, 141, 0.6)' }}
                resize="vertical"
                minH="100px"
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button
              variant="outline"
              onClick={handleClose}
              borderColor="rgba(255, 255, 255, 0.2)"
              color="white"
              _hover={{ 
                bg: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.3)'
              }}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={loading}
              loadingText="Issuing..."
              leftIcon={<CheckIcon />}
              bg="linear-gradient(135deg, rgba(66, 153, 225, 0.8) 0%, rgba(49, 130, 206, 0.8) 100%)"
              _hover={{
                bg: "linear-gradient(135deg, rgba(66, 153, 225, 1) 0%, rgba(49, 130, 206, 1) 100%)",
              }}
              _active={{
                bg: "linear-gradient(135deg, rgba(49, 130, 206, 1) 0%, rgba(43, 108, 176, 1) 100%)",
              }}
            >
              Issue Asset
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default IssueAssetModal; 