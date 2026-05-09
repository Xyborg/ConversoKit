import { Resend } from 'resend';
import type { EmailProvider, EmailSendOptions, EmailSendResult } from './email.js';

export interface ResendEmailProviderOptions {
  apiKey: string;
}

export class ResendEmailProvider implements EmailProvider {
  id = 'resend';
  private client: Resend;

  constructor(options: ResendEmailProviderOptions) {
    this.client = new Resend(options.apiKey);
  }

  async send(options: EmailSendOptions): Promise<EmailSendResult> {
    if (!options.html && !options.text) {
      throw new Error('Resend send requires either `html` or `text`.');
    }
    const tags = options.tags
      ? Object.entries(options.tags).map(([name, value]) => ({ name, value }))
      : undefined;
    // Build the payload incrementally so html/text optionality matches Resend's
    // discriminated CreateEmailOptions union.
    const base = {
      from: options.from,
      to: options.to,
      subject: options.subject,
      replyTo: options.replyTo,
      tags
    };
    const payload = options.html
      ? { ...base, html: options.html, text: options.text }
      : { ...base, text: options.text as string };
    const result = await this.client.emails.send(payload);
    if (result.error) {
      throw new Error(`Resend send failed: ${result.error.message}`);
    }
    return {
      id: result.data?.id ?? '',
      ok: true,
      provider: this.id
    };
  }
}

export function createResendProvider(env: NodeJS.ProcessEnv = process.env) {
  if (!env.RESEND_API_KEY) return null;
  return new ResendEmailProvider({ apiKey: env.RESEND_API_KEY });
}
