import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { createMcpRouter, executeTool, ToolExecutionError } from '@conversokit/mcp';
import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import {
  apiKeyProvider,
  bearerJwtProvider,
  clerkAuthProvider,
  createAuthMiddleware,
  supabaseAuthProvider,
  type AuthProvider
} from '@conversokit/auth';
import type { Tool, ToolContext } from '@conversokit/shared';

import { tools } from './tools/index.js';
import { consentMiddleware } from './middleware/consent.js';
import { userDataRouter } from './routes/userdata.js';
import { webhookRouter } from './routes/webhooks.js';
import { adminRouter } from './routes/admin.js';
import { authRouter } from './routes/auth.js';

const widgetHtmlPath =
  process.env.CONVERSOKIT_WIDGET_HTML ??
  (process.env.VERCEL
    ? resolve(process.cwd(), 'apps/widget-ui/dist/index.html')
    : new URL('../../widget-ui/dist/index.html', import.meta.url));
const app = express();
app.use(cors());

// Health check — must answer before auth middleware so external probes
// (Railway, Docker compose healthchecks, Vercel) don't 401.
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Webhook routes need raw body for signature verification, so mount them
// BEFORE express.json() (which would consume the body).
app.use(webhookRouter());

app.use(express.json());

const apiKeys = (process.env.CONVERSOKIT_API_KEYS ?? '')
  .split(',')
  .map((k) => k.trim())
  .filter(Boolean);

const providers: AuthProvider[] = [];
if (apiKeys.length > 0) providers.push(apiKeyProvider({ apiKeys }));
if (process.env.JWT_SECRET) {
  providers.push(bearerJwtProvider({ secret: process.env.JWT_SECRET }));
}
if (process.env.JWKS_URI) {
  providers.push(bearerJwtProvider({ jwksUri: process.env.JWKS_URI }));
}
const clerk = clerkAuthProvider(process.env);
if (clerk) providers.push(clerk);
const supabaseAuth = supabaseAuthProvider(process.env);
if (supabaseAuth) providers.push(supabaseAuth);

const authOptional = providers.length === 0;
app.use(
  createAuthMiddleware({
    providers: providers.length > 0 ? providers : [apiKeyProvider({ apiKeys: [] })],
    optional: authOptional
  })
);
app.use(consentMiddleware());

function buildContext(req: express.Request): ToolContext {
  const sessionId = req.header('x-conversokit-session') ?? randomUUID();
  return {
    sessionId,
    userId: req.conversokitAuth?.user?.id,
    auth:
      req.conversokitAuth?.ok && (providers.length > 0 || req.conversokitAuth.user)
        ? { type: req.conversokitAuth.type, user: req.conversokitAuth.user }
        : undefined,
    consent: req.conversokitConsent,
    logger: console
  };
}

app.get('/tools', (_req, res) => {
  const list = tools.map((tool: Tool) => ({
    name: tool.name,
    description: tool.description,
    permissions: tool.permissions
  }));
  res.json({ tools: list });
});

app.post('/tools/:name', async (req, res) => {
  const name = req.params.name;
  const tool = tools.find((t: Tool) => t.name === name);
  if (!tool) {
    return res.status(404).json({ error: 'Tool not found' });
  }

  try {
    const output = await executeTool(tool, req.body, buildContext(req));
    res.json(output);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Tool execution failed';
    res
      .status(err instanceof ToolExecutionError ? err.status : 400)
      .json({ error: message });
  }
});

app.use(
  createMcpRouter({
    name: 'conversokit',
    version: '0.2.0',
    tools,
    context: buildContext,
    allowedOrigins: (process.env.MCP_ALLOWED_ORIGINS ?? '').split(',').filter(Boolean),
    widgets: [
      {
        uri: 'ui://conversokit/app-v1.html',
        name: 'ConversoKit widgets',
        html: () => readFile(widgetHtmlPath, 'utf8'),
        csp: { resourceDomains: ['https://example.com'] }
      }
    ]
  })
);

app.use(authRouter());
app.use(userDataRouter());
app.use(adminRouter());

const PORT = process.env.PORT || 3000;

// Skip listen() when running under Vercel — the platform handles request
// dispatch via the exported `app`.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`MCP server listening on port ${PORT}`);
  });
}

export default app;
export { app };
