import { dbGet, dbAll, dbRun } from '../utils/db.js';
import { v4 as uuidv4 } from 'uuid';

export interface Transaction {
  id: string;
  itemId: string;
  itemName: string;
  type: 'Stock In' | 'Stock Out';
  quantity: number;
  department: 'Electrical' | 'Plumbing' | 'General Construction';
  userId?: string;
  user: string;
  date: string;
  notes?: string;
  created_at: string;
}

export class TransactionModel {
  static async getAll(department?: string, limit?: number, offset?: number): Promise<Transaction[]> {
    let sql = 'SELECT * FROM transactions';
    const params: any[] = [];
    
    if (department) {
      sql += ' WHERE department = ?';
      params.push(department);
    }
    
    sql += ' ORDER BY date DESC, created_at DESC';
    
    if (limit) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(limit, offset || 0);
    }
    
    const rows = await dbAll(sql, params);
    return rows.map(row => this.formatRow(row));
  }

  static async getByItemId(itemId: string): Promise<Transaction[]> {
    const rows = await dbAll('SELECT * FROM transactions WHERE item_id = ? ORDER BY date DESC', [itemId]);
    return rows.map(row => this.formatRow(row));
  }

  static async create(
    itemId: string,
    itemName: string,
    type: 'Stock In' | 'Stock Out',
    quantity: number,
    department: 'Electrical' | 'Plumbing' | 'General Construction',
    user: string,
    userId?: string,
    notes?: string
  ): Promise<Transaction> {
    const id = `t${Date.now()}`;
    const now = new Date().toISOString();
    const date = now.split('T')[0];
    
    await dbRun(
      `INSERT INTO transactions (id, item_id, item_name, type, quantity, department, user_id, user, date, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, itemId, itemName, type, quantity, department, userId || null, user, date, notes || null, now]
    );
    
    return { id, itemId, itemName, type, quantity, department, userId, user, date, notes, created_at: now };
  }

  static async getStats(department?: string): Promise<{ stockIn: number; stockOut: number; totalTransactions: number }> {
    const params = department ? [department, department, department] : [];
    const whereClause = department ? ' WHERE department = ?' : '';
    
    const stockInRow = await dbGet(
      `SELECT SUM(quantity) as total FROM transactions WHERE type = 'Stock In'${department ? ' AND department = ?' : ''}`,
      department ? [department] : []
    );
    
    const stockOutRow = await dbGet(
      `SELECT SUM(quantity) as total FROM transactions WHERE type = 'Stock Out'${department ? ' AND department = ?' : ''}`,
      department ? [department] : []
    );
    
    const countRow = await dbGet(
      `SELECT COUNT(*) as count FROM transactions${whereClause}`,
      department ? [department] : []
    );
    
    return {
      stockIn: stockInRow?.total || 0,
      stockOut: stockOutRow?.total || 0,
      totalTransactions: countRow?.count || 0,
    };
  }

  private static formatRow(row: any): Transaction {
    return {
      id: row.id,
      itemId: row.item_id,
      itemName: row.item_name,
      type: row.type,
      quantity: row.quantity,
      department: row.department,
      userId: row.user_id,
      user: row.user,
      date: row.date,
      notes: row.notes,
      created_at: row.created_at,
    };
  }
}
