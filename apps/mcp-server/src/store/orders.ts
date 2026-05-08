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

export class InMemoryOrderStore implements OrderStore {
  private orders: OrderRecord[] = [];
  async put(order: OrderRecord): Promise<void> {
    this.orders.unshift(order);
  }
  async list(): Promise<OrderRecord[]> {
    return [...this.orders];
  }
}

export const defaultOrderStore = new InMemoryOrderStore();
