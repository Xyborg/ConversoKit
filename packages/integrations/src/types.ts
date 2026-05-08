export interface CheckoutLineItem {
  id: string;
  quantity: number;
  /**
   * Optional Stripe price ID. If absent, the provider's `priceLookup`
   * callback resolves an id-to-price mapping.
   */
  priceId?: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
}

export interface CreateCheckoutOptions {
  items: CheckoutLineItem[];
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
  idempotencyKey?: string;
}

export interface PaymentProvider {
  id: string;
  createCheckoutSession(options: CreateCheckoutOptions): Promise<CheckoutSession>;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: unknown;
}

export interface WebhookCapablePaymentProvider extends PaymentProvider {
  verifyWebhook(rawBody: string | Buffer, signature: string): WebhookEvent;
}
