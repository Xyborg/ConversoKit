import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { defineTool, type Tool } from '@conversokit/shared';
import {
  createHubspotProvider,
  MockCrmProvider,
  type CrmProvider
} from '@conversokit/integrations';

const crm: CrmProvider =
  createHubspotProvider(process.env) ?? new MockCrmProvider();

const submitLead = defineTool({
  name: 'submit_lead',
  description:
    'Capture a SaaS onboarding lead and upsert it into HubSpot (mock fallback when HUBSPOT_API_KEY is missing).',
  inputSchema: z.object({
    formId: z.string(),
    values: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
    submittedAt: z.string()
  }),
  outputSchema: z.object({
    leadId: z.string(),
    provider: z.string()
  }),
  permissions: { requiresAuth: false, requiresConsent: true },
  async handler(input) {
    const { values } = input;
    const result = await crm.upsertContact({
      email: typeof values.email === 'string' ? values.email : undefined,
      name: typeof values.name === 'string' ? values.name : undefined,
      company: typeof values.company === 'string' ? values.company : undefined,
      properties: Object.fromEntries(
        Object.entries(values).filter(([k]) => !['email', 'name', 'company'].includes(k))
      )
    });
    return { leadId: result.id, provider: result.provider };
  }
});

const tools: Tool[] = [submitLead];

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

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
  if (!tool) return res.status(404).json({ error: 'Tool not found' });
  try {
    const input = tool.inputSchema.parse(req.body);
    const sessionId = req.header('x-conversokit-session') ?? 'demo-session';
    const output = await tool.handler(input, { sessionId, logger: console });
    res.json(output);
  } catch (err) {
    res.status(400).json({
      error: err instanceof Error ? err.message : 'Tool execution failed'
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SaaS onboarding MCP server listening on :${PORT} (crm: ${crm.id})`);
});
