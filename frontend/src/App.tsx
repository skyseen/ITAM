import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AssetProvider } from './contexts/AssetContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Dashboard from './components/Dashboard/Dashboard';
import AssetList from './components/AssetList';
import AssetForm from './components/AssetForm';
import UserManagement from './components/UserManagement';
import Profile from './components/Profile';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <Box>Loading...</Box>;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
};

// Admin Route component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <Box>Loading...</Box>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (user.role !== 'admin' && user.role !== 'manager') {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box minH="100vh" bg="gray.50">
      {user && <Navbar />}
      <Box p={user ? 4 : 0}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assets"
            element={
              <ProtectedRoute>
                <AssetList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assets/new"
            element={
              <AdminRoute>
                <AssetForm />
              </AdminRoute>
            }
          />
          <Route
            path="/assets/edit/:id"
            element={
              <AdminRoute>
                <AssetForm />
              </AdminRoute>
            }
          />
          <Route
            path="/users"
            element={
              <AdminRoute>
                <UserManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Box>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <ChakraProvider>
      <AuthProvider>
        <AssetProvider>
          <Router>
            <AppContent />
          </Router>
        </AssetProvider>
      </AuthProvider>
    </ChakraProvider>
  );
};

export default App; 