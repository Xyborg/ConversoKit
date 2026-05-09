import type { AuthProvider } from '../AuthProvider.js';
import { bearerJwtProvider } from './bearerJwt.js';

/**
 * Verifies Supabase Auth-issued JWTs against the project's JWT secret.
 * Issuer (when SUPABASE_URL is set) is `<SUPABASE_URL>/auth/v1`.
 */
export function supabaseAuthProvider(
  env: NodeJS.ProcessEnv = process.env
): AuthProvider | null {
  if (!env.SUPABASE_JWT_SECRET) return null;
  return bearerJwtProvider({
    secret: env.SUPABASE_JWT_SECRET,
    issuer: env.SUPABASE_URL ? `${env.SUPABASE_URL}/auth/v1` : undefined
  });
}
