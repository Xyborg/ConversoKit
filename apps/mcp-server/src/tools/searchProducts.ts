import { z } from 'zod';
import {
  productSchema,
  EXAMPLE_PRODUCTS,
  defineTool
} from '@conversokit/shared';

export const searchProductsInputSchema = z.object({
  query: z
    .string()
    .min(0)
    .describe('Free‑text search phrase used to find products'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .describe('Optional limit on number of products to return (default 10)')
});

export const searchProductsOutputSchema = z.object({
  items: z.array(productSchema)
});

export const searchProductsTool = defineTool({
  name: 'search_products',
  description:
    'Search for products based on a free‑text query and return a list of matching products.',
  inputSchema: searchProductsInputSchema,
  outputSchema: searchProductsOutputSchema,
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
