import type { Request, Response, NextFunction } from 'express';
import type { AuthProvider, AuthResult } from './AuthProvider.js';
import { apiKeyProvider } from './providers/apiKey.js';

export * from './AuthProvider.js';
export * from './providers/index.js';

export interface AuthMiddlewareOptions {
  /** API keys for the default apiKey provider. Empty disables auth in dev. */
  apiKeys?: string[];
  /** Pre-configured providers. If set, overrides apiKeys. */
  providers?: AuthProvider[];
  /** When true, attaches result to req.conversokitAuth but does not 401. */
  optional?: boolean;
}

export function createAuthMiddleware(options: AuthMiddlewareOptions = {}) {
  const providers: AuthProvider[] =
    options.providers ?? [apiKeyProvider({ apiKeys: options.apiKeys ?? [] })];

  return async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    let lastFailure: AuthResult | null = null;
    for (const provider of providers) {
      const result = await provider.verify(req);
      if (result.ok) {
        req.conversokitAuth = result;
        return next();
      }
      lastFailure = result;
    }
    if (options.optional) {
      req.conversokitAuth = { ok: false, type: 'anonymous', reason: 'unauthenticated' };
      return next();
    }
    res
      .status(401)
      .json({ error: lastFailure?.reason ?? 'Authentication required' });
  };
}
