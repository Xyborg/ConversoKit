import { z } from 'zod';

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
