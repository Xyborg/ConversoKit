import { z } from 'zod';
import { cartSchema, defineTool } from '@conversokit/shared';
import { defaultCartStore } from '../store/cart.js';

export const getCartTool = defineTool({
  name: 'get_cart',
  description: 'Return the current cart for the calling session.',
  inputSchema: z.object({}),
  outputSchema: cartSchema,
  permissions: { requiresAuth: false },
  async handler(_input, ctx) {
    const cart = await defaultCartStore.get(ctx.sessionId);
    return cart;
  }
});
