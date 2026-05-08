import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import {
  apiKeyProvider,
  bearerJwtProvider,
  createAuthMiddleware,
  type AuthProvider
} from '@conversokit/auth';
import type { Tool, ToolContext } from '@conversokit/shared';

import { tools } from './tools/index.js';
import { consentMiddleware, requireConsent } from './middleware/consent.js';
import { userDataRouter } from './routes/userdata.js';
import { webhookRouter } from './routes/webhooks.js';
import { adminRouter } from './routes/admin.js';

const app = express();
app.use(cors());

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
    auth: req.conversokitAuth
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

  if (
    tool.permissions.requiresAuth &&
    (!req.conversokitAuth || !req.conversokitAuth.ok)
  ) {
    return res
      .status(401)
      .json({ error: 'Authentication required for this tool' });
  }

  const consentCheck = requireConsent(
    req.conversokitConsent,
    tool.permissions.requiresConsent
  );
  if (!consentCheck.ok) {
    return res.status(412).json({ error: consentCheck.reason });
  }

  try {
    const input = tool.inputSchema.parse(req.body);
    const ctx = buildContext(req);
    const output = await tool.handler(input, ctx);
    res.json(output);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Tool execution failed';
    res.status(400).json({ error: message });
  }
});

app.use(userDataRouter());
app.use(adminRouter());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MCP server listening on port ${PORT}`);
});
