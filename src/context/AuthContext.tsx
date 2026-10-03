import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { setUnauthorizedHandler } from '@/lib/request';
import storage, { storageKeys } from '@/lib/storage';
import { LoginResponseType } from '@/types';

type SessionType = {
  name: string;
  roleId: number;
  token: string;
};

type AuthContextType = {
  isAdmin: boolean;
  isLoading: boolean;
  session: SessionType | null;
  signIn: (response: LoginResponseType) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const clearStorage = () =>
  Promise.all([
    storage.removeItem(storageKeys.name),
    storage.removeItem(storageKeys.roleId),
    storage.removeItem(storageKeys.token),
  ]);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<SessionType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signIn = async (response: LoginResponseType) => {
    await Promise.all([
      storage.setItem(storageKeys.name, response.user.name),
      storage.setItem(storageKeys.roleId, response.user.role_id.toString()),
      storage.setItem(storageKeys.token, response.token),
    ]);
    setSession({
      name: response.user.name,
      roleId: response.user.role_id,
      token: response.token,
    });
  };

  const signOut = async () => {
    await clearStorage();
    setSession(null);
  };

  useEffect(() => {
    const restoreSession = async () => {
      const [name, roleId, token] = await Promise.all([
        storage.getItem(storageKeys.name),
        storage.getItem(storageKeys.roleId),
        storage.getItem(storageKeys.token),
      ]);
      if (token) {
        setSession({ name: name ?? '', roleId: Number(roleId), token });
      }
      setIsLoading(false);
    };
    restoreSession();

    setUnauthorizedHandler(() => {
      clearStorage().then(() => setSession(null));
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAdmin: session?.roleId === 1,
        isLoading,
        session,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
