import { z } from 'zod';
import { cartSchema, defineTool } from '@conversokit/shared';
import { defaultCartStore } from '../store/cart.js';

export const setCartTool = defineTool({
  name: 'set_cart',
  description: 'Replace the cart for the calling session.',
  inputSchema: cartSchema,
  outputSchema: z.object({ ok: z.boolean() }),
  permissions: { requiresAuth: false },
  async handler(input, ctx) {
    await defaultCartStore.set(ctx.sessionId, input);
    return { ok: true };
  }
});
