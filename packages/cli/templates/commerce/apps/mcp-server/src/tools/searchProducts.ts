import { z } from 'zod';
import {
  productSchema,
  EXAMPLE_PRODUCTS,
  defineTool
} from '@conversokit/shared';

export const searchProductsTool = defineTool({
  name: 'search_products',
  description: 'Free-text search over the product catalog.',
  inputSchema: z.object({
    query: z.string(),
    limit: z.number().int().min(1).max(50).optional()
  }),
  outputSchema: z.object({ items: z.array(productSchema) }),
  permissions: { requiresAuth: false },
  async handler(input) {
    const { query, limit = 10 } = input;
    const lower = query.toLowerCase();
    const matches = lower
      ? EXAMPLE_PRODUCTS.filter(
          (p) =>
            p.title.toLowerCase().includes(lower) ||
            (p.subtitle && p.subtitle.toLowerCase().includes(lower))
        )
      : EXAMPLE_PRODUCTS;
    return { items: matches.slice(0, limit) };
  }
});
