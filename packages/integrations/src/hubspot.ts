import type { CrmContact, CrmProvider, CrmUpsertResult } from './crm.js';

export interface HubspotProviderOptions {
  apiKey: string;
}

export class HubspotProvider implements CrmProvider {
  id = 'hubspot';
  constructor(private options: HubspotProviderOptions) {}

  async upsertContact(_contact: CrmContact): Promise<CrmUpsertResult> {
    // Phase 5: implement against the HubSpot Contacts API.
    // For now, throw so the consumer falls back to MockCrmProvider during dev.
    throw new Error('HubspotProvider is not implemented yet (post-MVP).');
  }
}

export function createHubspotProvider(env: NodeJS.ProcessEnv = process.env) {
  if (!env.HUBSPOT_API_KEY) return null;
  return new HubspotProvider({ apiKey: env.HUBSPOT_API_KEY });
}
