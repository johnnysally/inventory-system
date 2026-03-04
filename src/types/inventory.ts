export type Department = "Electrical" | "Plumbing" | "General Construction";

export type UserRole = "Admin" | "Staff";

export type Unit = "units" | "metres" | "litres" | "kgs";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  department: Department;
  quantity: number;
  minThreshold: number;
  specification: string;
  dateAdded: string;
  unit?: Unit;
}

export interface Transaction {
  id: string;
  itemId: string;
  itemName: string;
  type: "Stock In" | "Stock Out";
  quantity: number;
  department: Department;
  user: string;
  date: string;
  notes?: string;
}

export const DEPARTMENTS: Department[] = ["Electrical", "Plumbing", "General Construction"];

export const UNITS: Unit[] = ["units", "metres", "litres", "kgs"];
