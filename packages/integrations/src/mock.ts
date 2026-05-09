import type {
  CheckoutSession,
  CreateCheckoutOptions,
  PaymentProvider
} from './types.js';
import type { EmailProvider, EmailSendOptions, EmailSendResult } from './email.js';

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

export class MockEmailProvider implements EmailProvider {
  id = 'mock';
  async send(options: EmailSendOptions): Promise<EmailSendResult> {
    const id = `mail_mock_${Math.random().toString(36).slice(2)}`;
    console.log(
      `[MockEmailProvider] ${options.from} → ${
        Array.isArray(options.to) ? options.to.join(', ') : options.to
      } · "${options.subject}"`
    );
    return { id, ok: true, provider: this.id };
  }
}
