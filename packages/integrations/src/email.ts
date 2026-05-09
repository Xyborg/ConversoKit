export interface EmailSendOptions {
  to: string | string[];
  from: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  tags?: Record<string, string>;
}

export interface EmailSendResult {
  id: string;
  ok: boolean;
  provider: string;
}

export interface EmailProvider {
  id: string;
  send(options: EmailSendOptions): Promise<EmailSendResult>;
}
