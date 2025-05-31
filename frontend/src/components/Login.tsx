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
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

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
    <Container maxW="md" h="100vh" display="flex" alignItems="center">
      <Card w="100%">
        <CardBody>
          <VStack spacing={6}>
            <Heading size="lg" textAlign="center">
              IT Asset Management System
            </Heading>
            
            {error && (
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <Box as="form" onSubmit={handleSubmit} w="100%">
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Username</FormLabel>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={loading}
                  loadingText="Signing in..."
                  w="100%"
                  size="lg"
                >
                  Sign In
                </Button>
              </VStack>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
};

export default Login; 