import type { Cart, CheckoutSummary } from '../schemas/commerce.js';
import { EXAMPLE_PRODUCTS } from './products.js';

export const EXAMPLE_CART: Cart = {
  currency: 'USD',
  items: [
    { ...EXAMPLE_PRODUCTS[0], quantity: 2 },
    { ...EXAMPLE_PRODUCTS[1], quantity: 1 }
  ]
};

export const EXAMPLE_CHECKOUT_SUMMARY: CheckoutSummary = {
  currency: 'USD',
  items: EXAMPLE_CART.items,
  subtotal: '$239.97',
  taxes: '$19.20',
  shipping: '$5.00',
  total: '$264.17'
};
