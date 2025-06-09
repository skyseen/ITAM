/**
 * Futuristic Login Component
 * 
 * Beautiful glass-morphism login interface with gradient background
 * and consistent design with the rest of the application.
 * 
 * Features:
 * - Glass-morphism card design
 * - Gradient background matching the main app
 * - Enhanced readability with better contrast
 * - Smooth animations and hover effects
 * 
 * @author IT Asset Management System
 * @version 2.0.0
 */

import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Text,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { LockIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';
import { 
  glassEffects, 
  gradientBackgrounds, 
  futuristicColors,
  componentPresets 
} from '../theme/futuristicTheme';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ username, password });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      bgGradient={gradientBackgrounds.primary}
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
    >
      <Container maxW="md">
        <Card 
          w="100%"
          sx={{
            ...glassEffects.primary,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        >
          <CardBody p={10}>
            <VStack spacing={8}>
              <VStack spacing={4}>
                <HStack spacing={3}>
                  <Icon as={LockIcon} color="cyan.300" boxSize={8} />
                  <Heading 
                    size="xl" 
                    textAlign="center" 
                    color="white"
                    textShadow="0 2px 4px rgba(0, 0, 0, 0.3)"
                  >
                    ITAM System
                  </Heading>
                </HStack>
                <Text 
                  color="gray.200" 
                  textAlign="center" 
                  fontSize="md"
                  opacity={0.9}
                >
                  IT Asset Management Portal
                </Text>
              </VStack>
            
                          {error && (
                <Alert 
                  status="error" 
                  sx={{
                    ...glassEffects.secondary,
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                  }}
                >
                  <AlertIcon color="red.300" />
                  <Text color="white">{error}</Text>
                </Alert>
              )}

              <Box as="form" onSubmit={handleSubmit} w="100%">
                <VStack spacing={6}>
                  <FormControl isRequired>
                    <FormLabel color="white" fontWeight="medium">
                      Username
                    </FormLabel>
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      bg="rgba(255, 255, 255, 0.1)"
                      border="1px solid rgba(255, 255, 255, 0.2)"
                      color="white"
                      _placeholder={{ color: 'gray.300' }}
                      _hover={{
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        bg: 'rgba(255, 255, 255, 0.15)',
                      }}
                      _focus={{
                        border: '1px solid',
                        borderColor: 'cyan.300',
                        bg: 'rgba(255, 255, 255, 0.15)',
                        boxShadow: '0 0 0 1px rgba(6, 182, 212, 0.3)',
                      }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color="white" fontWeight="medium">
                      Password
                    </FormLabel>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      bg="rgba(255, 255, 255, 0.1)"
                      border="1px solid rgba(255, 255, 255, 0.2)"
                      color="white"
                      _placeholder={{ color: 'gray.300' }}
                      _hover={{
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        bg: 'rgba(255, 255, 255, 0.15)',
                      }}
                      _focus={{
                        border: '1px solid',
                        borderColor: 'cyan.300',
                        bg: 'rgba(255, 255, 255, 0.15)',
                        boxShadow: '0 0 0 1px rgba(6, 182, 212, 0.3)',
                      }}
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    isLoading={loading}
                    loadingText="Signing in..."
                    w="100%"
                    size="lg"
                    sx={{
                      ...componentPresets.navItem,
                      bg: 'rgba(6, 182, 212, 0.8)',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: 'md',
                      h: 12,
                      _hover: {
                        bg: 'rgba(6, 182, 212, 1)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 25px rgba(6, 182, 212, 0.3)',
                      },
                      _active: {
                        transform: 'translateY(0)',
                      },
                    }}
                  >
                    Sign In
                  </Button>
                </VStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default Login; 