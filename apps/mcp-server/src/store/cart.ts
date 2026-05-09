import type { Cart, CartItem } from '@conversokit/shared';
import {
  createSupabaseStores,
  type CartStore
} from '@conversokit/integrations';

export type { CartStore };

export class InMemoryCartStore implements CartStore {
  private store = new Map<string, Cart>();

  async get(sessionId: string): Promise<Cart> {
    return this.store.get(sessionId) ?? { items: [], currency: 'USD' };
  }
  async set(sessionId: string, cart: Cart): Promise<void> {
    this.store.set(sessionId, cart);
  }
  async clear(sessionId: string): Promise<void> {
    this.store.delete(sessionId);
  }
}

export function cartHash(items: CartItem[]): string {
  const norm = items
    .map((i) => `${i.id}:${i.quantity}`)
    .sort()
    .join('|');
  let h = 0;
  for (let i = 0; i < norm.length; i++) {
    h = (h * 31 + norm.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

const supa = createSupabaseStores(process.env);
export const defaultCartStore: CartStore = supa?.cart ?? new InMemoryCartStore();
