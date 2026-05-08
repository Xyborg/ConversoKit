import React, { createContext, useContext, useMemo } from 'react';
import type { Theme } from './index.js';
import { themeToCssVars } from './css.js';
import { lightTheme } from './index.js';

const ThemeContext = createContext<Theme>(lightTheme);

export interface ThemeProviderProps {
  theme: Theme;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  theme,
  children,
  className,
  style
}) => {
  const vars = useMemo(() => themeToCssVars(theme), [theme]);
  const merged: React.CSSProperties = {
    ...(vars as unknown as React.CSSProperties),
    backgroundColor: 'var(--ck-background)',
    color: 'var(--ck-text)',
    fontFamily: 'var(--ck-font-family)',
    ...style
  };
  return (
    <ThemeContext.Provider value={theme}>
      <div data-conversokit-theme={theme.name} className={className} style={merged}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
