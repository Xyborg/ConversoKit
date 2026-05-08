import { z } from 'zod';

/**
 * Shared schemas and types for the ConversoKit SDK.
 *
 * This package centralises reusable Zod schemas and TypeScript types that are
 * consumed by both the MCP server and widget packages.  Keeping common
 * definitions in one place ensures type safety across package boundaries.
 */

// Product definition used across widgets and tools
export const productSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  imageUrl: z.string().url().optional(),
  price: z.string().optional(),
  badge: z.string().optional(),
  rating: z.number().min(0).max(5).optional()
});

export type Product = z.infer<typeof productSchema>;

/**
 * Example products that can be used as mock data across the SDK.  These
 * examples intentionally use neutral content so that they can serve as
 * placeholders in demos or tests.
 */
export const EXAMPLE_PRODUCTS: Product[] = [
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