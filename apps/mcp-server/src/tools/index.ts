import type { Tool } from '@conversokit/shared';
import { searchProductsTool } from './searchProducts.js';
import { getCartTool } from './getCart.js';
import { setCartTool } from './setCart.js';
import { createCheckoutTool } from './createCheckout.js';

export const tools: Tool[] = [
  searchProductsTool,
  getCartTool,
  setCartTool,
  createCheckoutTool
];
