import { dbGet, dbAll, dbRun } from '../utils/db.js';
import { v4 as uuidv4 } from 'uuid';

export interface InventoryItem {
  id: string;
  name: string;
  department: 'Electrical' | 'Plumbing' | 'General Construction';
  quantity: number;
  minThreshold: number;
  specification: string;
  dateAdded: string;
  unit?: string;
  created_at: string;
  updated_at: string;
}

export class InventoryItemModel {
  static async findById(id: string): Promise<InventoryItem | undefined> {
    const row = await dbGet('SELECT * FROM inventory_items WHERE id = ?', [id]);
    return row ? this.formatRow(row) : undefined;
  }

  static async getAll(department?: string): Promise<InventoryItem[]> {
    const sql = department
      ? 'SELECT * FROM inventory_items WHERE department = ? ORDER BY name ASC'
      : 'SELECT * FROM inventory_items ORDER BY name ASC';
    const params = department ? [department] : [];
    const rows = await dbAll(sql, params);
    return rows.map(row => this.formatRow(row));
  }

  static async search(term: string, department?: string): Promise<InventoryItem[]> {
    let sql = `SELECT * FROM inventory_items WHERE (name LIKE ? OR specification LIKE ?)`;
    const params = [`%${term}%`, `%${term}%`];
    
    if (department) {
      sql += ' AND department = ?';
      params.push(department);
    }
    
    sql += ' ORDER BY name ASC';
    const rows = await dbAll(sql, params);
    return rows.map(row => this.formatRow(row));
  }

  static async create(
    name: string,
    department: 'Electrical' | 'Plumbing' | 'General Construction',
    quantity: number,
    minThreshold: number,
    specification: string,
    unit?: string
  ): Promise<InventoryItem> {
    const id = `i${Date.now()}`;
    const now = new Date().toISOString();
    const dateAdded = now.split('T')[0];
    
    await dbRun(
      `INSERT INTO inventory_items (id, name, department, quantity, min_threshold, specification, date_added, unit, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, department, quantity, minThreshold, specification, dateAdded, unit || 'units', now, now]
    );
    
    return { id, name, department, quantity, minThreshold, specification, dateAdded, unit: unit || 'units', created_at: now, updated_at: now };
  }

  static async update(id: string, updates: Partial<Omit<InventoryItem, 'id' | 'created_at'>>): Promise<void> {
    const now = new Date().toISOString();
    const dbUpdates: Record<string, any> = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.department !== undefined) dbUpdates.department = updates.department;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.minThreshold !== undefined) dbUpdates.min_threshold = updates.minThreshold;
    if (updates.specification !== undefined) dbUpdates.specification = updates.specification;
    if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
    
    const fields = Object.keys(dbUpdates).map(key => `${key} = ?`);
    const values = Object.values(dbUpdates);
    
    if (fields.length === 0) return;
    
    await dbRun(
      `UPDATE inventory_items SET ${fields.join(', ')}, updated_at = ? WHERE id = ?`,
      [...values, now, id]
    );
  }

  static async delete(id: string): Promise<void> {
    await dbRun('DELETE FROM inventory_items WHERE id = ?', [id]);
  }

  private static formatRow(row: any): InventoryItem {
    return {
      id: row.id,
      name: row.name,
      department: row.department,
      quantity: row.quantity,
      minThreshold: row.min_threshold,
      specification: row.specification,
      dateAdded: row.date_added,
      unit: row.unit || 'units',
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
