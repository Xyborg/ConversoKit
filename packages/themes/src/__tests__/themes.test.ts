import { describe, expect, it } from 'vitest';
import { themes, themeToCssVars, lightTheme } from '../index.js';

describe('themes', () => {
  it('exports the 7 PRD themes (incl. light + dark)', () => {
    const expected = [
      'light',
      'dark',
      'minimal',
      'modern-saas',
      'enterprise',
      'commerce',
      'travel'
    ];
    for (const name of expected) {
      expect(themes[name]).toBeDefined();
      expect(themes[name].name).toBe(name);
    }
  });

  it('themeToCssVars produces --ck-* keys for every required token', () => {
    const vars = themeToCssVars(lightTheme);
    expect(vars['--ck-primary']).toBe(lightTheme.primary);
    expect(vars['--ck-background']).toBe(lightTheme.background);
    expect(vars['--ck-radius-md']).toBe(lightTheme.radius.md);
    expect(vars['--ck-font-family']).toBe(lightTheme.typography.fontFamily);
  });
});
