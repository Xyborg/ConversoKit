import type {
  Cart,
  LeadSubmission,
  Reservation
} from '@conversokit/shared';

export interface CartStore {
  get(sessionId: string): Promise<Cart>;
  set(sessionId: string, cart: Cart): Promise<void>;
  clear(sessionId: string): Promise<void>;
}

export interface OrderRecord {
  id: string;
  sessionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed';
  rawEventType: string;
  createdAt: string;
}

export interface OrderStore {
  put(order: OrderRecord): Promise<void>;
  list(): Promise<OrderRecord[]>;
}

export interface ReservationStore {
  put(reservation: Reservation): Promise<void>;
  get(id: string): Promise<Reservation | undefined>;
  cancel(id: string): Promise<Reservation | undefined>;
  list(): Promise<Reservation[]>;
}

export interface LeadStore {
  put(lead: LeadSubmission & { id: string }): Promise<void>;
  list(): Promise<Array<LeadSubmission & { id: string }>>;
}

export interface UserDataExport {
  userId: string;
  records: Record<string, unknown>;
  exportedAt: string;
}

export interface UserDataStore {
  put(userId: string, key: string, value: unknown): Promise<void>;
  export(userId: string): Promise<UserDataExport>;
  remove(userId: string): Promise<void>;
}

export interface ConversoKitStores {
  cart: CartStore;
  orders: OrderStore;
  reservations: ReservationStore;
  leads: LeadStore;
  userData: UserDataStore;
}
