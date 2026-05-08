import type { Request } from 'express';
import { randomUUID } from 'node:crypto';
import type { AuthProvider, AuthResult } from '../AuthProvider.js';

export function anonymousSessionProvider(): AuthProvider {
  return {
    id: 'anonymous',
    type: 'anonymous',
    async verify(req: Request): Promise<AuthResult> {
      const sessionHeader = req.header('x-conversokit-session');
      const sessionId = sessionHeader ?? randomUUID();
      return {
        ok: true,
        type: 'anonymous',
        user: { id: `anon:${sessionId}` }
      };
    }
  };
}
