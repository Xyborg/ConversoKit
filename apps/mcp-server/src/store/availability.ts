import { EXAMPLE_AVAILABILITY, type Availability } from '@conversokit/shared';

export interface AvailabilityStore {
  get(resourceId: string, from: string, to: string): Promise<Availability[]>;
}

export class InMemoryAvailabilityStore implements AvailabilityStore {
  private byResource = new Map<string, Availability[]>();

  constructor(seed: Availability[] = [EXAMPLE_AVAILABILITY]) {
    for (const a of seed) {
      const existing = this.byResource.get(a.resourceId) ?? [];
      existing.push(a);
      this.byResource.set(a.resourceId, existing);
    }
  }

  async get(resourceId: string, from: string, to: string): Promise<Availability[]> {
    const all = this.byResource.get(resourceId) ?? [];
    return all.filter((a) => a.date >= from && a.date <= to);
  }
}

export const defaultAvailabilityStore = new InMemoryAvailabilityStore();
