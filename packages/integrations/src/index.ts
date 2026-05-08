/**
 * Stub integrations module.
 *
 * This package contains abstractions for connecting to third‑party services such
 * as payment processors, CRMs or analytics providers.  Each integration is
 * implemented in its own file and exported from the public API here.
 *
 * The integrations are intentionally abstracted behind simple interfaces so
 * that they can be swapped out or mocked when testing.  For example, to add
 * Stripe payments you would create a `stripe.ts` file in this directory
 * exporting functions like `createCheckoutSession()`.
 */

// Example type definitions for a checkout session; replace with real SDK calls.
export interface CheckoutSession {
  id: string;
  url: string;
}

export interface PaymentProvider {
  createCheckoutSession(options: {
    items: Array<{ id: string; quantity: number }>;
    successUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutSession>;
}

/**
 * Example implementation of a fake payment provider.  This returns dummy
 * checkout session data and can be used when developing locally without
 * connecting to a real payment gateway.
 */
export class MockPaymentProvider implements PaymentProvider {
  async createCheckoutSession(options: {
    items: Array<{ id: string; quantity: number }>;
    successUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutSession> {
    const session: CheckoutSession = {
      id: 'sess_' + Math.random().toString(36).slice(2),
      url: options.successUrl + '?session_id=dummy'
    };
    return session;
  }
}