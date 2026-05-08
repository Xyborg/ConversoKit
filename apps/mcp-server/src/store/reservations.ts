import type { Reservation } from '@conversokit/shared';

export interface ReservationStore {
  put(reservation: Reservation): Promise<void>;
  get(id: string): Promise<Reservation | undefined>;
  cancel(id: string): Promise<Reservation | undefined>;
  list(): Promise<Reservation[]>;
}

export class InMemoryReservationStore implements ReservationStore {
  private records = new Map<string, Reservation>();

  async put(reservation: Reservation): Promise<void> {
    this.records.set(reservation.id, reservation);
  }
  async get(id: string): Promise<Reservation | undefined> {
    return this.records.get(id);
  }
  async cancel(id: string): Promise<Reservation | undefined> {
    const existing = this.records.get(id);
    if (!existing) return undefined;
    const next: Reservation = { ...existing, status: 'cancelled' };
    this.records.set(id, next);
    return next;
  }
  async list(): Promise<Reservation[]> {
    return Array.from(this.records.values());
  }
}

export const defaultReservationStore = new InMemoryReservationStore();
