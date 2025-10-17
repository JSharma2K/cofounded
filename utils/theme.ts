// Design system inspired by the reference design
export const colors = {
  // Primary brand colors
  primary: '#E89B8E', // Coral/salmon pink from "Cofounded" title
  primaryDark: '#D88578',
  primaryLight: '#F4B5A8',
  
  // Dark theme colors
  background: '#1A1D23', // Dark background
  surface: '#252930', // Slightly lighter surface for cards/inputs
  surfaceLight: '#2E3139',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#B4B8C1', // Light gray text
  textTertiary: '#787D89',
  
  // Accent colors
  accent: '#5B6CC6', // Purple/indigo from button
  accentDark: '#4A5AB5',
  
  // Status colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  
  // Border colors
  border: '#3A3F49',
  borderLight: '#4A4F59',
};

export const typography = {
  fontFamilies: {
    regular: 'NeueMontreal-Regular',
    medium: 'NeueMontreal-Medium',
    bold: 'NeueMontreal-Bold',
    // Fallback to system fonts if custom fonts aren't loaded
    systemRegular: 'System',
    systemBold: 'System',
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    display: 36,
    displayLarge: 48,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export type Theme = typeof theme;

