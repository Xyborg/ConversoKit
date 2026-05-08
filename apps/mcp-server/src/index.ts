import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import type { Tool, ToolContext } from '@conversokit/shared';

import { tools } from './tools/index.js';

const app = express();
app.use(cors());
app.use(express.json());

function buildContext(req: express.Request): ToolContext {
  return {
    sessionId: (req.header('x-conversokit-session') as string) || randomUUID(),
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
    const input = tool.inputSchema.parse(req.body);
    const ctx = buildContext(req);
    const output = await tool.handler(input, ctx);
    res.json(output);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Tool execution failed';
    res.status(400).json({ error: message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MCP server listening on port ${PORT}`);
});
