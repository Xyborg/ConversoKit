import type { LeadSubmission } from '@conversokit/shared';
import {
  createSupabaseStores,
  type LeadStore
} from '@conversokit/integrations';

export type { LeadStore };

export class InMemoryLeadStore implements LeadStore {
  private leads: Array<LeadSubmission & { id: string }> = [];
  async put(lead: LeadSubmission & { id: string }): Promise<void> {
    this.leads.unshift(lead);
  }
  async list(): Promise<Array<LeadSubmission & { id: string }>> {
    return [...this.leads];
  }
}

const supa = createSupabaseStores(process.env);
export const defaultLeadStore: LeadStore =
  supa?.leads ?? new InMemoryLeadStore();
