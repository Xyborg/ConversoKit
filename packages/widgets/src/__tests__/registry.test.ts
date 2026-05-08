import { describe, expect, it } from 'vitest';
import { widgetRegistry, listWidgets, getWidget } from '../registry.js';

describe('widget registry', () => {
  it('registers ProductCard and ProductCarousel by default', () => {
    expect(getWidget('ProductCard')).toBeDefined();
    expect(getWidget('ProductCarousel')).toBeDefined();
  });

  it('exposes all registered widgets via listWidgets', () => {
    const names = listWidgets().map((w) => w.name);
    expect(names).toEqual(expect.arrayContaining(['ProductCard', 'ProductCarousel']));
  });

  it('every registered widget has a category and config', () => {
    for (const meta of Object.values(widgetRegistry)) {
      expect(meta.category).toBeTruthy();
      expect(meta.config).toBeDefined();
      expect(meta.schema).toBeDefined();
    }
  });
});
