/**
 * Futuristic Navigation Component
 * 
 * A glass-morphism navigation bar that provides consistent navigation
 * across the ITAM application with beautiful visual effects.
 * 
 * Features:
 * - Glass-morphism design with backdrop blur
 * - Responsive navigation items
 * - User profile dropdown
 * - Active state indicators
 * - Smooth hover animations
 * 
 * @author IT Asset Management System
 * @version 1.0.0
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  useColorModeValue,
  Container,
  Badge,
  Icon,
} from '@chakra-ui/react';
import {
  ChevronDownIcon,
  SettingsIcon,
  InfoIcon,
  ViewIcon,
  AddIcon,
  ExternalLinkIcon,
} from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';
import { glassEffects, futuristicColors, componentPresets } from '../theme/futuristicTheme';

/**
 * Navigation item interface for type safety
 */
interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactElement;
  requiresAuth?: boolean;
  roles?: string[];
}

/**
 * Navigation items configuration
 * Defines all available navigation options with permissions
 */
const navigationItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    icon: <ViewIcon />,
    requiresAuth: true,
  },
  {
    label: 'Assets',
    path: '/assets',
    icon: <InfoIcon />,
    requiresAuth: true,
    roles: ['admin', 'manager'], // Only admin and manager can access assets page
  },
  {
    label: 'Add Asset',
    path: '/assets/new',
    icon: <AddIcon />,
    requiresAuth: true,
    roles: ['admin', 'manager'],
  },
  {
    label: 'User Management',
    path: '/users',
    icon: <SettingsIcon />,
    requiresAuth: true,
    roles: ['admin'],
  },
];

/**
 * Futuristic Navigation Component
 * Renders a glass-morphism navigation bar with user authentication
 */
const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  /**
   * Handle navigation to different routes
   * @param path - The route path to navigate to
   */
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  /**
   * Handle user logout
   * Clears authentication and redirects to login
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /**
   * Check if navigation item should be visible
   * Based on authentication and role requirements
   */
  const isNavItemVisible = (item: NavItem): boolean => {
    if (item.requiresAuth && !user) return false;
    if (item.roles && user && !item.roles.includes(user.role)) return false;
    return true;
  };

  /**
   * Check if current route is active
   * For highlighting active navigation items
   */
  const isActiveRoute = (path: string): boolean => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <Box
      position="sticky"
      top={0}
      zIndex={1000}
      sx={{
        ...glassEffects.primary,
        borderRadius: 0,
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
      }}
    >
      <Container maxW="8xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          {/* Logo/Brand Section */}
          <HStack spacing={8} alignItems="center">
            <Box>
              <Text
                fontSize="xl"
                fontWeight="bold"
                color="white"
                textShadow="0 2px 4px rgba(0, 0, 0, 0.3)"
              >
                ITAM System
              </Text>
            </Box>

            {/* Navigation Items */}
            <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
              {navigationItems
                .filter(isNavItemVisible)
                .map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    leftIcon={item.icon}
                    color={isActiveRoute(item.path) ? futuristicColors.interactive.primary : 'white'}
                    bg={isActiveRoute(item.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}
                    sx={{
                      ...componentPresets.navItem,
                      bg: isActiveRoute(item.path) 
                        ? 'rgba(255, 255, 255, 0.15)' 
                        : componentPresets.navItem.bg,
                      _hover: {
                        ...componentPresets.navItem._hover,
                        color: futuristicColors.interactive.primary,
                      },
                    }}
                    onClick={() => handleNavigation(item.path)}
                  >
                    {item.label}
                  </Button>
                ))}
            </HStack>
          </HStack>

          {/* User Profile Section */}
          <Flex alignItems="center">
            {user ? (
              <Menu>
                <MenuButton
                  as={Button}
                  variant="ghost"
                  cursor="pointer"
                  minW={0}
                  sx={{
                    ...componentPresets.navItem,
                    _hover: {
                      ...componentPresets.navItem._hover,
                    },
                  }}
                >
                  <HStack spacing={3}>
                    <Avatar
                      size="sm"
                      name={user.username}
                      bg="rgba(255, 255, 255, 0.2)"
                      color="white"
                    />
                    <VStack spacing={0} align="start" display={{ base: 'none', md: 'flex' }}>
                      <Text fontSize="sm" color="white" fontWeight="medium">
                        {user.username}
                      </Text>
                      <Badge
                        size="sm"
                        colorScheme={
                          user.role === 'admin' ? 'purple' :
                          user.role === 'manager' ? 'blue' : 'green'
                        }
                        variant="subtle"
                      >
                        {user.role}
                      </Badge>
                    </VStack>
                    <ChevronDownIcon color="white" />
                  </HStack>
                </MenuButton>
                <MenuList
                  sx={{
                    ...glassEffects.primary,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
                    bg: 'rgba(30, 41, 59, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 'xl',
                    p: 2,
                  }}
                >
                  <MenuItem
                    color="white"
                    fontWeight="medium"
                    borderRadius="lg"
                    bg="rgba(6, 182, 212, 0.1)"
                    mb={1}
                    _hover={{ 
                      bg: 'rgba(6, 182, 212, 0.2)',
                      color: 'cyan.200',
                      transform: 'translateX(4px) scale(1.02)',
                      boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)',
                    }}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    _active={{
                      transform: 'translateX(4px) scale(0.98)',
                    }}
                  >
                    <HStack spacing={3}>
                      <InfoIcon color="cyan.300" />
                      <Text>Profile Settings</Text>
                    </HStack>
                  </MenuItem>
                  <MenuItem
                    color="white"
                    fontWeight="medium"
                    borderRadius="lg"
                    bg="rgba(147, 51, 234, 0.1)"
                    mb={1}
                    _hover={{ 
                      bg: 'rgba(147, 51, 234, 0.2)',
                      color: 'purple.200',
                      transform: 'translateX(4px) scale(1.02)',
                      boxShadow: '0 4px 15px rgba(147, 51, 234, 0.3)',
                    }}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    _active={{
                      transform: 'translateX(4px) scale(0.98)',
                    }}
                  >
                    <HStack spacing={3}>
                      <SettingsIcon color="purple.300" />
                      <Text>Preferences</Text>
                    </HStack>
                  </MenuItem>
                  <MenuDivider 
                    borderColor="rgba(255, 255, 255, 0.15)" 
                    my={2}
                  />
                  <MenuItem
                    color="white"
                    fontWeight="medium"
                    borderRadius="lg"
                    bg="rgba(239, 68, 68, 0.1)"
                    _hover={{ 
                      bg: 'rgba(239, 68, 68, 0.2)',
                      color: 'red.200',
                      transform: 'translateX(4px) scale(1.02)',
                      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                    }}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    _active={{
                      transform: 'translateX(4px) scale(0.98)',
                    }}
                    onClick={handleLogout}
                  >
                    <HStack spacing={3}>
                      <ExternalLinkIcon color="red.300" />
                      <Text>Sign Out Securely</Text>
                    </HStack>
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Button
                colorScheme="blue"
                variant="solid"
                onClick={() => navigate('/login')}
                sx={{
                  ...componentPresets.navItem,
                  bg: futuristicColors.interactive.primary,
                  _hover: {
                    bg: futuristicColors.interactive.secondary,
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Sign In
              </Button>
            )}
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navigation; 