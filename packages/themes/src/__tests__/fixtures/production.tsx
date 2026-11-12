import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ThemeProvider, commerceTheme, useTheme } from '@conversokit/themes';

function ThemeName() {
  return <span>{useTheme().name}</span>;
}

export const commerceMarkup = renderToStaticMarkup(
  <ThemeProvider theme={commerceTheme}><ThemeName /></ThemeProvider>
);
export const defaultMarkup = renderToStaticMarkup(<ThemeName />);
