import type { Request } from 'express';
import type { AuthProvider, AuthResult } from '../AuthProvider.js';

export interface ApiKeyProviderOptions {
  apiKeys: string[];
}

export function apiKeyProvider(options: ApiKeyProviderOptions): AuthProvider {
  const keys = new Set(options.apiKeys);
  return {
    id: 'apiKey',
    type: 'apiKey',
    async verify(req: Request): Promise<AuthResult> {
      if (keys.size === 0) {
        return { ok: true, type: 'apiKey' };
      }
      const header = req.headers['authorization'];
      const raw = Array.isArray(header) ? header[0] : header;
      if (!raw) {
        return { ok: false, type: 'apiKey', reason: 'Missing authorization header' };
      }
      const token = raw.startsWith('Bearer ') ? raw.slice('Bearer '.length) : raw;
      if (!keys.has(token)) {
        return { ok: false, type: 'apiKey', reason: 'Invalid API key' };
      }
      return { ok: true, type: 'apiKey' };
    }
  };
}
