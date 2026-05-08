import type { Tool } from '@conversokit/shared';
import { searchProductsTool } from './searchProducts.js';
import { getCartTool } from './getCart.js';
import { setCartTool } from './setCart.js';
import { createCheckoutTool } from './createCheckout.js';
import { getAvailabilityTool } from './getAvailability.js';
import { createReservationTool } from './createReservation.js';
import { cancelReservationTool } from './cancelReservation.js';
import { submitLeadTool } from './submitLead.js';

export const tools: Tool[] = [
  searchProductsTool,
  getCartTool,
  setCartTool,
  createCheckoutTool,
  getAvailabilityTool,
  createReservationTool,
  cancelReservationTool,
  submitLeadTool
];
