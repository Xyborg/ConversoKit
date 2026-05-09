import type { CrmContact, CrmProvider, CrmUpsertResult } from './crm.js';

export interface HubspotProviderOptions {
  apiKey: string;
  /** Override for tests / non-prod regions. */
  baseUrl?: string;
}

const DEFAULT_BASE_URL = 'https://api.hubapi.com';

interface HubspotContactResponse {
  id: string;
  properties?: Record<string, string>;
}

interface HubspotSearchResponse {
  total: number;
  results: HubspotContactResponse[];
}

export class HubspotProvider implements CrmProvider {
  id = 'hubspot';
  private baseUrl: string;

  constructor(private options: HubspotProviderOptions) {
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  }

  private headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.options.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  private toProperties(contact: CrmContact): Record<string, string> {
    const props: Record<string, string> = {};
    if (contact.email) props.email = contact.email;
    if (contact.name) {
      const [firstname, ...rest] = contact.name.split(' ');
      props.firstname = firstname;
      if (rest.length) props.lastname = rest.join(' ');
    }
    if (contact.company) props.company = contact.company;
    if (contact.properties) {
      for (const [k, v] of Object.entries(contact.properties)) {
        props[k] = String(v);
      }
    }
    return props;
  }

  async upsertContact(contact: CrmContact): Promise<CrmUpsertResult> {
    const properties = this.toProperties(contact);

    // Try create first.
    const createRes = await fetch(`${this.baseUrl}/crm/v3/objects/contacts`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ properties })
    });

    if (createRes.ok) {
      const json = (await createRes.json()) as HubspotContactResponse;
      return { id: json.id, ok: true, provider: this.id };
    }

    // 409 = contact already exists. Look up by email and PATCH.
    if (createRes.status === 409 && contact.email) {
      const existingId = await this.findByEmail(contact.email);
      if (existingId) {
        const patchRes = await fetch(
          `${this.baseUrl}/crm/v3/objects/contacts/${existingId}`,
          {
            method: 'PATCH',
            headers: this.headers(),
            body: JSON.stringify({ properties })
          }
        );
        if (!patchRes.ok) {
          throw new Error(
            `HubSpot contact patch failed: ${patchRes.status} ${await patchRes.text()}`
          );
        }
        return { id: existingId, ok: true, provider: this.id };
      }
    }

    throw new Error(
      `HubSpot contact create failed: ${createRes.status} ${await createRes.text()}`
    );
  }

  private async findByEmail(email: string): Promise<string | null> {
    const res = await fetch(
      `${this.baseUrl}/crm/v3/objects/contacts/search`,
      {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                { propertyName: 'email', operator: 'EQ', value: email }
              ]
            }
          ],
          limit: 1
        })
      }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as HubspotSearchResponse;
    return json.results[0]?.id ?? null;
  }
}

export function createHubspotProvider(env: NodeJS.ProcessEnv = process.env) {
  if (!env.HUBSPOT_API_KEY) return null;
  return new HubspotProvider({ apiKey: env.HUBSPOT_API_KEY });
}
