import Stripe from 'stripe';
import type {
  CheckoutLineItem,
  CheckoutSession,
  CreateCheckoutOptions,
  WebhookCapablePaymentProvider,
  WebhookEvent
} from './types.js';

export interface PriceLookup {
  (item: CheckoutLineItem): Promise<{
    priceId?: string;
    amount?: number;
    currency?: string;
    productName?: string;
  }>;
}

export interface StripeProviderOptions {
  secretKey: string;
  webhookSecret?: string;
  /** Resolves CheckoutLineItem → Stripe price/amount. */
  priceLookup?: PriceLookup;
  apiVersion?: Stripe.LatestApiVersion;
}

export class StripeProvider implements WebhookCapablePaymentProvider {
  id = 'stripe';
  private client: Stripe;
  private webhookSecret?: string;
  private priceLookup: PriceLookup;

  constructor(options: StripeProviderOptions) {
    this.client = new Stripe(options.secretKey, {
      apiVersion: options.apiVersion
    });
    this.webhookSecret = options.webhookSecret;
    this.priceLookup =
      options.priceLookup ??
      (async (item) => ({
        amount: 1000,
        currency: 'usd',
        productName: `Item ${item.id}`
      }));
  }

  async createCheckoutSession(
    options: CreateCheckoutOptions
  ): Promise<CheckoutSession> {
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    for (const item of options.items) {
      const lookup = await this.priceLookup(item);
      if (lookup.priceId) {
        lineItems.push({ price: lookup.priceId, quantity: item.quantity });
      } else if (lookup.amount && lookup.currency) {
        lineItems.push({
          quantity: item.quantity,
          price_data: {
            currency: lookup.currency,
            unit_amount: lookup.amount,
            product_data: {
              name: lookup.productName ?? item.id
            }
          }
        });
      } else {
        throw new Error(
          `priceLookup must return either priceId or amount+currency for item ${item.id}`
        );
      }
    }

    const session = await this.client.checkout.sessions.create(
      {
        mode: 'payment',
        line_items: lineItems,
        success_url: options.successUrl,
        cancel_url: options.cancelUrl,
        customer_email: options.customerEmail,
        metadata: options.metadata
      },
      options.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : undefined
    );

    if (!session.url) {
      throw new Error('Stripe did not return a session URL');
    }

    return { id: session.id, url: session.url };
  }

  verifyWebhook(rawBody: string | Buffer, signature: string): WebhookEvent {
    if (!this.webhookSecret) {
      throw new Error('webhookSecret is required to verify webhooks');
    }
    const event = this.client.webhooks.constructEvent(
      rawBody,
      signature,
      this.webhookSecret
    );
    return { id: event.id, type: event.type, data: event.data };
  }
}

export function createStripeProvider(env: NodeJS.ProcessEnv = process.env) {
  if (!env.STRIPE_SECRET_KEY) {
    return null;
  }
  return new StripeProvider({
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET
  });
}
