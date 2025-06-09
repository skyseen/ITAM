/**
 * Futuristic Theme System
 * Standardized design tokens for consistent glass-morphism UI across the ITAM application
 * 
 * This theme provides:
 * - Glass-morphism effects with backdrop blur
 * - Gradient backgrounds and hover states
 * - Consistent color palette
 * - Typography scales
 * - Animation presets
 */

// Glass-morphism effect configurations
export const glassEffects = {
  // Primary glass card - main content areas
  primary: {
    bg: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  },
  
  // Secondary glass card - nested content
  secondary: {
    bg: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(8px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.2)',
  },
  
  // Interactive elements - buttons, cards with hover
  interactive: {
    bg: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(6px)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 2px 8px 0 rgba(31, 38, 135, 0.15)',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    _hover: {
      bg: 'rgba(255, 255, 255, 0.15)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px 0 rgba(31, 38, 135, 0.3)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
  },
};

// Gradient backgrounds for different sections
export const gradientBackgrounds = {
  // Main dashboard background
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  
  // Alternative sections
  secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  
  // Success/positive actions
  success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  
  // Warning/attention areas
  warning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  
  // Dark mode variants
  dark: {
    primary: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
    secondary: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
  },
};

// Color palette for consistent theming
export const futuristicColors = {
  // Glass transparency levels
  glass: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.15)',
    strong: 'rgba(255, 255, 255, 0.2)',
  },
  
  // Text colors on glass backgrounds
  text: {
    primary: 'white',
    secondary: 'gray.200',
    muted: 'gray.400',
    accent: 'cyan.300',
  },
  
  // Status colors with glass compatibility
  status: {
    available: { solid: 'green.500', glass: 'rgba(72, 187, 120, 0.8)' },
    inUse: { solid: 'blue.500', glass: 'rgba(66, 153, 225, 0.8)' },
    maintenance: { solid: 'orange.500', glass: 'rgba(251, 211, 141, 0.8)' },
    retired: { solid: 'gray.500', glass: 'rgba(160, 174, 192, 0.8)' },
  },
  
  // Interactive element colors
  interactive: {
    primary: 'cyan.300',
    secondary: 'purple.300',
    success: 'green.300',
    warning: 'orange.300',
    danger: 'red.300',
  },
};

// Animation presets for consistent motion
export const animations = {
  // Hover effects
  hover: {
    duration: '0.3s',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'translateY(-2px)',
  },
  
  // Loading states
  pulse: {
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
  
  // Slide in animations
  slideIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// Typography scales for glass backgrounds
export const typography = {
  // Headings optimized for glass backgrounds
  heading: {
    primary: {
      fontSize: { base: '2xl', md: '3xl', lg: '4xl' },
      fontWeight: 'bold',
      color: 'white',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    },
    secondary: {
      fontSize: { base: 'lg', md: 'xl', lg: '2xl' },
      fontWeight: 'semibold',
      color: 'white',
    },
    tertiary: {
      fontSize: { base: 'md', md: 'lg' },
      fontWeight: 'medium',
      color: 'gray.200',
    },
  },
  
  // Body text for glass cards
  body: {
    primary: {
      fontSize: 'md',
      color: 'white',
      lineHeight: '1.6',
    },
    secondary: {
      fontSize: 'sm',
      color: 'gray.300',
      lineHeight: '1.5',
    },
    muted: {
      fontSize: 'sm',
      color: 'gray.400',
      lineHeight: '1.4',
    },
  },
};

// Responsive breakpoints
export const breakpoints = {
  sm: '30em',   // 480px
  md: '48em',   // 768px
  lg: '62em',   // 992px
  xl: '80em',   // 1280px
  '2xl': '96em', // 1536px
};

// Component-specific presets
export const componentPresets = {
  // Dashboard stat cards
  statCard: {
    ...glassEffects.interactive,
    p: 6,
    minH: '150px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  
  // Form containers
  formCard: {
    ...glassEffects.primary,
    p: 8,
    maxW: 'md',
    mx: 'auto',
  },
  
  // Data table headers
  tableHeader: {
    ...glassEffects.secondary,
    py: 4,
    px: 6,
    borderRadius: '12px 12px 0 0',
  },
  
  // Modal overlays
  modalOverlay: {
    bg: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
  },
  
  // Navigation elements
  navItem: {
    ...glassEffects.interactive,
    px: 4,
    py: 2,
    mr: 2,
    borderRadius: '10px',
  },
};

/**
 * Utility function to create custom glass effects
 * @param opacity - Background opacity (0-1)
 * @param blur - Backdrop blur amount in px
 * @param borderOpacity - Border opacity (0-1)
 * @returns Glass effect object
 */
export const createGlassEffect = (
  opacity: number = 0.1,
  blur: number = 10,
  borderOpacity: number = 0.1
) => ({
  bg: `rgba(255, 255, 255, ${opacity})`,
  backdropFilter: `blur(${blur}px)`,
  borderRadius: '16px',
  border: `1px solid rgba(255, 255, 255, ${borderOpacity})`,
  boxShadow: `0 ${blur / 2}px ${blur * 2}px 0 rgba(31, 38, 135, ${opacity * 2})`,
});

/**
 * Utility function to get status colors
 * @param status - Asset status
 * @param variant - Color variant (solid or glass)
 * @returns Color value
 */
export const getStatusColor = (
  status: 'available' | 'in_use' | 'maintenance' | 'retired',
  variant: 'solid' | 'glass' = 'solid'
) => {
  const statusMap = {
    available: variant === 'solid' ? 'green' : futuristicColors.status.available.glass,
    in_use: variant === 'solid' ? 'blue' : futuristicColors.status.inUse.glass,
    maintenance: variant === 'solid' ? 'orange' : futuristicColors.status.maintenance.glass,
    retired: variant === 'solid' ? 'gray' : futuristicColors.status.retired.glass,
  };
  
  return statusMap[status] || statusMap.available;
}; 