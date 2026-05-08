import type { Request } from 'express';
import { jwtVerify, createRemoteJWKSet, type JWTPayload } from 'jose';
import type { AuthProvider, AuthResult } from '../AuthProvider.js';

export interface BearerJwtProviderOptions {
  /** HS256 shared secret. Mutually exclusive with `jwksUri`. */
  secret?: string;
  /** Remote JWKS URL for RS256 verification (Auth0/Clerk/Supabase). */
  jwksUri?: string;
  issuer?: string;
  audience?: string | string[];
  /** Callback to map a verified payload to AuthUser. */
  mapUser?: (payload: JWTPayload) => AuthResult['user'];
}

function defaultMapUser(payload: JWTPayload): AuthResult['user'] {
  const sub = typeof payload.sub === 'string' ? payload.sub : undefined;
  const email = typeof payload.email === 'string' ? payload.email : undefined;
  const name = typeof payload.name === 'string' ? payload.name : undefined;
  if (!sub) return undefined;
  return { id: sub, email, name };
}

export function bearerJwtProvider(options: BearerJwtProviderOptions): AuthProvider {
  if (!options.secret && !options.jwksUri) {
    throw new Error('bearerJwtProvider requires either `secret` or `jwksUri`');
  }
  const jwks = options.jwksUri ? createRemoteJWKSet(new URL(options.jwksUri)) : null;
  const secretKey = options.secret ? new TextEncoder().encode(options.secret) : null;
  const mapUser = options.mapUser ?? defaultMapUser;

  return {
    id: 'jwt',
    type: 'jwt',
    async verify(req: Request): Promise<AuthResult> {
      const header = req.headers['authorization'];
      const raw = Array.isArray(header) ? header[0] : header;
      if (!raw || !raw.startsWith('Bearer ')) {
        return { ok: false, type: 'jwt', reason: 'Missing bearer token' };
      }
      const token = raw.slice('Bearer '.length);
      try {
        const { payload } = jwks
          ? await jwtVerify(token, jwks, {
              issuer: options.issuer,
              audience: options.audience
            })
          : await jwtVerify(token, secretKey!, {
              issuer: options.issuer,
              audience: options.audience
            });
        return { ok: true, type: 'jwt', user: mapUser(payload) };
      } catch (err) {
        return {
          ok: false,
          type: 'jwt',
          reason: err instanceof Error ? err.message : 'Invalid token'
        };
      }
    }
  };
}
