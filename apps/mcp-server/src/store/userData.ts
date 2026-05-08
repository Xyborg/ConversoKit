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

export class InMemoryUserDataStore implements UserDataStore {
  private data = new Map<string, Map<string, unknown>>();

  async put(userId: string, key: string, value: unknown): Promise<void> {
    if (!this.data.has(userId)) this.data.set(userId, new Map());
    this.data.get(userId)!.set(key, value);
  }

  async export(userId: string): Promise<UserDataExport> {
    const records = Object.fromEntries(this.data.get(userId) ?? new Map());
    return {
      userId,
      records,
      exportedAt: new Date().toISOString()
    };
  }

  async remove(userId: string): Promise<void> {
    this.data.delete(userId);
  }
}

export const defaultUserDataStore = new InMemoryUserDataStore();
