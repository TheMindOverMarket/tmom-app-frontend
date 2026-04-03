import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { userApi } from '../domain/user/api';
import type { User } from '../domain/user/types';

const SESSION_STORAGE_KEY = 'tmom:selected-user-id';

interface UserSessionContextType {
  currentUser: User | null;
  users: User[];
  isLoadingUsers: boolean;
  selectUserById: (userId: string) => Promise<void>;
  createAndSelectUser: (email: string) => Promise<User>;
  refreshUsers: () => Promise<void>;
  clearSelectedUser: () => void;
}

const UserSessionContext = createContext<UserSessionContextType | undefined>(undefined);

export function UserSessionProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const refreshUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const fetchedUsers = await userApi.listUsers();
      setUsers(fetchedUsers);

      const selectedUserId = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!selectedUserId) {
        setCurrentUser(null);
        return;
      }

      const matchedUser = fetchedUsers.find(user => user.id === selectedUserId) || null;
      setCurrentUser(matchedUser);

      if (!matchedUser) {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    void refreshUsers();
  }, [refreshUsers]);

  const selectUserById = useCallback(async (userId: string) => {
    const matchedUser = users.find(user => user.id === userId);
    if (matchedUser) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, matchedUser.id);
      setCurrentUser(matchedUser);
      return;
    }

    const freshUsers = await userApi.listUsers();
    setUsers(freshUsers);
    const freshMatch = freshUsers.find(user => user.id === userId);
    if (!freshMatch) {
      throw new Error('Selected user could not be found');
    }

    sessionStorage.setItem(SESSION_STORAGE_KEY, freshMatch.id);
    setCurrentUser(freshMatch);
  }, [users]);

  const createAndSelectUser = useCallback(async (email: string) => {
    // Temporary/dirty implementation: this is only a lightweight test harness,
    // not a real auth or identity flow.
    const newUser = await userApi.createUser({ email });
    const nextUsers = [newUser, ...users];
    setUsers(nextUsers);
    sessionStorage.setItem(SESSION_STORAGE_KEY, newUser.id);
    setCurrentUser(newUser);
    return newUser;
  }, [users]);

  const clearSelectedUser = useCallback(() => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setCurrentUser(null);
  }, []);

  return (
    <UserSessionContext.Provider
      value={{
        currentUser,
        users,
        isLoadingUsers,
        selectUserById,
        createAndSelectUser,
        refreshUsers,
        clearSelectedUser,
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
