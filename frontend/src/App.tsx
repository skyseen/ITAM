import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ChakraProvider, Box, Container, VStack, Heading } from '@chakra-ui/react';
import Dashboard from './components/Dashboard';
import AssetList from './components/AssetList';
import AssetForm from './components/AssetForm';

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Box minH="100vh" bg="gray.50">
          <Container maxW="container.xl" py={8}>
            <VStack spacing={8} align="stretch">
              <Heading as="h1" size="xl" textAlign="center">
                IT Asset Management System
              </Heading>
              
              <Box as="nav" bg="white" p={4} borderRadius="md" shadow="sm">
                <VStack spacing={4} align="stretch">
                  <Link to="/">Dashboard</Link>
                  <Link to="/assets">Asset List</Link>
                  <Link to="/assets/new">Add New Asset</Link>
                </VStack>
              </Box>

              <Box bg="white" p={6} borderRadius="md" shadow="sm">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/assets" element={<AssetList />} />
                  <Route path="/assets/new" element={<AssetForm />} />
                  <Route path="/assets/:id" element={<AssetForm />} />
                </Routes>
              </Box>
            </VStack>
          </Container>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App; 