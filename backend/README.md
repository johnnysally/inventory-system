# BuildTrack Backend

Backend API for the BuildTrack Inventory Management System.

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Create .env file:**
Copy `.env.example` to `.env` and update variables if needed:
```bash
cp .env.example .env
```

3. **Initialize database:**
```bash
npm run db:init
```

4. **Seed database with sample data:**
```bash
npm run db:seed
```

5. **Start development server:**
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Run compiled server
- `npm run db:init` - Initialize database schema
- `npm run db:seed` - Populate database with sample data

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout (client-side operation)

### Users
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (Admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)

### Inventory
- `GET /api/inventory` - List all items (with optional ?department filter)
- `GET /api/inventory/search?q=term` - Search items
- `GET /api/inventory/:id` - Get item by ID
- `POST /api/inventory` - Create new item
- `PUT /api/inventory/:id` - Update item
- `DELETE /api/inventory/:id` - Delete item

### Transactions
- `GET /api/transactions` - List all transactions (with optional ?department filter)
- `GET /api/transactions/item/:itemId` - Get transactions for specific item
- `GET /api/transactions/stats` - Get transaction statistics
- `POST /api/transactions/stock-in` - Create stock in transaction
- `POST /api/transactions/stock-out` - Create stock out transaction

### Reports
- `GET /api/reports/inventory` - Inventory report
- `GET /api/reports/low-stock` - Low stock report
- `GET /api/reports/transactions` - Transactions report
- `GET /api/reports/dashboard` - Dashboard overview data

## Test Users

After seeding the database, you can login with:

- **Admin:** john@buildtrack.co / admin123
- **Staff:** mary@buildtrack.co / staff123
- **Staff:** peter@buildtrack.co / staff123

## Technology Stack

- **Node.js** - Runtime
- **Express.js** - Web framework
- **SQLite** - Database
- **TypeScript** - Type safety
- **JWT** - Authentication
- **bcryptjs** - Password hashing
