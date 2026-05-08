export interface CrmContact {
  email?: string;
  name?: string;
  company?: string;
  properties?: Record<string, string | number | boolean>;
}

export interface CrmUpsertResult {
  id: string;
  ok: boolean;
  provider: string;
}

export interface CrmProvider {
  id: string;
  upsertContact(contact: CrmContact): Promise<CrmUpsertResult>;
}

export class MockCrmProvider implements CrmProvider {
  id = 'mock';
  async upsertContact(contact: CrmContact): Promise<CrmUpsertResult> {
    return {
      id: `mock_${Math.random().toString(36).slice(2)}`,
      ok: true,
      provider: this.id
    };
  }
}
