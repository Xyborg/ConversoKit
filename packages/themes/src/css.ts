import type { Theme } from './index.js';

export function themeToCssVars(theme: Theme): Record<string, string> {
  return {
    '--ck-primary': theme.primary,
    '--ck-primary-foreground': theme.primaryForeground,
    '--ck-secondary': theme.secondary,
    '--ck-background': theme.background,
    '--ck-surface': theme.surface,
    '--ck-foreground': theme.foreground,
    '--ck-text': theme.text,
    '--ck-muted': theme.muted,
    '--ck-border': theme.border,
    '--ck-accent': theme.accent,
    '--ck-danger': theme.danger,
    '--ck-success': theme.success,
    '--ck-radius-sm': theme.radius.sm,
    '--ck-radius-md': theme.radius.md,
    '--ck-radius-lg': theme.radius.lg,
    '--ck-font-family': theme.typography.fontFamily,
    '--ck-font-size-sm': theme.typography.fontSizeSm,
    '--ck-font-size-base': theme.typography.fontSizeBase,
    '--ck-font-size-lg': theme.typography.fontSizeLg,
    '--ck-font-size-xl': theme.typography.fontSizeXl,
    '--ck-font-weight-regular': String(theme.typography.fontWeightRegular),
    '--ck-font-weight-bold': String(theme.typography.fontWeightBold),
    '--ck-spacing-1': theme.spacing(1),
    '--ck-spacing-2': theme.spacing(2),
    '--ck-spacing-3': theme.spacing(3),
    '--ck-spacing-4': theme.spacing(4),
    '--ck-spacing-6': theme.spacing(6),
    '--ck-spacing-8': theme.spacing(8)
  };
}
