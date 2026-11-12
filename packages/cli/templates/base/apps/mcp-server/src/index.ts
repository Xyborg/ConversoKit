import { resolve } from 'node:path';
import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createAuthMiddleware } from '@conversokit/auth';
import { createMcpRouter, executeTool, ToolExecutionError } from '@conversokit/mcp';
import { consentRecordSchema, type ToolContext } from '@conversokit/shared';
import { tools } from './tools/index.js';

const widgetHtmlPath =
  process.env.CONVERSOKIT_WIDGET_HTML ??
  (process.env.VERCEL
    ? resolve(process.cwd(), 'apps/widget-ui/dist/index.html')
    : new URL('../../widget-ui/dist/index.html', import.meta.url));
const app = express();
app.use(cors());
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});
app.use(express.json());
const apiKeys = (process.env.CONVERSOKIT_API_KEYS ?? '')
  .split(',')
  .map((k) => k.trim())
  .filter(Boolean);
app.use(createAuthMiddleware({ apiKeys, optional: apiKeys.length === 0 }));

function buildContext(req: express.Request): ToolContext {
  let consent;
  try {
    consent = consentRecordSchema.parse(
      JSON.parse(req.header('x-conversokit-consent') ?? 'null')
    );
  } catch {
    /* Missing/invalid consent is rejected by the tool executor when required. */
  }
  return {
    sessionId: req.header('x-conversokit-session') ?? randomUUID(),
    auth:
      apiKeys.length && req.conversokitAuth?.ok
        ? { type: req.conversokitAuth.type, user: req.conversokitAuth.user }
        : undefined,
    userId: req.conversokitAuth?.user?.id,
    consent,
    logger: console
  };
}
app.use(
  createMcpRouter({
    name: '<% projectName %>',
    version: '0.1.0',
    tools,
    context: buildContext,
    allowedOrigins: (process.env.MCP_ALLOWED_ORIGINS ?? '').split(',').filter(Boolean),
    widgets: [
      {
        uri: 'ui://conversokit/app-v1.html',
        name: '<% projectName %>',
        html: () => readFile(widgetHtmlPath, 'utf8'),
        csp: { resourceDomains: ['https://example.com'] }
      }
    ]
  })
);
app.get('/tools', (_req, res) => {
  res.json({
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
      permissions: t.permissions
    }))
  });
});
app.post('/tools/:name', async (req, res) => {
  const tool = tools.find((t) => t.name === req.params.name);
  if (!tool) {
    res.status(404).json({ error: 'Tool not found' });
    return;
  }
  try {
    res.json(await executeTool(tool, req.body, buildContext(req)));
  } catch (error) {
    res.status(error instanceof ToolExecutionError ? error.status : 400).json({
      error: error instanceof Error ? error.message : 'Tool execution failed'
    });
  }
});
if (!process.env.VERCEL) {
  app.listen(process.env.PORT || 3000, () =>
    console.log('MCP endpoint: http://localhost:' + (process.env.PORT || 3000) + '/mcp')
  );
}
export { app };
export default app;
