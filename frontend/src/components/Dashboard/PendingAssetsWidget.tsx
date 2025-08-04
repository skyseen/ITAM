/**
 * Pending Assets Widget - Dashboard component for monitoring assets awaiting signature
 * 
 * This component displays assets that are in PENDING_FOR_SIGNATURE status,
 * allowing administrators to monitor which assets need user document signatures
 * and take action on overdue items.
 * 
 * Features:
 * - Real-time display of pending signature assets
 * - Visual indicators for overdue items (>3 days)
 * - Quick actions to cancel issuances
 * - Time tracking since assignment
 * - User and asset information display
 * 
 * @author IT Asset Management System
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  Spinner,
  Icon,
} from '@chakra-ui/react';
import { FiClock, FiAlertTriangle, FiX } from 'react-icons/fi';
import axios from 'axios';
import { api } from '../../contexts/AuthContext';

interface PendingAsset {
  id: number;
  asset_id: string;
  asset_name: string;
  user_name: string;
  user_id: number;
  assigned_date: string;
  days_pending: number;
  is_overdue: boolean;
  issuance_id: number | null;
}

const PendingAssetsWidget: React.FC = () => {
  const [pendingAssets, setPendingAssets] = useState<PendingAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<PendingAsset | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.100'); // Changed from gray.300 to gray.100 for better visibility

  const fetchPendingAssets = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const response = await api.get('/assets/pending-signature');
      setPendingAssets(response.data);
    } catch (error: any) {
      console.error('Error fetching pending assets:', error);
      // Don't show error toast for empty results, just log it
      if (axios.isAxiosError(error) && error.response?.status !== 404) {
        toast({
          title: 'Error',
          description: 'Failed to fetch pending assets',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleCancelIssuance = async () => {
    if (!selectedAsset || !cancelReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for cancellation',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setCancelling(true);
      
      // Check if we have an issuance ID
      if (!selectedAsset.issuance_id) {
        throw new Error('No issuance ID found for this asset');
      }
      
      await api.post(`/assets/issuances/${selectedAsset.issuance_id}/cancel`, {
        reason: cancelReason
      });

      toast({
        title: 'Success',
        description: `Issuance for ${selectedAsset.asset_id} has been cancelled`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Refresh the pending assets list
      await fetchPendingAssets();
      
      // Close modal and reset state
      onClose();
      setSelectedAsset(null);
      setCancelReason('');
    } catch (error: any) {
      console.error('Error cancelling issuance:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to cancel issuance';
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setCancelling(false);
    }
  };

  const openCancelModal = (asset: PendingAsset) => {
    setSelectedAsset(asset);
    setCancelReason('');
    onOpen();
  };

  useEffect(() => {
    fetchPendingAssets();
    
    // Set up polling to refresh every 2 minutes (less frequent to reduce blinking)
    const interval = setInterval(() => fetchPendingAssets(false), 120000);
    return () => clearInterval(interval);
  }, []);

  const overdueCount = pendingAssets.filter(asset => asset.is_overdue).length;

  const glassEffect = {
    bg: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: '1px solid',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  };

  return (
    <>
      <Card {...glassEffect}>
        <CardHeader pb={2}>
          <HStack justify="space-between">
            <HStack>
              <Icon as={FiClock as any} color="yellow.300" />
              <Heading size="md" color="white">Assets Pending Signature</Heading>
            </HStack>
            <Badge 
              colorScheme={overdueCount > 0 ? "red" : "yellow"} 
              variant="solid"
              fontSize="sm"
            >
              {pendingAssets.length} pending
            </Badge>
          </HStack>
        </CardHeader>
        
        <CardBody pt={0}>
          {overdueCount > 0 && (
            <Alert status="warning" mb={4} borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle fontSize="sm">Overdue Signatures!</AlertTitle>
                <AlertDescription fontSize="xs">
                  {overdueCount} asset{overdueCount !== 1 ? 's' : ''} {overdueCount !== 1 ? 'have' : 'has'} been pending for more than 3 days
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {loading ? (
            <Box textAlign="center" py={4}>
              <Spinner color="blue.500" />
              <Text mt={2} fontSize="sm" color={textColor}>Loading pending assets...</Text>
            </Box>
          ) : pendingAssets.length === 0 ? (
            <VStack spacing={3} py={6}>
              <Icon as={FiClock as any} color="gray.400" boxSize={8} />
              <Text color="gray.300" textAlign="center" fontSize="sm">
                No assets pending signature
              </Text>
              <Text color="gray.500" textAlign="center" fontSize="xs">
                All assets are either available or properly assigned
              </Text>
            </VStack>
          ) : (
            <VStack spacing={3} align="stretch">
              {pendingAssets.map((asset) => (
                <Box
                  key={asset.id}
                  p={3}
                  bg={asset.is_overdue ? "rgba(245, 101, 101, 0.1)" : "rgba(255,255,255,0.05)"}
                  borderRadius="md"
                  border={asset.is_overdue ? "1px solid" : "none"}
                  borderColor={asset.is_overdue ? "red.300" : "transparent"}
                >
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={1} flex={1}>
                      <HStack spacing={2}>
                        <Text color="white" fontSize="sm" fontWeight="medium">
                          {asset.asset_id}
                        </Text>
                        <Text color="white" fontSize="sm">
                          • {asset.asset_name}
                        </Text>
                        {asset.is_overdue && (
                          <Icon as={FiAlertTriangle as any} color="red.400" boxSize={3} />
                        )}
                      </HStack>
                      
                      <Text color="gray.100" fontSize="xs">
                        Assigned to: {asset.user_name}
                      </Text>
                      
                                              <HStack spacing={4} fontSize="xs">
                        <HStack spacing={1}>
                          <Icon as={FiClock as any} color={asset.is_overdue ? "red.400" : "gray.400"} boxSize={3} />
                          <Text color={asset.is_overdue ? "red.300" : "gray.100"}>
                            {asset.days_pending === 0 ? 'Assigned today' : 
                             asset.days_pending === 1 ? 'Assigned yesterday' :
                             `Assigned ${asset.days_pending} days ago`}
                          </Text>
                        </HStack>
                      </HStack>
                    </VStack>
                    
                    <Button
                      size="xs"
                      colorScheme="red"
                      variant="ghost"
                      leftIcon={<Icon as={FiX as any} />}
                      onClick={() => openCancelModal(asset)}
                    >
                      Cancel
                    </Button>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </CardBody>
      </Card>

      {/* Cancel Issuance Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cancel Asset Issuance</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedAsset && (
              <VStack spacing={4} align="stretch">
                <Text>
                  Are you sure you want to cancel the issuance of{' '}
                  <Text as="span" fontWeight="bold">{selectedAsset.asset_id}</Text> to{' '}
                  <Text as="span" fontWeight="bold">{selectedAsset.user_name}</Text>?
                </Text>
                
                <Box>
                  <Text mb={2} fontSize="sm" fontWeight="medium">
                    Reason for cancellation:
                  </Text>
                  <Textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Please provide a reason for cancelling this issuance..."
                    rows={3}
                  />
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleCancelIssuance}
              isLoading={cancelling}
              loadingText="Cancelling..."
              disabled={!cancelReason.trim()}
            >
              Cancel Issuance
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PendingAssetsWidget;