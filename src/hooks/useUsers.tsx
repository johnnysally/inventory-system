import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User } from "@/types/inventory";
import api from "@/services/api";

interface UsersContextType {
  users: User[];
  loading: boolean;
  error: string | null;
  addUser: (user: Omit<User, "id" | "createdAt">) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const UsersContext = createContext<UsersContextType | null>(null);

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/users');
      setUsers(response.data);
      console.log('✅ Users loaded:', response.data.length);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
      console.error('❌ Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load users on mount
  useEffect(() => {
    refreshUsers();
  }, []);

  const addUser = async (user: Omit<User, "id" | "createdAt">) => {
    try {
      await api.post('/users', user);
      await refreshUsers();
    } catch (err) {
      console.error('Failed to add user:', err);
      throw err;
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      await api.put(`/users/${id}`, updates);
      await refreshUsers();
    } catch (err) {
      console.error('Failed to update user:', err);
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      await refreshUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
      throw err;
    }
  };

  return (
    <UsersContext.Provider value={{ users, loading, error, addUser, updateUser, deleteUser, refreshUsers }}>
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers() {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsers must be used within UsersProvider");
  return ctx;
}
