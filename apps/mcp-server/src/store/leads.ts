import type { LeadSubmission } from '@conversokit/shared';

export interface LeadStore {
  put(lead: LeadSubmission & { id: string }): Promise<void>;
  list(): Promise<Array<LeadSubmission & { id: string }>>;
}

export class InMemoryLeadStore implements LeadStore {
  private leads: Array<LeadSubmission & { id: string }> = [];
  async put(lead: LeadSubmission & { id: string }): Promise<void> {
    this.leads.unshift(lead);
  }
  async list(): Promise<Array<LeadSubmission & { id: string }>> {
    return [...this.leads];
  }
}

export const defaultLeadStore = new InMemoryLeadStore();
