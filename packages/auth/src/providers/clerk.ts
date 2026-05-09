import type { AuthProvider } from '../AuthProvider.js';
import { bearerJwtProvider } from './bearerJwt.js';

/**
 * Clerk publishable keys encode the frontend API host as base64url after the
 * 'pk_test_' or 'pk_live_' prefix. Decoding gives e.g. 'clerk.example.com$'.
 */
function frontendApiFromPublishableKey(pk: string): string | null {
  const m = pk.match(/^pk_(test|live)_(.+)$/);
  if (!m) return null;
  try {
    const decoded = Buffer.from(m[2], 'base64').toString('utf8');
    // Drop trailing '$' Clerk appends.
    return decoded.replace(/\$+$/, '');
  } catch {
    return null;
  }
}

export function clerkAuthProvider(
  env: NodeJS.ProcessEnv = process.env
): AuthProvider | null {
  const frontendApi =
    env.CLERK_FRONTEND_API ??
    (env.CLERK_PUBLISHABLE_KEY
      ? frontendApiFromPublishableKey(env.CLERK_PUBLISHABLE_KEY)
      : null);
  if (!frontendApi) return null;
  return bearerJwtProvider({
    jwksUri: `https://${frontendApi}/.well-known/jwks.json`,
    issuer: `https://${frontendApi}`
  });
}
