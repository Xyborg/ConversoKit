import type { EmailProvider, EmailSendOptions, EmailSendResult } from './email.js';

export interface CloudflareEmailProviderOptions {
  accountId: string;
  apiToken: string;
  /** Override for testing. */
  baseUrl?: string;
}

interface CloudflareSendResponse {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: unknown[];
  result?: {
    delivered: string[];
    permanent_bounces: string[];
    queued: string[];
  };
}

/**
 * Cloudflare Email Service (currently in beta — requires Workers Paid plan
 * and a domain onboarded via Cloudflare DNS).
 *
 * Docs: https://developers.cloudflare.com/email-service/get-started/send-emails/
 */
export class CloudflareEmailProvider implements EmailProvider {
  id = 'cloudflare';
  private endpoint: string;

  constructor(private options: CloudflareEmailProviderOptions) {
    const base = options.baseUrl ?? 'https://api.cloudflare.com/client/v4';
    this.endpoint = `${base}/accounts/${options.accountId}/email/sending/send`;
  }

  async send(opts: EmailSendOptions): Promise<EmailSendResult> {
    if (!opts.html && !opts.text) {
      throw new Error('Cloudflare send requires either `html` or `text`.');
    }
    const body: Record<string, unknown> = {
      to: opts.to,
      from: opts.from,
      subject: opts.subject
    };
    if (opts.html) body.html = opts.html;
    if (opts.text) body.text = opts.text;
    if (opts.replyTo) body.reply_to = opts.replyTo;

    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.options.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    let json: CloudflareSendResponse | null = null;
    try {
      json = (await res.json()) as CloudflareSendResponse;
    } catch {
      // fall through to status-only error
    }

    if (!res.ok || !json?.success) {
      const reason =
        json?.errors?.map((e) => `${e.code}: ${e.message}`).join('; ') ??
        `HTTP ${res.status}`;
      throw new Error(`Cloudflare send failed: ${reason}`);
    }

    const delivered = json.result?.delivered ?? [];
    const queued = json.result?.queued ?? [];
    const id = delivered[0] ?? queued[0] ?? '';
    return { id, ok: true, provider: this.id };
  }
}

export function createCloudflareEmailProvider(
  env: NodeJS.ProcessEnv = process.env
) {
  if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_EMAIL_API_TOKEN) return null;
  return new CloudflareEmailProvider({
    accountId: env.CLOUDFLARE_ACCOUNT_ID,
    apiToken: env.CLOUDFLARE_EMAIL_API_TOKEN
  });
}
