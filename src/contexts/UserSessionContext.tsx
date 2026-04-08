import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { userApi } from '../domain/user/api';
import type { User, UserCreate, UserLogin } from '../domain/user/types';

interface UserSessionContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (credentials: UserLogin) => Promise<void>;
  signup: (payload: UserCreate) => Promise<void>;
  logout: () => Promise<void>;
}

const UserSessionContext = createContext<UserSessionContextType | undefined>(undefined);

export function UserSessionProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate session by verifying the HttpOnly cookie with the backend
  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const user = await userApi.getCurrentUser();
        setCurrentUser(user);
      } catch (e) {
        // expected if no active JWT session cookie
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    void hydrateSession();
  }, []);

  const login = useCallback(async (credentials: UserLogin) => {
    const user = await userApi.loginUser(credentials);
    setCurrentUser(user);
  }, []);

  const signup = useCallback(async (payload: UserCreate) => {
    await userApi.createUser(payload);
    // Explicitly login the user internally if createUser doesn't set a cookie itself.
    // wait, we modified createUser to be normal registration. We should probably
    // call login right after creation so the cookie gets set.
    const loggedInUser = await userApi.loginUser({
      email: payload.email,
      password: payload.password
    });
    setCurrentUser(loggedInUser);
  }, []);

  const logout = useCallback(async () => {
    await userApi.logoutUser();
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
