import type { Request } from 'express';
import type { AuthProvider, AuthResult, AuthType } from '../AuthProvider.js';

export interface OAuthFlowConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes?: string[];
}

export interface OAuthEndpoints {
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
}

export interface OAuthFlowProvider extends AuthProvider {
  /** Build the consent screen URL for the host to redirect to. */
  getAuthorizationUrl(state: string): string;
  /** Exchange a code for tokens + a verified user profile. */
  exchangeCode(code: string): Promise<{ user: { id: string; email?: string; name?: string }; tokens: { accessToken: string; refreshToken?: string; expiresIn?: number } }>;
}

class StubOAuthProvider implements AuthProvider {
  id: string;
  type: AuthType = 'oauth';
  constructor(id: string) {
    this.id = id;
  }
  async verify(_req: Request): Promise<AuthResult> {
    return {
      ok: false,
      type: this.type,
      reason: `OAuth provider '${this.id}' is not implemented yet (post-MVP).`
    };
  }
}

export class GoogleOAuthProvider implements OAuthFlowProvider {
  id = 'google';
  type: AuthType = 'oauth';
  private endpoints: OAuthEndpoints = {
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://openidconnect.googleapis.com/v1/userinfo'
  };
  constructor(private config: OAuthFlowConfig) {}

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: (this.config.scopes ?? ['openid', 'email', 'profile']).join(' '),
      state,
      access_type: 'offline',
      prompt: 'consent'
    });
    return `${this.endpoints.authorizationUrl}?${params.toString()}`;
  }

  async exchangeCode(code: string) {
    const tokenRes = await fetch(this.endpoints.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        grant_type: 'authorization_code'
      })
    });
    if (!tokenRes.ok) {
      throw new Error(`Google token exchange failed: ${tokenRes.status}`);
    }
    const tokenJson = (await tokenRes.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };
    const userRes = await fetch(this.endpoints.userInfoUrl, {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` }
    });
    if (!userRes.ok) {
      throw new Error(`Google userinfo failed: ${userRes.status}`);
    }
    const userJson = (await userRes.json()) as {
      sub: string;
      email?: string;
      name?: string;
    };
    return {
      user: { id: userJson.sub, email: userJson.email, name: userJson.name },
      tokens: {
        accessToken: tokenJson.access_token,
        refreshToken: tokenJson.refresh_token,
        expiresIn: tokenJson.expires_in
      }
    };
  }

  async verify(_req: Request): Promise<AuthResult> {
    // OAuth verification happens via the session cookie (handled by the
    // session middleware in the consumer app), not on every tool call.
    // This returning failure means OAuth alone won't authenticate a /tools
    // request — pair it with a session/JWT provider.
    return {
      ok: false,
      type: this.type,
      reason: 'OAuth providers authenticate via /auth/:provider/login, not the tool endpoints.'
    };
  }
}

export function googleProvider(env: NodeJS.ProcessEnv = process.env) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return null;
  return new GoogleOAuthProvider({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri:
      env.GOOGLE_REDIRECT_URI ?? 'http://localhost:3000/auth/google/callback'
  });
}

export function githubProvider(): AuthProvider {
  return new StubOAuthProvider('github');
}
export function microsoftProvider(): AuthProvider {
  return new StubOAuthProvider('microsoft');
}
export function auth0Provider(): AuthProvider {
  return new StubOAuthProvider('auth0');
}
export function clerkProvider(): AuthProvider {
  return new StubOAuthProvider('clerk');
}
export function supabaseProvider(): AuthProvider {
  return new StubOAuthProvider('supabase');
}
