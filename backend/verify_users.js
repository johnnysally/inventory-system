import Database from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, './data/inventory.db');

const db = new Database.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    db.all('SELECT id, name, email, role FROM users', (err, rows) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Users in database:');
        rows.forEach(u => console.log(`  - ${u.name} (${u.email}) - Role: ${u.role}`));
      }
      db.close();
      process.exit(0);
    });
  }
});
