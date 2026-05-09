import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import {
  apiKeyProvider,
  createAuthMiddleware,
  type AuthProvider
} from '@conversokit/auth';
import type { Tool, ToolContext } from '@conversokit/shared';

import { tools } from './tools/index.js';

const app = express();
app.use(cors());
app.use(express.json());

const apiKeys = (process.env.CONVERSOKIT_API_KEYS ?? '')
  .split(',')
  .map((k) => k.trim())
  .filter(Boolean);

const providers: AuthProvider[] = [apiKeyProvider({ apiKeys })];
app.use(
  createAuthMiddleware({ providers, optional: apiKeys.length === 0 })
);

function buildContext(req: express.Request): ToolContext {
  return {
    sessionId: req.header('x-conversokit-session') ?? randomUUID(),
    logger: console
  };
}

app.get('/tools', (_req, res) => {
  res.json({
    tools: tools.map((t: Tool) => ({
      name: t.name,
      description: t.description,
      permissions: t.permissions
    }))
  });
});

app.post('/tools/:name', async (req, res) => {
  const tool = tools.find((t: Tool) => t.name === req.params.name);
  if (!tool) return res.status(404).json({ error: 'Tool not found' });
  try {
    const input = tool.inputSchema.parse(req.body);
    const output = await tool.handler(input, buildContext(req));
    res.json(output);
  } catch (err) {
    res.status(400).json({
      error: err instanceof Error ? err.message : 'Tool execution failed'
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`<% projectName %> MCP server listening on :${PORT}`);
});
