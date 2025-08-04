/**
 * Recent Activity Component - Displays recent audit log activities
 * 
 * This component shows the latest system activities including asset operations,
 * user assignments, status changes, and administrative actions. It provides
 * a real-time view of what's happening in the asset management system.
 * 
 * Features:
 * - Real-time activity feed with timestamps
 * - Action-based color coding for visual distinction
 * - User and resource information display
 * - Responsive design with clean layout
 * - Time-based sorting (most recent first)
 * 
 * @author IT Asset Management System
 * @version 1.0.0
 */

import React from 'react';
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
  Icon,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiUser, 
  FiUserX, 
  FiRefreshCw,
  FiFileText,
  FiX
} from 'react-icons/fi';
import { AuditLog } from '../../contexts/AssetContext';

interface RecentActivityProps {
  activities: AuditLog[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const timestampColor = useColorModeValue('gray.500', 'gray.400');

  // Map actions to icons and colors
  const getActionDisplay = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return { icon: FiPlus, color: 'green', label: 'Created' };
      case 'update':
        return { icon: FiEdit, color: 'blue', label: 'Updated' };
      case 'delete':
        return { icon: FiTrash2, color: 'red', label: 'Deleted' };
      case 'assign':
        return { icon: FiUser, color: 'purple', label: 'Assigned' };
      case 'unassign':
        return { icon: FiUserX, color: 'orange', label: 'Unassigned' };
      case 'status_change':
        return { icon: FiRefreshCw, color: 'teal', label: 'Status Changed' };
      case 'sign_document':
        return { icon: FiFileText, color: 'cyan', label: 'Document Signed' };
      case 'cancel_issuance':
        return { icon: FiX, color: 'red', label: 'Issuance Cancelled' };
      default:
        return { icon: FiEdit, color: 'gray', label: action };
    }
  };

  // Format timestamp to relative time
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
      <CardHeader pb={2}>
        <Heading size="md" color="white">Recent Activity</Heading>
      </CardHeader>
      <CardBody pt={0}>
        <VStack spacing={3} align="stretch">
          {activities.length === 0 ? (
            <Text color={textColor} textAlign="center" py={4}>
              No recent activity
            </Text>
          ) : (
            activities.map((activity, index) => {
              const actionDisplay = getActionDisplay(activity.action);
              
              return (
                <Box key={activity.id}>
                  <HStack spacing={3} align="start">
                    <Box
                      p={2}
                      borderRadius="full"
                      bg={`${actionDisplay.color}.100`}
                      color={`${actionDisplay.color}.600`}
                      flexShrink={0}
                    >
                      <Icon as={actionDisplay.icon as any} boxSize={4} />
                    </Box>
                    
                    <VStack align="start" spacing={1} flex={1} minW={0}>
                      <HStack spacing={2} w="full" justify="space-between">
                        <Badge 
                          colorScheme={actionDisplay.color} 
                          variant="subtle"
                          fontSize="xs"
                        >
                          {actionDisplay.label}
                        </Badge>
                        <Text fontSize="xs" color={timestampColor} flexShrink={0}>
                          {formatTimestamp(activity.timestamp)}
                        </Text>
                      </HStack>
                      
                      <Text fontSize="sm" color="white" fontWeight="medium">
                        {activity.description}
                      </Text>
                      
                      <HStack spacing={4} fontSize="xs" color={textColor}>
                        <Text>
                          <Text as="span" fontWeight="medium">User:</Text> {activity.user_name}
                        </Text>
                        {activity.resource_name && (
                          <Text>
                            <Text as="span" fontWeight="medium">Resource:</Text> {activity.resource_name}
                          </Text>
                        )}
                        {activity.asset_identifier && (
                          <Text>
                            <Text as="span" fontWeight="medium">Asset:</Text> {activity.asset_identifier}
                          </Text>
                        )}
                      </HStack>
                    </VStack>
                  </HStack>
                  
                  {index < activities.length - 1 && (
                    <Divider mt={3} borderColor={borderColor} />
                  )}
                </Box>
              );
            })
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default RecentActivity;