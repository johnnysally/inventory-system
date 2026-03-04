import { dbGet, dbAll, dbRun } from '../utils/db.js';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'Admin' | 'Staff';
  created_at: string;
  updated_at: string;
}

export class UserModel {
  static async findById(id: string): Promise<User | undefined> {
    return dbGet('SELECT * FROM users WHERE id = ?', [id]);
  }

  static async findByEmail(email: string): Promise<User | undefined> {
    return dbGet('SELECT * FROM users WHERE email = ?', [email]);
  }

  static async getAll(): Promise<any[]> {
    const users = await dbAll('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at
    }));
  }

  static async create(name: string, email: string, password: string, role: 'Admin' | 'Staff'): Promise<User> {
    const id = uuidv4();
    const now = new Date().toISOString();
    await dbRun(
      'INSERT INTO users (id, name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, email, password, role, now, now]
    );
    return { id, name, email, password, role, created_at: now, updated_at: now };
  }

  static async update(id: string, updates: Partial<Omit<User, 'id' | 'created_at'>>): Promise<void> {
    const now = new Date().toISOString();
    const fields = Object.keys(updates)
      .filter(key => key !== 'created_at')
      .map(key => `${key} = ?`);
    const values = Object.values(updates).filter(v => v !== undefined);
    
    if (fields.length === 0) return;
    
    await dbRun(
      `UPDATE users SET ${fields.join(', ')}, updated_at = ? WHERE id = ?`,
      [...values, now, id]
    );
  }

  static async delete(id: string): Promise<void> {
    await dbRun('DELETE FROM users WHERE id = ?', [id]);
  }
}
