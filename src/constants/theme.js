import { MD3DarkTheme } from 'react-native-paper';

export const colors = {
  background: '#0f172a',
  surface: '#1e293b',
  surfaceVariant: '#334155',
  purple: '#8b5cf6',
  purpleLight: '#a78bfa',
  purpleDark: '#7c3aed',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  border: '#334155',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  card: '#1e293b',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const fonts = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const paperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#8b5cf6',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceVariant: '#334155',
    onSurface: '#f1f5f9',
    onBackground: '#f1f5f9',
    outline: '#334155',
    secondaryContainer: '#334155',
  },
};
