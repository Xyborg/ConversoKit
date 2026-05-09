import { Router } from 'express';
import { randomUUID, createHmac } from 'node:crypto';
import { googleProvider, githubProvider } from '@conversokit/auth';
import type { OAuthFlowProvider } from '@conversokit/auth';

const COOKIE_NAME = 'conversokit_session';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24h

function getCookieSecret(): string {
  return process.env.COOKIE_SECRET ?? 'dev-cookie-secret-change-me';
}

function sign(value: string, secret: string): string {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

export function createSessionCookie(payload: Record<string, unknown>): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = sign(body, getCookieSecret());
  return `${body}.${sig}`;
}

export function readSessionCookie(
  raw: string | undefined
): Record<string, unknown> | null {
  if (!raw) return null;
  const [body, sig] = raw.split('.');
  if (!body || !sig) return null;
  if (sign(body, getCookieSecret()) !== sig) return null;
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as Record<
      string,
      unknown
    >;
  } catch {
    return null;
  }
}

export function authRouter(): Router {
  const router = Router();
  const google = googleProvider(process.env);
  const github = githubProvider(process.env);

  const providers: Record<string, OAuthFlowProvider | null> = {
    google,
    github
  };

  router.get('/auth/:provider/login', (req, res) => {
    const provider = providers[req.params.provider];
    if (!provider) {
      return res
        .status(404)
        .json({ error: `Unknown or unconfigured provider: ${req.params.provider}` });
    }
    const state = randomUUID();
    res.cookie(`${COOKIE_NAME}_state`, state, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 300_000
    });
    res.redirect(provider.getAuthorizationUrl(state));
  });

  router.get('/auth/:provider/callback', async (req, res) => {
    const provider = providers[req.params.provider];
    if (!provider) {
      return res.status(404).json({ error: 'Unknown provider' });
    }
    const code = req.query.code;
    const state = req.query.state;
    const storedState = (req.headers.cookie ?? '')
      .split(';')
      .map((c) => c.trim().split('='))
      .find(([k]) => k === `${COOKIE_NAME}_state`)?.[1];
    if (!storedState || storedState !== state) {
      return res.status(400).json({ error: 'State mismatch' });
    }
    if (typeof code !== 'string') {
      return res.status(400).json({ error: 'Missing code' });
    }
    try {
      const result = await provider.exchangeCode(code);
      const cookie = createSessionCookie({
        provider: req.params.provider,
        userId: result.user.id,
        email: result.user.email,
        name: result.user.name,
        iat: Date.now(),
        exp: Date.now() + COOKIE_MAX_AGE * 1000
      });
      res.cookie(COOKIE_NAME, cookie, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE * 1000
      });
      res.redirect('/');
    } catch (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : 'OAuth callback failed'
      });
    }
  });

  router.post('/auth/logout', (_req, res) => {
    res.clearCookie(COOKIE_NAME);
    res.json({ ok: true });
  });

  router.get('/auth/me', (req, res) => {
    const cookie = (req.headers.cookie ?? '')
      .split(';')
      .map((c) => c.trim().split('='))
      .find(([k]) => k === COOKIE_NAME)?.[1];
    const session = readSessionCookie(cookie);
    if (!session) {
      return res.status(401).json({ authenticated: false });
    }
    res.json({ authenticated: true, session });
  });

  return router;
}
