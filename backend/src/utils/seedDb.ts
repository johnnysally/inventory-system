import { dbRun, dbGet } from './db.js';
import { resetDatabase } from './initDb.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const now = new Date().toISOString();

async function seedDatabase() {
  try {
    // Reset database schema first (drops and recreates tables)
    await resetDatabase();
    // Seed users
    const adminPassword = await bcrypt.hash('admin1234', 10);
    const devPassword = await bcrypt.hash('1234dev', 10);

    const user1Id = uuidv4();
    const devUserId = uuidv4();

    await dbRun(
      `INSERT INTO users (id, name, email, password, role, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user1Id, 'Capella_admin', 'admin@capellalodge', adminPassword, 'Admin', now, now]
    );

    await dbRun(
      `INSERT INTO users (id, name, email, password, role, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [devUserId, 'Developer', 'dev@admincapella', devPassword, 'Staff', now, now]
    );

    // Seed inventory items
    const items = [
      // Electrical
      { id: uuidv4(), name: 'Copper Wire 2.5mm', dept: 'Electrical', qty: 450, min: 100, spec: '2.5mm single core, PVC insulated, 100m roll, 450/750V rating', date: '2024-08-12' },
      { id: uuidv4(), name: 'MCB 20A Single Pole', dept: 'Electrical', qty: 35, min: 20, spec: '20 Amp miniature circuit breaker, single pole, C-curve, 6kA breaking capacity', date: '2024-09-03' },
      { id: uuidv4(), name: 'LED Panel Light 60x60', dept: 'Electrical', qty: 12, min: 15, spec: '60x60cm recessed panel, 40W, 4000K daylight, 3600 lumens, IP20', date: '2024-10-18' },
      { id: uuidv4(), name: 'Distribution Board 12-Way', dept: 'Electrical', qty: 8, min: 5, spec: '12-way TPN distribution board, surface mount, with busbar and neutral link', date: '2024-11-02' },
      { id: uuidv4(), name: 'PVC Conduit 20mm', dept: 'Electrical', qty: 200, min: 50, spec: '20mm rigid PVC conduit, 3m lengths, heavy gauge, flame retardant', date: '2024-07-20' },
      // Plumbing
      { id: uuidv4(), name: 'PPR Pipe 25mm', dept: 'Plumbing', qty: 85, min: 30, spec: '25mm PPR hot/cold water pipe, PN20, 4m length, green', date: '2024-08-05' },
      { id: uuidv4(), name: 'Gate Valve 1 inch', dept: 'Plumbing', qty: 18, min: 10, spec: '1 inch brass gate valve, threaded, 200 PSI WOG, lead-free', date: '2024-09-14' },
      { id: uuidv4(), name: 'Water Closet Complete', dept: 'Plumbing', qty: 4, min: 5, spec: 'Close-coupled WC, dual flush 3/6L, soft-close seat, S-trap 100mm', date: '2024-10-25' },
      { id: uuidv4(), name: 'Kitchen Sink Mixer', dept: 'Plumbing', qty: 7, min: 5, spec: 'Single lever kitchen mixer, chrome finish, swivel spout, ceramic cartridge', date: '2024-11-10' },
      { id: uuidv4(), name: 'HDPE Pipe 110mm', dept: 'Plumbing', qty: 25, min: 10, spec: '110mm HDPE drainage pipe, 6m length, SN4 ring stiffness', date: '2024-06-15' },
      // General Construction
      { id: uuidv4(), name: 'Portland Cement 50kg', dept: 'General Construction', qty: 120, min: 50, spec: 'OPC 42.5N, 50kg bag, KEBS certified, Bamburi brand', date: '2024-07-01' },
      { id: uuidv4(), name: 'Steel Rebar Y16', dept: 'General Construction', qty: 65, min: 30, spec: 'Y16 deformed bar, 12m length, BS4449 Grade 500B', date: '2024-08-20' },
      { id: uuidv4(), name: 'Roofing Sheet 3m', dept: 'General Construction', qty: 45, min: 20, spec: 'Box profile roofing sheet, 3m x 1m, gauge 28, Safal blue', date: '2024-09-28' },
      { id: uuidv4(), name: 'Building Sand (Ton)', dept: 'General Construction', qty: 8, min: 10, spec: 'River sand, clean washed, per metric ton, for plastering/masonry', date: '2024-10-05' },
      { id: uuidv4(), name: 'Timber 2x4 Cypress', dept: 'General Construction', qty: 180, min: 50, spec: '2x4 inch cypress, 12ft treated, kiln dried, structural grade', date: '2024-11-15' },
    ];

    for (const item of items) {
      await dbRun(
        `INSERT INTO inventory_items (id, name, department, quantity, min_threshold, specification, date_added, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [item.id, item.name, item.dept, item.qty, item.min, item.spec, item.date, now, now]
      );
    }

    // Seed transactions
    const transactions = [
      { id: uuidv4(), itemId: items[0].id, itemName: items[0].name, type: 'Stock Out', qty: 50, dept: 'Electrical', userId: devUserId, user: 'Developer', date: '2025-02-28', notes: 'Site A wiring' },
      { id: uuidv4(), itemId: items[10].id, itemName: items[10].name, type: 'Stock Out', qty: 30, dept: 'General Construction', userId: devUserId, user: 'Developer', date: '2025-02-27', notes: 'Foundation work' },
      { id: uuidv4(), itemId: items[5].id, itemName: items[5].name, type: 'Stock In', qty: 100, dept: 'Plumbing', userId: user1Id, user: 'Capella_admin', date: '2025-02-26', notes: 'New supplier delivery' },
      { id: uuidv4(), itemId: items[2].id, itemName: items[2].name, type: 'Stock Out', qty: 8, dept: 'Electrical', userId: devUserId, user: 'Developer', date: '2025-02-25', notes: 'Office lighting' },
      { id: uuidv4(), itemId: items[13].id, itemName: items[13].name, type: 'Stock In', qty: 15, dept: 'General Construction', userId: user1Id, user: 'Capella_admin', date: '2025-02-24', notes: '' },
      { id: uuidv4(), itemId: items[7].id, itemName: items[7].name, type: 'Stock Out', qty: 2, dept: 'Plumbing', userId: devUserId, user: 'Developer', date: '2025-02-23', notes: 'Bathroom install Block B' },
      { id: uuidv4(), itemId: items[11].id, itemName: items[11].name, type: 'Stock In', qty: 50, dept: 'General Construction', userId: user1Id, user: 'Capella_admin', date: '2025-02-22', notes: '' },
      { id: uuidv4(), itemId: items[1].id, itemName: items[1].name, type: 'Stock Out', qty: 10, dept: 'Electrical', userId: devUserId, user: 'Developer', date: '2025-02-21', notes: 'DB installation' },
      { id: uuidv4(), itemId: items[12].id, itemName: items[12].name, type: 'Stock Out', qty: 20, dept: 'General Construction', userId: user1Id, user: 'Capella_admin', date: '2025-02-20', notes: 'Warehouse roof' },
      { id: uuidv4(), itemId: items[6].id, itemName: items[6].name, type: 'Stock In', qty: 15, dept: 'Plumbing', userId: user1Id, user: 'Capella_admin', date: '2025-02-19', notes: '' },
    ];

    for (const tx of transactions) {
      await dbRun(
        `INSERT INTO transactions (id, item_id, item_name, type, quantity, department, user_id, user, date, notes, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [tx.id, tx.itemId, tx.itemName, tx.type, tx.qty, tx.dept, tx.userId, tx.user, tx.date, tx.notes || null, now]
      );
    }

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
