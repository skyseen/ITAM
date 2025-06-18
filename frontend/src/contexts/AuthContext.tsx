import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Types
interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  department: string;
  role: 'admin' | 'manager' | 'viewer';
  is_active: boolean;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  token: string | null;
}

// API instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
});

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('access_token')
  );

  // Set up axios interceptor
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken) {
        try {
          setToken(storedToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('access_token');
          setToken(null);
        }
      } else {
        // Temporary: Set a default admin user for testing
        setUser({
          id: 1,
          username: 'admin',
          email: 'admin@test.com',
          full_name: 'Test Admin',
          department: 'IT',
          role: 'admin',
          is_active: true,
        });
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { access_token, ...userData } = response.data;
      
      setToken(access_token);
      localStorage.setItem('access_token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Get user info
      const userResponse = await api.get('/auth/me');
      setUser(userResponse.data);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('access_token');
    delete api.defaults.headers.common['Authorization'];
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export API instance for use in other components
export { api }; 