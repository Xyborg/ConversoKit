import type { Request } from 'express';

export type AuthType = 'apiKey' | 'jwt' | 'oauth' | 'anonymous';

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
}

export interface AuthResult {
  ok: boolean;
  type: AuthType;
  user?: AuthUser;
  reason?: string;
}

export interface AuthProvider {
  id: string;
  type: AuthType;
  verify(req: Request): Promise<AuthResult>;
}

export const ANON_RESULT: AuthResult = { ok: true, type: 'anonymous' };
