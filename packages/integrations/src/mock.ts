import type {
  CheckoutSession,
  CreateCheckoutOptions,
  PaymentProvider
} from './types.js';

export class MockPaymentProvider implements PaymentProvider {
  id = 'mock';
  async createCheckoutSession(options: CreateCheckoutOptions): Promise<CheckoutSession> {
    const sessionId = `sess_mock_${Math.random().toString(36).slice(2)}`;
    const sep = options.successUrl.includes('?') ? '&' : '?';
    return {
      id: sessionId,
      url: `${options.successUrl}${sep}session_id=${sessionId}`
    };
  }
}
