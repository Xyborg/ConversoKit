import { z } from 'zod';

/**
 * Schema describing the input for the searchProducts tool.
 *
 * - query: free‑text search phrase entered by the user.
 * - limit: optional limit on the number of items to return (default 10).
 */
export const searchProductsInputSchema = z.object({
  query: z
    .string()
    .min(1, { message: 'Query must not be empty' })
    .describe('Free‑text search phrase used to find products'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .describe('Optional limit on number of products to return (default 10)')
});

/**
 * Schema describing a single product.  This is a minimal example used by the
 * searchProducts tool.  Real implementations can extend this schema with
 * additional fields such as SKU, inventory, or metadata.
 */
export const productSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  imageUrl: z.string().url().optional(),
  price: z.string().optional(),
  badge: z.string().optional(),
  rating: z.number().min(0).max(5).optional()
});

/**
 * Schema describing the output for the searchProducts tool.  The tool returns
 * an array of products under the `items` property.
 */
export const searchProductsOutputSchema = z.object({
  items: z.array(productSchema)
});

/**
 * Example dataset used by the searchProducts tool.  In a real application
 * this would be replaced by a database lookup or external API call.
 */
const EXAMPLE_PRODUCTS: Array<z.infer<typeof productSchema>> = [
  {
    id: 'prod-1',
    title: 'Eco‑Friendly Water Bottle',
    subtitle: 'Stay hydrated sustainably',
    imageUrl: 'https://example.com/images/water-bottle.jpg',
    price: '$19.99',
    badge: 'Best Seller',
    rating: 4.7
  },
  {
    id: 'prod-2',
    title: 'Wireless Noise‑Cancelling Headphones',
    subtitle: 'Immersive sound for music lovers',
    imageUrl: 'https://example.com/images/headphones.jpg',
    price: '$199.99',
    badge: 'Premium',
    rating: 4.9
  },
  {
    id: 'prod-3',
    title: 'Organic Cotton T‑Shirt',
    subtitle: 'Soft and sustainable fashion',
    imageUrl: 'https://example.com/images/tshirt.jpg',
    price: '$29.99',
    badge: 'Eco',
    rating: 4.3
  }
];

/**
 * searchProducts tool definition.  Tools have a name, description, input
 * schema, output schema and a handler.  The handler receives validated
 * input and returns a JSON serialisable value matching the output schema.
 */
export const searchProductsTool = {
  name: 'search_products',
  description: 'Search for products based on a free‑text query and return a list of matching products.',
  inputSchema: searchProductsInputSchema,
  outputSchema: searchProductsOutputSchema,
  async handler(input: z.infer<typeof searchProductsInputSchema>) {
    const { query, limit = 10 } = input;
    // Simple case‑insensitive search over the example dataset
    const lower = query.toLowerCase();
    const matches = EXAMPLE_PRODUCTS.filter((product) =>
      product.title.toLowerCase().includes(lower) ||
      (product.subtitle && product.subtitle.toLowerCase().includes(lower))
    );
    return {
      items: matches.slice(0, limit)
    };
  }
};