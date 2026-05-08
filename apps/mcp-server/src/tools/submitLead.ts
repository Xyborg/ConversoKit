import { z } from 'zod';
import { defineTool, leadSubmissionSchema } from '@conversokit/shared';
import {
  MockCrmProvider,
  createHubspotProvider,
  type CrmProvider
} from '@conversokit/integrations';
import { defaultLeadStore } from '../store/leads.js';

const hubspot = createHubspotProvider(process.env);
const crm: CrmProvider = hubspot ?? new MockCrmProvider();

export const submitLeadTool = defineTool({
  name: 'submit_lead',
  description:
    'Submit a qualified lead. Stores it locally and upserts into the configured CRM (Mock or HubSpot).',
  inputSchema: leadSubmissionSchema,
  outputSchema: z.object({
    leadId: z.string(),
    crmContactId: z.string().optional(),
    provider: z.string()
  }),
  permissions: { requiresAuth: false, requiresConsent: true },
  async handler(input) {
    const id = `lead_${Math.random().toString(36).slice(2)}`;
    await defaultLeadStore.put({ ...input, id });

    const email =
      typeof input.values.email === 'string' ? input.values.email : undefined;
    const name =
      typeof input.values.name === 'string' ? input.values.name : undefined;
    const company =
      typeof input.values.company === 'string' ? input.values.company : undefined;

    let crmContactId: string | undefined;
    try {
      const result = await crm.upsertContact({ email, name, company });
      crmContactId = result.id;
    } catch (err) {
      // CRM failures should not block lead capture; fall through silently.
      console.warn('CRM upsert failed:', err instanceof Error ? err.message : err);
    }

    return { leadId: id, crmContactId, provider: crm.id };
  }
});
