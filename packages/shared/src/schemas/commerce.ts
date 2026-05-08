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

export const cartItemSchema = productSchema.extend({
  quantity: z.number().int().min(1)
});

export type CartItem = z.infer<typeof cartItemSchema>;

export const cartSchema = z.object({
  items: z.array(cartItemSchema),
  currency: z.string().default('USD')
});

export type Cart = z.infer<typeof cartSchema>;

export const checkoutSummarySchema = z.object({
  items: z.array(cartItemSchema),
  subtotal: z.string(),
  taxes: z.string().optional(),
  shipping: z.string().optional(),
  total: z.string(),
  currency: z.string().default('USD')
});

export type CheckoutSummary = z.infer<typeof checkoutSummarySchema>;
