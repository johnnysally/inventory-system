import { db, dbRun } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function initDatabase() {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Create users table (only if it doesn't exist)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('Admin', 'Staff')) NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Create inventory_items table (only if it doesn't exist)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS inventory_items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        department TEXT CHECK(department IN ('Electrical', 'Plumbing', 'General Construction')) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        min_threshold INTEGER NOT NULL DEFAULT 10,
        specification TEXT,
        unit TEXT DEFAULT 'units',
        date_added TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Add unit column if it doesn't exist (for existing databases)
    try {
      await dbRun(`ALTER TABLE inventory_items ADD COLUMN unit TEXT DEFAULT 'units'`);
    } catch (error: any) {
      // Column might already exist, ignore error
      if (!error.message?.includes('duplicate column')) {
        console.error('Error adding unit column:', error);
      }
    };

    // Create transactions table (only if it doesn't exist)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        item_id TEXT NOT NULL,
        item_name TEXT NOT NULL,
        type TEXT CHECK(type IN ('Stock In', 'Stock Out')) NOT NULL,
        quantity INTEGER NOT NULL,
        department TEXT NOT NULL,
        user_id TEXT,
        user TEXT,
        date TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    console.log('✅ Database schema verified');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// Function to reset database (drops and recreates all tables)
export async function resetDatabase() {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Drop existing tables
    const tables = ['transactions', 'inventory_items', 'users'];
    for (const table of tables) {
      await dbRun(`DROP TABLE IF EXISTS ${table}`);
    }

    // Create users table
    await dbRun(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('Admin', 'Staff')) NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Create inventory_items table
    await dbRun(`
      CREATE TABLE inventory_items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        department TEXT CHECK(department IN ('Electrical', 'Plumbing', 'General Construction')) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        min_threshold INTEGER NOT NULL DEFAULT 10,
        specification TEXT,
        unit TEXT DEFAULT 'units',
        date_added TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Create transactions table
    await dbRun(`
      CREATE TABLE transactions (
        id TEXT PRIMARY KEY,
        item_id TEXT NOT NULL,
        item_name TEXT NOT NULL,
        type TEXT CHECK(type IN ('Stock In', 'Stock Out')) NOT NULL,
        quantity INTEGER NOT NULL,
        department TEXT NOT NULL,
        user_id TEXT,
        user TEXT,
        date TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    console.log('✅ Database schema reset');
  } catch (error) {
    console.error('Database reset failed:', error);
    throw error;
  }
}
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase()
    .then(() => {
      console.log('Database initialized successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}
