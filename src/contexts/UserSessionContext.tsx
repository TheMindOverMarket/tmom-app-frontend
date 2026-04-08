import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { userApi } from '../domain/user/api';
import type { User } from '../domain/user/types';

const SESSION_STORAGE_KEY = 'tmom:selected-user-id';

interface UserSessionContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  signup: (email: string) => Promise<void>;
  logout: () => void;
}

const UserSessionContext = createContext<UserSessionContextType | undefined>(undefined);

export function UserSessionProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate session on mount
  useEffect(() => {
    const hydrateSession = async () => {
      const storedId = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!storedId) {
        setIsLoading(false);
        return;
      }
      try {
        const user = await userApi.getUserById(storedId);
        setCurrentUser(user);
      } catch (e) {
        console.warn('Failed to hydrate session, clearing state', e);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };
    
    void hydrateSession();
  }, []);

  const login = useCallback(async (email: string) => {
    const user = await userApi.loginUser({ email });
    sessionStorage.setItem(SESSION_STORAGE_KEY, user.id);
    setCurrentUser(user);
  }, []);

  const signup = useCallback(async (email: string) => {
    const user = await userApi.createUser({ email });
    sessionStorage.setItem(SESSION_STORAGE_KEY, user.id);
    setCurrentUser(user);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setCurrentUser(null);
  }, []);

  return (
    <UserSessionContext.Provider
      value={{
        currentUser,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </UserSessionContext.Provider>
  );
}

export function useUserSession() {
  const context = useContext(UserSessionContext);
  if (!context) {
    throw new Error('useUserSession must be used within a UserSessionProvider');
  }

  return context;
}
