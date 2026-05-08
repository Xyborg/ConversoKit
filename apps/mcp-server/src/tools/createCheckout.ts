import { z } from 'zod';
import { defineTool } from '@conversokit/shared';
import {
  MockPaymentProvider,
  createStripeProvider,
  type PaymentProvider
} from '@conversokit/integrations';
import { cartHash, defaultCartStore } from '../store/cart.js';

const stripe = createStripeProvider(process.env);
const paymentProvider: PaymentProvider = stripe ?? new MockPaymentProvider();

export const createCheckoutTool = defineTool({
  name: 'create_checkout',
  description:
    'Start a checkout session for the current cart. Returns a Stripe (or mock) Checkout URL the client should open.',
  inputSchema: z.object({
    successUrl: z.string().url(),
    cancelUrl: z.string().url(),
    customerEmail: z.string().email().optional()
  }),
  outputSchema: z.object({
    sessionId: z.string(),
    url: z.string().url(),
    provider: z.string()
  }),
  permissions: {
    requiresAuth: false,
    requiresConsent: true
  },
  async handler(input, ctx) {
    const cart = await defaultCartStore.get(ctx.sessionId);
    if (cart.items.length === 0) {
      throw new Error('Cart is empty');
    }
    const idempotencyKey = `${ctx.sessionId}:${cartHash(cart.items)}`;
    const session = await paymentProvider.createCheckoutSession({
      items: cart.items.map((i) => ({ id: i.id, quantity: i.quantity })),
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
      customerEmail: input.customerEmail,
      metadata: { sessionId: ctx.sessionId },
      idempotencyKey
    });
    return {
      sessionId: session.id,
      url: session.url,
      provider: paymentProvider.id
    };
  }
});
