import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  Cart,
  LeadSubmission,
  Reservation
} from '@conversokit/shared';
import type {
  CartStore,
  ConversoKitStores,
  LeadStore,
  OrderRecord,
  OrderStore,
  ReservationStore,
  UserDataExport,
  UserDataStore
} from './stores.js';

export interface SupabaseStoresOptions {
  client: SupabaseClient;
  /** Schema name; default 'public'. */
  schema?: string;
  /** Table name overrides. Default: ck_carts, ck_orders, ck_reservations, ck_leads, ck_userdata. */
  tables?: {
    cart?: string;
    orders?: string;
    reservations?: string;
    leads?: string;
    userData?: string;
  };
}

export class SupabaseCartStore implements CartStore {
  constructor(private client: SupabaseClient, private table: string) {}
  async get(sessionId: string): Promise<Cart> {
    const { data, error } = await this.client
      .from(this.table)
      .select('cart')
      .eq('session_id', sessionId)
      .maybeSingle();
    if (error) throw error;
    return (
      (data?.cart as Cart | undefined) ?? { items: [], currency: 'USD' }
    );
  }
  async set(sessionId: string, cart: Cart): Promise<void> {
    const { error } = await this.client
      .from(this.table)
      .upsert({ session_id: sessionId, cart, updated_at: new Date().toISOString() });
    if (error) throw error;
  }
  async clear(sessionId: string): Promise<void> {
    const { error } = await this.client
      .from(this.table)
      .delete()
      .eq('session_id', sessionId);
    if (error) throw error;
  }
}

export class SupabaseOrderStore implements OrderStore {
  constructor(private client: SupabaseClient, private table: string) {}
  async put(order: OrderRecord): Promise<void> {
    const { error } = await this.client.from(this.table).upsert({
      id: order.id,
      session_id: order.sessionId,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      raw_event_type: order.rawEventType,
      created_at: order.createdAt
    });
    if (error) throw error;
  }
  async list(): Promise<OrderRecord[]> {
    const { data, error } = await this.client
      .from(this.table)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id),
      sessionId: String(row.session_id),
      amount: Number(row.amount),
      currency: String(row.currency),
      status: row.status as OrderRecord['status'],
      rawEventType: String(row.raw_event_type),
      createdAt: String(row.created_at)
    }));
  }
}

export class SupabaseReservationStore implements ReservationStore {
  constructor(private client: SupabaseClient, private table: string) {}
  async put(reservation: Reservation): Promise<void> {
    const { error } = await this.client
      .from(this.table)
      .upsert({ id: reservation.id, payload: reservation });
    if (error) throw error;
  }
  async get(id: string): Promise<Reservation | undefined> {
    const { data, error } = await this.client
      .from(this.table)
      .select('payload')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return (data?.payload as Reservation | undefined) ?? undefined;
  }
  async cancel(id: string): Promise<Reservation | undefined> {
    const existing = await this.get(id);
    if (!existing) return undefined;
    const next: Reservation = { ...existing, status: 'cancelled' };
    await this.put(next);
    return next;
  }
  async list(): Promise<Reservation[]> {
    const { data, error } = await this.client.from(this.table).select('payload');
    if (error) throw error;
    return (data ?? []).map((row) => row.payload as Reservation);
  }
}

export class SupabaseLeadStore implements LeadStore {
  constructor(private client: SupabaseClient, private table: string) {}
  async put(lead: LeadSubmission & { id: string }): Promise<void> {
    const { error } = await this.client
      .from(this.table)
      .upsert({ id: lead.id, payload: lead, submitted_at: lead.submittedAt });
    if (error) throw error;
  }
  async list(): Promise<Array<LeadSubmission & { id: string }>> {
    const { data, error } = await this.client
      .from(this.table)
      .select('payload')
      .order('submitted_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(
      (row) => row.payload as LeadSubmission & { id: string }
    );
  }
}

export class SupabaseUserDataStore implements UserDataStore {
  constructor(private client: SupabaseClient, private table: string) {}
  async put(userId: string, key: string, value: unknown): Promise<void> {
    const { error } = await this.client
      .from(this.table)
      .upsert({ user_id: userId, key, value, updated_at: new Date().toISOString() });
    if (error) throw error;
  }
  async export(userId: string): Promise<UserDataExport> {
    const { data, error } = await this.client
      .from(this.table)
      .select('key, value')
      .eq('user_id', userId);
    if (error) throw error;
    const records: Record<string, unknown> = {};
    for (const row of data ?? []) {
      records[String(row.key)] = row.value;
    }
    return {
      userId,
      records,
      exportedAt: new Date().toISOString()
    };
  }
  async remove(userId: string): Promise<void> {
    const { error } = await this.client
      .from(this.table)
      .delete()
      .eq('user_id', userId);
    if (error) throw error;
  }
}

export function createSupabaseStores(
  env: NodeJS.ProcessEnv = process.env,
  overrides: Partial<SupabaseStoresOptions> = {}
): ConversoKitStores | null {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  const client =
    overrides.client ??
    createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });
  const tables = {
    cart: 'ck_carts',
    orders: 'ck_orders',
    reservations: 'ck_reservations',
    leads: 'ck_leads',
    userData: 'ck_userdata',
    ...overrides.tables
  };
  return {
    cart: new SupabaseCartStore(client, tables.cart),
    orders: new SupabaseOrderStore(client, tables.orders),
    reservations: new SupabaseReservationStore(client, tables.reservations),
    leads: new SupabaseLeadStore(client, tables.leads),
    userData: new SupabaseUserDataStore(client, tables.userData)
  };
}

export const SUPABASE_SCHEMA_SQL = `-- Run in Supabase SQL editor to create the ConversoKit tables.
create table if not exists ck_carts (
  session_id text primary key,
  cart jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists ck_orders (
  id text primary key,
  session_id text not null,
  amount integer not null default 0,
  currency text not null default 'usd',
  status text not null,
  raw_event_type text not null,
  created_at timestamptz not null default now()
);

create table if not exists ck_reservations (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists ck_leads (
  id text primary key,
  payload jsonb not null,
  submitted_at timestamptz not null default now()
);

create table if not exists ck_userdata (
  user_id text not null,
  key text not null,
  value jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);
`;
