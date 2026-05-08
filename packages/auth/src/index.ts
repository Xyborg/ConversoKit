/**
 * Minimal authentication helpers.
 *
 * This module exports a middleware function that can be used by the MCP
 * server to verify that a request contains a valid API key.  In a real
 * implementation you might integrate with OAuth providers or session
 * management libraries.
 */
import { Request, Response, NextFunction } from 'express';

export interface AuthOptions {
  /**
   * List of accepted API keys.  In production you would likely load this from
   * environment variables or a database.  If the array is empty, authentication
   * is disabled and all requests are allowed.
   */
  apiKeys: string[];
}

/**
 * Express middleware that checks for a valid API key in the `authorization`
 * header.  If authentication fails, the request is rejected with a 401.
 */
export function createAuthMiddleware(options: AuthOptions) {
  return function authMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!options.apiKeys || options.apiKeys.length === 0) {
      return next();
    }
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }
    const token = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    if (!options.apiKeys.includes(token)) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    next();
  };
}