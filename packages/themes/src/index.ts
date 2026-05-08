export interface ThemeRadius {
  sm: string;
  md: string;
  lg: string;
}

export interface ThemeTypography {
  fontFamily: string;
  fontSizeSm: string;
  fontSizeBase: string;
  fontSizeLg: string;
  fontSizeXl: string;
  fontWeightRegular: number;
  fontWeightBold: number;
}

export interface Theme {
  name: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  background: string;
  surface: string;
  foreground: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  danger: string;
  success: string;
  spacing: (factor: number) => string;
  radius: ThemeRadius;
  typography: ThemeTypography;
}

const baseSpacing = (factor: number) => `${4 * factor}px`;

const baseRadius: ThemeRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px'
};

const baseTypography: ThemeTypography = {
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  fontSizeSm: '0.875rem',
  fontSizeBase: '1rem',
  fontSizeLg: '1.125rem',
  fontSizeXl: '1.25rem',
  fontWeightRegular: 400,
  fontWeightBold: 600
};

export const lightTheme: Theme = {
  name: 'light',
  primary: '#6366f1',
  primaryForeground: '#ffffff',
  secondary: '#4f46e5',
  background: '#ffffff',
  surface: '#ffffff',
  foreground: '#111827',
  text: '#111827',
  muted: '#6b7280',
  border: '#e5e7eb',
  accent: '#10b981',
  danger: '#dc2626',
  success: '#10b981',
  spacing: baseSpacing,
  radius: baseRadius,
  typography: baseTypography
};

export const darkTheme: Theme = {
  ...lightTheme,
  name: 'dark',
  primary: '#818cf8',
  primaryForeground: '#0b1020',
  secondary: '#6366f1',
  background: '#0b1020',
  surface: '#111827',
  foreground: '#f9fafb',
  text: '#f9fafb',
  muted: '#9ca3af',
  border: '#1f2937',
  accent: '#34d399',
  danger: '#f87171',
  success: '#34d399'
};

export const minimalTheme: Theme = {
  ...lightTheme,
  name: 'minimal',
  primary: '#111827',
  primaryForeground: '#ffffff',
  secondary: '#374151',
  surface: '#fafafa',
  border: '#d1d5db',
  accent: '#111827',
  radius: { sm: '2px', md: '4px', lg: '6px' }
};

export const modernSaasTheme: Theme = {
  ...lightTheme,
  name: 'modern-saas',
  primary: '#7c3aed',
  primaryForeground: '#ffffff',
  secondary: '#5b21b6',
  background: '#fafafa',
  surface: '#ffffff',
  accent: '#06b6d4',
  border: '#e4e4e7'
};

export const enterpriseTheme: Theme = {
  ...lightTheme,
  name: 'enterprise',
  primary: '#0f172a',
  primaryForeground: '#ffffff',
  secondary: '#1e293b',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#0f172a',
  muted: '#475569',
  border: '#cbd5e1',
  accent: '#0ea5e9',
  radius: { sm: '2px', md: '4px', lg: '6px' },
  typography: {
    ...baseTypography,
    fontFamily:
      '"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif'
  }
};

export const commerceTheme: Theme = {
  ...lightTheme,
  name: 'commerce',
  primary: '#ea580c',
  primaryForeground: '#ffffff',
  secondary: '#c2410c',
  background: '#fffbf5',
  surface: '#ffffff',
  accent: '#16a34a',
  border: '#fed7aa',
  radius: { sm: '6px', md: '10px', lg: '16px' }
};

export const travelTheme: Theme = {
  ...lightTheme,
  name: 'travel',
  primary: '#0ea5e9',
  primaryForeground: '#ffffff',
  secondary: '#0369a1',
  background: '#f0f9ff',
  surface: '#ffffff',
  accent: '#f59e0b',
  border: '#bae6fd',
  radius: { sm: '8px', md: '12px', lg: '20px' }
};

export const themes: Record<string, Theme> = {
  light: lightTheme,
  dark: darkTheme,
  minimal: minimalTheme,
  'modern-saas': modernSaasTheme,
  enterprise: enterpriseTheme,
  commerce: commerceTheme,
  travel: travelTheme
};

export { themeToCssVars } from './css.js';
export { ThemeProvider, useTheme } from './ThemeProvider.js';
