import {
  createSupabaseStores,
  type OrderRecord,
  type OrderStore
} from '@conversokit/integrations';

export type { OrderRecord, OrderStore };

export class InMemoryOrderStore implements OrderStore {
  private orders: OrderRecord[] = [];
  async put(order: OrderRecord): Promise<void> {
    this.orders.unshift(order);
  }
  async list(): Promise<OrderRecord[]> {
    return [...this.orders];
  }
}

const supa = createSupabaseStores(process.env);
export const defaultOrderStore: OrderStore =
  supa?.orders ?? new InMemoryOrderStore();
