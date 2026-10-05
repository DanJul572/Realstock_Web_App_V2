// Web: backed by localStorage. Android/iOS use storage.ts (expo-secure-store).
const storage = {
  async getItem(key: string): Promise<string | null> {
    return globalThis.localStorage?.getItem(key) ?? null;
  },
  async setItem(key: string, value: string): Promise<void> {
    globalThis.localStorage?.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    globalThis.localStorage?.removeItem(key);
  },
};

export const storageKeys = {
  name: 'name',
  roleId: 'role_id',
  token: 'token',
} as const;

export default storage;
