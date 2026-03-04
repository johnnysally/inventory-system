import { createContext, useContext, useState, ReactNode, useEffect } from "react";
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
      setError(null);
      const [itemsRes, txRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/transactions'),
      ]);
      
      // Convert snake_case from API to camelCase for frontend
      const itemsData = itemsRes.data.map((item: any) => ({
        ...item,
        minThreshold: item.minThreshold,
        dateAdded: item.dateAdded,
      }));
      
      const txData = txRes.data.map((tx: any) => ({
        ...tx,
        itemId: tx.itemId,
        itemName: tx.itemName,
      }));
      
      setItems(itemsData);
      setTransactions(txData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    refreshData();
  }, []);

  const addItem = async (item: Omit<InventoryItem, "id" | "dateAdded">) => {
    try {
      await api.post('/inventory', item);
      await refreshData();
    } catch (err) {
      console.error('Failed to add item:', err);
      throw err;
    }
  };

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      await api.put(`/inventory/${id}`, updates);
      await refreshData();
    } catch (err) {
      console.error('Failed to update item:', err);
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await api.delete(`/inventory/${id}`);
      await refreshData();
    } catch (err) {
      console.error('Failed to delete item:', err);
      throw err;
    }
  };

  const stockIn = async (itemId: string, qty: number, notes?: string) => {
    try {
      await api.post('/transactions/stock-in', {
        itemId,
        quantity: qty,
        notes,
      });
      await refreshData();
    } catch (err) {
      console.error('Stock in failed:', err);
      throw err;
    }
  };

  const stockOut = async (itemId: string, qty: number, notes?: string) => {
    try {
      await api.post('/transactions/stock-out', {
        itemId,
        quantity: qty,
        notes,
      });
      await refreshData();
    } catch (err) {
      console.error('Stock out failed:', err);
      throw err;
    }
  };

  return (
    <InventoryContext.Provider 
      value={{ 
        items, 
        transactions, 
        loading, 
        error, 
        addItem, 
        updateItem, 
        deleteItem, 
        stockIn, 
        stockOut, 
        refreshData 
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be used within InventoryProvider");
  return ctx;
}
