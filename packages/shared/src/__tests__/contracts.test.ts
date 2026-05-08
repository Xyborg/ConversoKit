import { describe, expect, it } from 'vitest';
import {
  defaultWidgetConfig,
  productSchema,
  EXAMPLE_PRODUCTS,
  defineTool
} from '../index.js';
import { z } from 'zod';

describe('shared contracts', () => {
  it('productSchema validates EXAMPLE_PRODUCTS', () => {
    for (const p of EXAMPLE_PRODUCTS) {
      expect(productSchema.parse(p)).toEqual(p);
    }
  });

  it('defaultWidgetConfig has the three required slots', () => {
    expect(defaultWidgetConfig.permissions).toBeDefined();
    expect(defaultWidgetConfig.appearance).toBeDefined();
    expect(defaultWidgetConfig.actions).toBeDefined();
  });

  it('defineTool preserves the input', () => {
    const tool = defineTool({
      name: 'noop',
      description: 'noop',
      inputSchema: z.object({}),
      outputSchema: z.object({ ok: z.boolean() }),
      permissions: { requiresAuth: false },
      async handler() {
        return { ok: true };
      }
    });
    expect(tool.name).toBe('noop');
  });
});
