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

export class GitHubOAuthProvider implements OAuthFlowProvider {
  id = 'github';
  type: AuthType = 'oauth';
  private endpoints: OAuthEndpoints = {
    authorizationUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user'
  };
  constructor(private config: OAuthFlowConfig) {}

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: (this.config.scopes ?? ['read:user', 'user:email']).join(' '),
      state,
      allow_signup: 'true'
    });
    return `${this.endpoints.authorizationUrl}?${params.toString()}`;
  }

  async exchangeCode(code: string) {
    const tokenRes = await fetch(this.endpoints.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json'
      },
      body: new URLSearchParams({
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri
      })
    });
    if (!tokenRes.ok) {
      throw new Error(`GitHub token exchange failed: ${tokenRes.status}`);
    }
    const tokenJson = (await tokenRes.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
      error?: string;
      error_description?: string;
    };
    if (tokenJson.error) {
      throw new Error(
        tokenJson.error_description ?? `GitHub OAuth error: ${tokenJson.error}`
      );
    }
    const userRes = await fetch(this.endpoints.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${tokenJson.access_token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'conversokit'
      }
    });
    if (!userRes.ok) {
      throw new Error(`GitHub userinfo failed: ${userRes.status}`);
    }
    const userJson = (await userRes.json()) as {
      id: number;
      login: string;
      email?: string | null;
      name?: string | null;
    };
    let email = userJson.email ?? undefined;
    if (!email) {
      const emailsRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokenJson.access_token}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'conversokit'
        }
      });
      if (emailsRes.ok) {
        const emails = (await emailsRes.json()) as Array<{
          email: string;
          primary: boolean;
          verified: boolean;
        }>;
        email = emails.find((e) => e.primary && e.verified)?.email;
      }
    }
    return {
      user: {
        id: String(userJson.id),
        email,
        name: userJson.name ?? userJson.login
      },
      tokens: {
        accessToken: tokenJson.access_token,
        refreshToken: tokenJson.refresh_token,
        expiresIn: tokenJson.expires_in
      }
    };
  }

  async verify(_req: Request): Promise<AuthResult> {
    return {
      ok: false,
      type: this.type,
      reason:
        'OAuth providers authenticate via /auth/:provider/login, not the tool endpoints.'
    };
  }
}

export function githubProvider(env: NodeJS.ProcessEnv = process.env) {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) return null;
  return new GitHubOAuthProvider({
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
    redirectUri:
      env.GITHUB_REDIRECT_URI ?? 'http://localhost:3000/auth/github/callback'
  });
}
export class MicrosoftOAuthProvider implements OAuthFlowProvider {
  id = 'microsoft';
  type: AuthType = 'oauth';
  private endpoints: OAuthEndpoints;
  constructor(
    private config: OAuthFlowConfig & { tenant?: string }
  ) {
    const tenant = config.tenant ?? 'common';
    this.endpoints = {
      authorizationUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`,
      tokenUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
      userInfoUrl: 'https://graph.microsoft.com/oidc/userinfo'
    };
  }

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      response_mode: 'query',
      scope: (this.config.scopes ?? ['openid', 'email', 'profile', 'User.Read']).join(' '),
      state
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
        grant_type: 'authorization_code',
        scope: (this.config.scopes ?? ['openid', 'email', 'profile', 'User.Read']).join(' ')
      })
    });
    if (!tokenRes.ok) {
      throw new Error(`Microsoft token exchange failed: ${tokenRes.status}`);
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
      throw new Error(`Microsoft userinfo failed: ${userRes.status}`);
    }
    const userJson = (await userRes.json()) as {
      sub: string;
      email?: string;
      name?: string;
      preferred_username?: string;
    };
    return {
      user: {
        id: userJson.sub,
        email: userJson.email ?? userJson.preferred_username,
        name: userJson.name
      },
      tokens: {
        accessToken: tokenJson.access_token,
        refreshToken: tokenJson.refresh_token,
        expiresIn: tokenJson.expires_in
      }
    };
  }

  async verify(_req: Request): Promise<AuthResult> {
    return {
      ok: false,
      type: this.type,
      reason:
        'OAuth providers authenticate via /auth/:provider/login, not the tool endpoints.'
    };
  }
}

export function microsoftProvider(env: NodeJS.ProcessEnv = process.env) {
  if (!env.MS_CLIENT_ID || !env.MS_CLIENT_SECRET) return null;
  return new MicrosoftOAuthProvider({
    clientId: env.MS_CLIENT_ID,
    clientSecret: env.MS_CLIENT_SECRET,
    redirectUri:
      env.MS_REDIRECT_URI ?? 'http://localhost:3000/auth/microsoft/callback',
    tenant: env.MS_TENANT_ID
  });
}

export class Auth0Provider implements OAuthFlowProvider {
  id = 'auth0';
  type: AuthType = 'oauth';
  private endpoints: OAuthEndpoints;
  constructor(private config: OAuthFlowConfig & { domain: string }) {
    this.endpoints = {
      authorizationUrl: `https://${config.domain}/authorize`,
      tokenUrl: `https://${config.domain}/oauth/token`,
      userInfoUrl: `https://${config.domain}/userinfo`
    };
  }

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: (this.config.scopes ?? ['openid', 'email', 'profile']).join(' '),
      state
    });
    return `${this.endpoints.authorizationUrl}?${params.toString()}`;
  }

  async exchangeCode(code: string) {
    const tokenRes = await fetch(this.endpoints.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: this.config.redirectUri
      })
    });
    if (!tokenRes.ok) {
      throw new Error(`Auth0 token exchange failed: ${tokenRes.status}`);
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
      throw new Error(`Auth0 userinfo failed: ${userRes.status}`);
    }
    const userJson = (await userRes.json()) as {
      sub: string;
      email?: string;
      name?: string;
      nickname?: string;
    };
    return {
      user: {
        id: userJson.sub,
        email: userJson.email,
        name: userJson.name ?? userJson.nickname
      },
      tokens: {
        accessToken: tokenJson.access_token,
        refreshToken: tokenJson.refresh_token,
        expiresIn: tokenJson.expires_in
      }
    };
  }

  async verify(_req: Request): Promise<AuthResult> {
    return {
      ok: false,
      type: this.type,
      reason:
        'OAuth providers authenticate via /auth/:provider/login, not the tool endpoints.'
    };
  }
}

export function auth0Provider(env: NodeJS.ProcessEnv = process.env) {
  if (
    !env.AUTH0_DOMAIN ||
    !env.AUTH0_CLIENT_ID ||
    !env.AUTH0_CLIENT_SECRET
  ) {
    return null;
  }
  return new Auth0Provider({
    domain: env.AUTH0_DOMAIN,
    clientId: env.AUTH0_CLIENT_ID,
    clientSecret: env.AUTH0_CLIENT_SECRET,
    redirectUri:
      env.AUTH0_REDIRECT_URI ?? 'http://localhost:3000/auth/auth0/callback'
  });
}
