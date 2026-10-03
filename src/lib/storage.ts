// Web-first: backed by localStorage. Swap the implementation for
// expo-secure-store when the app targets Android/iOS.
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
