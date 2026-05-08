import express, { Router } from 'express';
import { createStripeProvider } from '@conversokit/integrations';
import { defaultOrderStore, type OrderStore } from '../store/orders.js';

export function webhookRouter(orderStore: OrderStore = defaultOrderStore): Router {
  const router = Router();
  const stripe = createStripeProvider(process.env);

  router.post(
    '/webhooks/stripe',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
      if (!stripe) {
        return res
          .status(503)
          .json({ error: 'Stripe not configured (missing STRIPE_SECRET_KEY)' });
      }
      const signature = req.header('stripe-signature');
      if (!signature) {
        return res.status(400).json({ error: 'Missing stripe-signature header' });
      }
      try {
        const event = stripe.verifyWebhook(req.body as Buffer, signature);
        if (event.type === 'checkout.session.completed') {
          const session = (event.data as { object: Record<string, unknown> })
            .object;
          await orderStore.put({
            id: String(session.id),
            sessionId: String(
              (session.metadata as Record<string, string> | undefined)
                ?.sessionId ?? ''
            ),
            amount: Number(session.amount_total ?? 0),
            currency: String(session.currency ?? 'usd'),
            status: 'paid',
            rawEventType: event.type,
            createdAt: new Date().toISOString()
          });
        }
        res.json({ received: true });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Webhook verification failed';
        res.status(400).json({ error: message });
      }
    }
  );

  return router;
}
