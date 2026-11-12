import { z } from 'zod';
import { defineTool, leadSubmissionSchema } from '@conversokit/shared';

export const submitLeadTool = defineTool({
  name: 'submit_lead',
  description:
    'Submit a qualified lead. Replace this stub with a CRM upsert (HubSpot, Salesforce, etc.) when wiring real persistence.',
  inputSchema: leadSubmissionSchema,
  outputSchema: z.object({
    leadId: z.string(),
    provider: z.string()
  }),
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  permissions: {
    requiresAuth: false,
    requiresConsent: true,
    consentScopes: ['personalData']
  },
  async handler() {
    return {
      leadId: `lead_${Math.random().toString(36).slice(2)}`,
      provider: 'mock'
    };
  }
});
