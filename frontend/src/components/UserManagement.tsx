import React from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Button,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { AddIcon, ViewIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';

const UserManagement: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box
      minH="100vh"
      bgGradient={useColorModeValue(
        'linear(to-br, purple.900, blue.800, teal.700)',
        'linear(to-br, gray.900, purple.900, blue.900)'
      )}
    >
      <Container maxW="8xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header Section */}
          <VStack spacing={4} align="start">
            <Heading color="white" size="xl" fontWeight="bold" textShadow="0 2px 4px rgba(0, 0, 0, 0.3)">
              User Management 👥
            </Heading>
            <Text color="gray.200" fontSize="lg">
              Manage system users, roles, and permissions
            </Text>
          </VStack>

          {/* Quick Stats */}
          <HStack spacing={6}>
            <Card
              bg="rgba(255, 255, 255, 0.1)"
              backdropFilter="blur(10px)"
              borderRadius="20px"
              border="1px solid rgba(255, 255, 255, 0.1)"
              boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
              flex="1"
            >
              <CardBody textAlign="center" py={6}>
                <VStack spacing={2}>
                  <Text fontSize="3xl" fontWeight="bold" color="cyan.300">
                    12
                  </Text>
                  <Text color="gray.200" fontSize="md">
                    Total Users
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            <Card
              bg="rgba(255, 255, 255, 0.1)"
              backdropFilter="blur(10px)"
              borderRadius="20px"
              border="1px solid rgba(255, 255, 255, 0.1)"
              boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
              flex="1"
            >
              <CardBody textAlign="center" py={6}>
                <VStack spacing={2}>
                  <Text fontSize="3xl" fontWeight="bold" color="green.300">
                    8
                  </Text>
                  <Text color="gray.200" fontSize="md">
                    Active Users
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            <Card
              bg="rgba(255, 255, 255, 0.1)"
              backdropFilter="blur(10px)"
              borderRadius="20px"
              border="1px solid rgba(255, 255, 255, 0.1)"
              boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
              flex="1"
            >
              <CardBody textAlign="center" py={6}>
                <VStack spacing={2}>
                  <Text fontSize="3xl" fontWeight="bold" color="purple.300">
                    3
                  </Text>
                  <Text color="gray.200" fontSize="md">
                    Admin Users
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </HStack>

          {/* Main Content */}
          <Card
            bg="rgba(255, 255, 255, 0.1)"
            backdropFilter="blur(10px)"
            borderRadius="20px"
            border="1px solid rgba(255, 255, 255, 0.1)"
            boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
          >
            <CardHeader>
              <HStack justify="space-between" align="center">
                <HStack spacing={3}>
                  <ViewIcon color="blue.300" />
                  <Heading size="md" color="white">User Management</Heading>
                </HStack>
                {user?.role === 'admin' && (
                  <Button
                    leftIcon={<AddIcon />}
                    colorScheme="blue"
                    size="md"
                    bg="rgba(59, 130, 246, 0.8)"
                    _hover={{
                      bg: 'rgba(59, 130, 246, 1)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                    }}
                    _active={{
                      transform: 'translateY(0)',
                    }}
                  >
                    Add User
                  </Button>
                )}
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} align="center" py={12}>
                <ViewIcon color="gray.400" boxSize={16} />
                <VStack spacing={2}>
                  <Text fontSize="xl" fontWeight="bold" color="white">
                    User Management System
                  </Text>
                  <Text color="gray.300" textAlign="center" maxW="md">
                    This feature is currently under development. You'll be able to manage users, 
                    assign roles, and configure permissions here.
                  </Text>
                </VStack>
                <HStack spacing={4}>
                  <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                    Coming Soon
                  </Badge>
                  <Badge colorScheme="purple" px={3} py={1} borderRadius="full">
                    Admin Only
                  </Badge>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default UserManagement; 