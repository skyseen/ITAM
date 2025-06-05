import React from 'react';
import {
  Box,
  Flex,
  HStack,
  Link,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  useColorModeValue,
  Container,
  Spacer,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ViewIcon,
  SettingsIcon,
  AddIcon,
  EmailIcon,
  UnlockIcon,
  HamburgerIcon
} from '@chakra-ui/icons';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const isActive = (path: string) => location.pathname === path;

  const NavLink: React.FC<{ to: string; children: React.ReactNode; icon?: React.ReactElement }> = ({ 
    to, 
    children, 
    icon 
  }) => (
    <Link
      as={RouterLink}
      to={to}
      px={3}
      py={2}
      rounded="md"
      bg={isActive(to) ? 'blue.500' : 'transparent'}
      color={isActive(to) ? 'white' : 'gray.600'}
      _hover={{
        bg: isActive(to) ? 'blue.600' : 'gray.100',
        color: isActive(to) ? 'white' : 'gray.800',
        textDecoration: 'none'
      }}
      fontWeight={isActive(to) ? 'bold' : 'normal'}
      display="flex"
      alignItems="center"
      gap={2}
    >
      {icon}
      {children}
    </Link>
  );

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return null;
  }

  return (
    <Box bg={bg} borderBottom="1px" borderColor={borderColor} shadow="sm">
      <Container maxW="7xl">
        <Flex h={16} alignItems="center">
          {/* Logo/Brand */}
          <Text fontSize="xl" fontWeight="bold" color="blue.500">
            IT Asset Management
          </Text>

          <Spacer />

          {/* Navigation Links */}
          <HStack spacing={4}>
            <NavLink to="/dashboard" icon={<ViewIcon />}>
              Dashboard
            </NavLink>
            
            <NavLink to="/assets" icon={<SettingsIcon />}>
              Assets
            </NavLink>

            {/* Add Asset Link - Only for Admin/Manager */}
            {(user.role === 'admin' || user.role === 'manager') && (
              <NavLink to="/assets/new" icon={<AddIcon />}>
                Add Asset
              </NavLink>
            )}

            {/* Users Link - Only for Admin */}
            {user.role === 'admin' && (
              <NavLink to="/users" icon={<EmailIcon />}>
                Users
              </NavLink>
            )}
          </HStack>

          <Spacer />

          {/* User Menu */}
          <Menu>
            <MenuButton as={Button} variant="ghost" cursor="pointer" minW={0}>
              <HStack spacing={2}>
                <Avatar size="sm" name={user.full_name} />
                <Box textAlign="left">
                  <Text fontSize="sm" fontWeight="bold">
                    {user.full_name}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)} • {user.department}
                  </Text>
                </Box>
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<HamburgerIcon />} as={RouterLink} to="/profile">
                Profile
              </MenuItem>
              <MenuItem icon={<UnlockIcon />} onClick={handleLogout}>
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar; 