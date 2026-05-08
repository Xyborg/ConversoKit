import type { Request } from 'express';
import type { AuthProvider, AuthResult, AuthType } from '../AuthProvider.js';

export interface OAuthProviderConfig {
  id: string;
  type?: AuthType;
}

class NotImplementedProvider implements AuthProvider {
  id: string;
  type: AuthType;
  constructor(config: OAuthProviderConfig) {
    this.id = config.id;
    this.type = config.type ?? 'oauth';
  }
  async verify(_req: Request): Promise<AuthResult> {
    return {
      ok: false,
      type: this.type,
      reason: `OAuth provider '${this.id}' is not implemented yet (Phase 5).`
    };
  }
}

export function googleProvider(): AuthProvider {
  return new NotImplementedProvider({ id: 'google' });
}

export function githubProvider(): AuthProvider {
  return new NotImplementedProvider({ id: 'github' });
}

export function microsoftProvider(): AuthProvider {
  return new NotImplementedProvider({ id: 'microsoft' });
}

export function auth0Provider(): AuthProvider {
  return new NotImplementedProvider({ id: 'auth0' });
}

export function clerkProvider(): AuthProvider {
  return new NotImplementedProvider({ id: 'clerk' });
}

export function supabaseProvider(): AuthProvider {
  return new NotImplementedProvider({ id: 'supabase' });
}
