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
  MenuDivider,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ViewIcon,
  SettingsIcon,
  AddIcon,
  InfoIcon,
  ExternalLinkIcon,
  TimeIcon
} from '@chakra-ui/icons';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const NavLink: React.FC<{ to: string; children: React.ReactNode; icon?: React.ReactElement }> = ({ 
    to, 
    children, 
    icon 
  }) => (
    <Link
      as={RouterLink}
      to={to}
      px={4}
      py={2}
      rounded="lg"
      bg={isActive(to) ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.1)'}
      color="white"
      border="1px solid"
      borderColor={isActive(to) ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.2)'}
      backdropFilter="blur(10px)"
      _hover={{
        bg: isActive(to) ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.2)',
        borderColor: 'rgba(255, 255, 255, 0.4)',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
        textDecoration: 'none'
      }}
      fontWeight={isActive(to) ? 'bold' : 'medium'}
      display="flex"
      alignItems="center"
      gap={2}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _active={{
        transform: 'translateY(0)',
      }}
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
    <Box 
      bg="transparent"
      borderBottom="1px solid rgba(255, 255, 255, 0.1)"
      position="sticky"
      top={0}
      zIndex={1000}
      backdropFilter="blur(20px)"
    >
      <Container maxW="8xl">
        <Flex h={20} alignItems="center" gap={8}>
          {/* Logo/Brand */}
          <HStack spacing={3}>
            <ViewIcon color="cyan.300" boxSize={8} />
            <Text 
              fontSize="2xl" 
              fontWeight="bold" 
              color="white"
              textShadow="0 2px 4px rgba(0, 0, 0, 0.3)"
            >
              ITAM System
            </Text>
          </HStack>

          <Spacer />

          {/* Navigation Links */}
          <HStack spacing={6}>
            <NavLink to="/dashboard" icon={<TimeIcon />}>
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
              <NavLink to="/users" icon={<InfoIcon />}>
                Users
              </NavLink>
            )}
          </HStack>

          <Spacer />

          {/* User Menu */}
          <Menu>
            <MenuButton 
              as={Button} 
              variant="ghost" 
              cursor="pointer" 
              minW={0}
              bg="rgba(255, 255, 255, 0.1)"
              border="1px solid rgba(255, 255, 255, 0.2)"
              borderRadius="lg"
              backdropFilter="blur(10px)"
              _hover={{
                bg: 'rgba(255, 255, 255, 0.2)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.2)',
              }}
              _active={{
                transform: 'translateY(0)',
              }}
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              px={4}
              py={3}
              h="auto"
            >
              <HStack spacing={3}>
                <Avatar size="sm" name={user.full_name} />
                <Box textAlign="left">
                  <Text fontSize="sm" fontWeight="bold" color="white">
                    {user.full_name}
                  </Text>
                  <Text fontSize="xs" color="gray.300">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)} • {user.department}
                  </Text>
                </Box>
              </HStack>
            </MenuButton>
            <MenuList
              bg="rgba(26, 32, 44, 0.95)"
              backdropFilter="blur(20px)"
              border="1px solid rgba(255, 255, 255, 0.1)"
              borderRadius="xl"
              boxShadow="0 20px 40px rgba(0, 0, 0, 0.3)"
              p={2}
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
                as={RouterLink} 
                to="/profile"
              >
                <HStack spacing={3}>
                  <InfoIcon color="cyan.300" />
                  <Text>Profile Settings</Text>
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
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar; 