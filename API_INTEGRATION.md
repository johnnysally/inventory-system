# API Integration Guide

## Connecting Frontend to Backend

### 1. Environment Configuration

Update your frontend `.env` file (create if doesn't exist):

```env
VITE_API_URL=http://localhost:5000/api
```

### 2. API Service Layer

Create a new file `src/services/api.ts` in your frontend:

```typescript
import axios, { AxiosInstance } from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 3. Update useAuth Hook

Replace the mock authentication in `src/hooks/useAuth.tsx`:

```typescript
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User } from "@/types/inventory";
import api from "@/services/api";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists and validate
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
```

### 4. Update useInventory Hook

Replace the mock data in `src/hooks/useInventory.tsx`:

```typescript
import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { InventoryItem, Transaction } from "@/types/inventory";
import api from "@/services/api";

interface InventoryContextType {
  items: InventoryItem[];
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  addItem: (item: Omit<InventoryItem, "id" | "dateAdded">) => Promise<void>;
  updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  stockIn: (itemId: string, qty: number, notes?: string) => Promise<void>;
  stockOut: (itemId: string, qty: number, notes?: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      setLoading(true);
      const [itemsRes, txRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/transactions'),
      ]);
      setItems(itemsRes.data);
      setTransactions(txRes.data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addItem = async (item: Omit<InventoryItem, "id" | "dateAdded">) => {
    await api.post('/inventory', item);
    await refreshData();
  };

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    await api.put(`/inventory/${id}`, updates);
    await refreshData();
  };

  const deleteItem = async (id: string) => {
    await api.delete(`/inventory/${id}`);
    await refreshData();
  };

  const stockIn = async (itemId: string, qty: number, notes?: string) => {
    await api.post('/transactions/stock-in', { itemId, quantity: qty, notes });
    await refreshData();
  };

  const stockOut = async (itemId: string, qty: number, notes?: string) => {
    await api.post('/transactions/stock-out', { itemId, quantity: qty, notes });
    await refreshData();
  };

  return (
    <InventoryContext.Provider value={{ items, transactions, loading, error, addItem, updateItem, deleteItem, stockIn, stockOut, refreshData }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be used within InventoryProvider");
  return ctx;
}
```

### 5. Install Axios in Frontend

```bash
npm install axios
```

### 6. Running Both Frontend and Backend

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run db:init
npm run db:seed
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Frontend will be at `http://localhost:5173`
Backend will be at `http://localhost:5000`

## API Response Examples

### Login
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "u1",
    "name": "John Kamau",
    "email": "john@buildtrack.co",
    "role": "Admin",
    "createdAt": "2024-01-15"
  }
}
```

### Get Inventory Items
```json
[
  {
    "id": "i1",
    "name": "Copper Wire 2.5mm",
    "department": "Electrical",
    "quantity": 450,
    "minThreshold": 100,
    "specification": "2.5mm single core...",
    "dateAdded": "2024-08-12",
    "created_at": "2024-08-12T...",
    "updated_at": "2024-08-12T..."
  }
]
```

### Create Transaction
```json
{
  "id": "t1234567",
  "itemId": "i1",
  "itemName": "Copper Wire 2.5mm",
  "type": "Stock In",
  "quantity": 100,
  "department": "Electrical",
  "user": "john@buildtrack.co",
  "date": "2025-03-04",
  "notes": "Supplier delivery",
  "created_at": "2025-03-04T..."
}
```

## Security Considerations

1. ✅ JWT tokens stored in localStorage (consider httpOnly cookies for production)
2. ✅ Password hashing with bcryptjs
3. ✅ Role-based access control
4. ✅ CORS configured
5. 🔐 Add in production:
   - HTTPS only
   - Rate limiting
   - Input validation/sanitization
   - SQL injection protection (already handled by parameterized queries)
   - CSRF protection
   - API key rotation
