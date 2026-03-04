# Backend Setup Complete ✅

## Structure

```
backend/
├── src/
│   ├── middleware/
│   │   ├── auth.ts           # JWT authentication & role-based access
│   │   └── errorHandler.ts   # Error handling & async wrapper
│   ├── models/
│   │   ├── User.ts           # User CRUD operations
│   │   ├── InventoryItem.ts  # Inventory item management
│   │   └── Transaction.ts    # Transaction logging
│   ├── routes/
│   │   ├── auth.ts           # Login/logout endpoints
│   │   ├── users.ts          # User management endpoints
│   │   ├── inventory.ts      # Inventory CRUD endpoints
│   │   ├── transactions.ts   # Stock in/out endpoints
│   │   └── reports.ts        # Analytics & reporting endpoints
│   ├── utils/
│   │   ├── db.ts             # SQLite connection & utilities
│   │   ├── initDb.ts         # Database schema creation
│   │   └── seedDb.ts         # Sample data population
│   └── server.ts             # Express app setup & startup
├── data/
│   └── inventory.db          # SQLite database (auto-created)
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # Backend documentation
```

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Initialize Database
```bash
npm run db:init
```

This creates:
- `data/inventory.db` (SQLite database)
- Tables: users, inventory_items, transactions

### 3. Seed Sample Data
```bash
npm run db:seed
```

Populates database with:
- 3 users (1 Admin, 2 Staff)
- 15 inventory items (5 per department)
- 10 sample transactions

### 4. Start Development Server
```bash
npm run dev
```

Server runs on `http://localhost:5000`

## Database Schema

### Users Table
- id (TEXT) - UUID
- name (TEXT) - User full name
- email (TEXT) - Unique email
- password (TEXT) - Hashed password
- role (TEXT) - 'Admin' or 'Staff'
- created_at (TEXT) - ISO timestamp
- updated_at (TEXT) - ISO timestamp

### Inventory Items Table
- id (TEXT) - Unique ID
- name (TEXT) - Item name
- department (TEXT) - Department enum
- quantity (INTEGER) - Current stock
- min_threshold (INTEGER) - Low stock threshold
- specification (TEXT) - Item details
- date_added (TEXT) - Date added
- created_at (TEXT) - ISO timestamp
- updated_at (TEXT) - ISO timestamp

### Transactions Table
- id (TEXT) - Unique ID
- item_id (TEXT) - FK to inventory_items
- item_name (TEXT) - Item name snapshot
- type (TEXT) - 'Stock In' or 'Stock Out'
- quantity (INTEGER) - Transaction amount
- department (TEXT) - Department enum
- user_id (TEXT) - FK to users
- user (TEXT) - User name snapshot
- date (TEXT) - Transaction date
- notes (TEXT) - Optional notes
- created_at (TEXT) - ISO timestamp

## API Overview

All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Auth Endpoints
- `POST /api/auth/login` - Returns JWT token + user
- `POST /api/auth/logout` - Logout (client-side token removal)

### Resource Endpoints
- `/api/users` - User CRUD (Admin only, except GET all)
- `/api/inventory` - Inventory item CRUD
- `/api/transactions` - Stock movements & audit log
- `/api/reports` - Analytics & data aggregation

## Test Credentials

After running `npm run db:seed`:

| Email | Password | Role |
|-------|----------|------|
| john@buildtrack.co | admin123 | Admin |
| mary@buildtrack.co | staff123 | Staff |
| peter@buildtrack.co | staff123 | Staff |

## Environment Variables

Create `.env` from `.env.example`:

```env
PORT=5000                              # Server port
NODE_ENV=development                   # Environment
DATABASE_URL=./data/inventory.db      # SQLite path
JWT_SECRET=your_jwt_secret_key        # Change for production!
JWT_EXPIRES_IN=7d                     # Token expiry
CORS_ORIGIN=http://localhost:5173    # Frontend URL
```

## Key Features

✅ **Authentication**
- JWT-based with secure password hashing
- Role-based access control (Admin/Staff)

✅ **Inventory Management**
- Full CRUD operations
- Department filtering & search
- Low stock tracking

✅ **Transaction Logging**
- Complete audit trail
- Stock in/out operations
- User attribution

✅ **Reporting**
- Dashboard analytics
- Inventory reports
- Low stock alerts
- Transaction history

✅ **Error Handling**
- Consistent error responses
- Async/await with try-catch
- HTTP status codes

✅ **Type Safety**
- TypeScript throughout
- Strong interfaces
- Model-based approach

## Production Checklist

Before deploying:
- [ ] Change `JWT_SECRET` to a secure random string
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS
- [ ] Add input validation/sanitization
- [ ] Implement rate limiting
- [ ] Set up database backups
- [ ] Configure proper CORS origins
- [ ] Add comprehensive logging
- [ ] Set up monitoring/alerting

## Troubleshooting

**Database locked error:**
- Ensure no background processes are using the database
- Delete `data/` folder and re-run `npm run db:init && npm run db:seed`

**CORS errors:**
- Verify `CORS_ORIGIN` matches your frontend URL
- Check frontend is running on correct port (default 5173)

**Authentication fails:**
- Ensure JWT token is being sent in Authorization header
- Check token hasn't expired (default 7 days)
- Verify `JWT_SECRET` matches between encoding/decoding

**Port already in use:**
- Change `PORT` in `.env`
- Or kill process: `lsof -ti:5000 | xargs kill -9` (Unix) or `netstat -ano | findstr :5000` (Windows)

## Next Steps

1. ✅ Backend API complete
2. 👉 **Frontend Integration** - See [API_INTEGRATION.md](../API_INTEGRATION.md)
3. Connect frontend hooks to backend endpoints
4. Test all CRUD operations
5. Deploy to production

