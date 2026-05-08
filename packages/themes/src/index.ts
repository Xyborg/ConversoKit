/**
 * Simple theme definitions.
 *
 * Themes define a palette of colours and spacing values that can be
 * consumed by widgets.  Applications can switch themes at runtime to
 * customise the look and feel of the UI.  These definitions are deliberately
 * lightweight; in a real application you might generate CSS variables or
 * integrate with a design system like Tailwind or Chakra.
 */

export interface Theme {
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
  border: string;
  accent: string;
  spacing: (factor: number) => string;
}

export const lightTheme: Theme = {
  primary: '#6366f1',
  secondary: '#4f46e5',
  background: '#ffffff',
  foreground: '#111827',
  border: '#e5e7eb',
  accent: '#10b981',
  spacing: (factor: number) => `${4 * factor}px`
};

export const darkTheme: Theme = {
  primary: '#818cf8',
  secondary: '#6366f1',
  background: '#1f2937',
  foreground: '#f9fafb',
  border: '#374151',
  accent: '#34d399',
  spacing: (factor: number) => `${4 * factor}px`
};