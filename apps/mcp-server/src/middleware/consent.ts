import type { Request, Response, NextFunction } from 'express';
import {
  consentRecordSchema,
  type ConsentRecord,
  type ConsentScope
} from '@conversokit/shared';

export function parseConsentHeader(req: Request): ConsentRecord | null {
  const header = req.header('x-conversokit-consent');
  if (!header) return null;
  try {
    const parsed = JSON.parse(header);
    return consentRecordSchema.parse(parsed);
  } catch {
    return null;
  }
}

export function consentMiddleware() {
  return function consent(req: Request, _res: Response, next: NextFunction) {
    const record = parseConsentHeader(req);
    if (record) req.conversokitConsent = record;
    next();
  };
}

export function requireConsent(
  record: ConsentRecord | undefined,
  required?: boolean,
  scopes?: ConsentScope[]
): { ok: boolean; reason?: string } {
  if (!required) return { ok: true };
  if (!record) return { ok: false, reason: 'Consent required but not provided' };
  if (scopes && scopes.length > 0) {
    const have = new Set(record.scopes);
    const missing = scopes.filter((s) => !have.has(s));
    if (missing.length > 0) {
      return { ok: false, reason: `Missing consent scopes: ${missing.join(', ')}` };
    }
  }
  return { ok: true };
}
