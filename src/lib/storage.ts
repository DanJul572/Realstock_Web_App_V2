import * as SecureStore from 'expo-secure-store';

// Android/iOS: the session is kept in the device keychain / keystore.
// Web uses storage.web.ts (localStorage). Keys may only contain letters,
// digits, ".", "-" and "_".
const storage = {
  getItem(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },
  setItem(key: string, value: string): Promise<void> {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem(key: string): Promise<void> {
    return SecureStore.deleteItemAsync(key);
  },
};

export const storageKeys = {
  name: 'name',
  roleId: 'role_id',
  token: 'token',
} as const;

export default storage;
