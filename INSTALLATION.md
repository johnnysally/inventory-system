# SawelaCapella Inventory Management System - Installation Guide

## System Requirements

- **Node.js**: v16.0.0 or higher
- **npm**: v7.0.0 or higher (or yarn/bun)
- **Operating System**: Windows, macOS, or Linux
- **RAM**: Minimum 2GB
- **Disk Space**: Minimum 500MB

## Installation Steps

### Step 1: Clone or Download the Project

```bash
# Using Git
git clone <repository-url>
cd buildtrack-inventory-main

# Or download and extract the ZIP file
```

### Step 2: Install Frontend Dependencies

```bash
npm install
```

Or if using yarn:
```bash
yarn install
```

Or if using bun:
```bash
bun install
```

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### Step 4: Initialize the Database

Initialize the SQLite database with the required tables:

```bash
cd backend
npm run db:init
```

This will create a `data/inventory.db` file with the necessary database schema.

### Step 5: (Optional) Seed Sample Data

To populate the database with sample data for testing:

```bash
npm run db:seed
```

## Running the System

### Development Mode (Recommended for Setup)

Open two terminal windows:

**Terminal 1 - Start Backend Server:**
```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000`

**Terminal 2 - Start Frontend Application:**
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### Production Mode

**Build the frontend:**
```bash
npm run build
```

**Build the backend:**
```bash
cd backend
npm run build
```

**Start the backend:**
```bash
cd backend
npm run start
```

Then serve the `dist` folder from the frontend using a web server.

## Default Credentials

After installation, use these credentials to login:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password123 |
| Staff | staff@example.com | password123 |

**Important**: Change these credentials immediately after first login.

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
NODE_ENV=development
DB_PATH=./data/inventory.db
```

### Database Location

The SQLite database is stored at: `backend/data/inventory.db`

To use a different location, modify the `DB_PATH` in `.env` or the database initialization file.

## Troubleshooting

### Issue: Port 5000 or 5173 is already in use

**Solution**: Change the port in:
- Backend: Edit `backend/src/server.ts` and change the port number
- Frontend: Edit `vite.config.ts` and update the server port

### Issue: Database errors on startup

**Solution**: 
1. Delete the `backend/data/inventory.db` file
2. Re-run: `cd backend && npm run db:init`

### Issue: Cannot connect to backend from frontend

**Solution**:
1. Ensure backend is running on the correct port (default: 5000)
2. Check CORS settings in `backend/src/server.ts`
3. Verify both services are running on the same network

### Issue: Module not found errors

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Backend
cd backend
rm -rf node_modules
npm install
```

### Issue: SQLite3 compilation errors

**Solution**:
```bash
cd backend
npm install --build-from-source sqlite3
```

## System Features

### Inventory Management
- Add, edit, and delete inventory items
- Track quantities and units (units, metres, litres, kgs)
- Set minimum thresholds with low-stock alerts

### Stock Operations
- Record stock in/out transactions
- Track recipient information for stock out
- View complete transaction history

### Reporting
- Generate multiple report types:
  - Inventory Report
  - Low Stock Report
  - Transaction Report
  - Stock Out Report
- Export to CSV format
- Print reports with professional formatting
- Select and export specific items

### User Management
- Admin and Staff roles
- Department-based access
- User authentication with JWT tokens

### Data Persistence
- SQLite database
- Automatic backups of transaction data
- Data restoration across sessions

## File Structure

```
project-root/
├── src/                          # Frontend React application
│   ├── components/              # React components
│   ├── pages/                   # Page components
│   ├── hooks/                   # Custom React hooks
│   ├── services/                # API services
│   └── types/                   # TypeScript type definitions
├── backend/                      # Express backend server
│   ├── src/
│   │   ├── server.ts            # Express app setup
│   │   ├── routes/              # API route handlers
│   │   ├── models/              # Database models
│   │   ├── middleware/          # Express middleware
│   │   └── utils/               # Utility functions
│   └── data/                    # SQLite database location
├── public/                       # Static assets
├── package.json                  # Frontend dependencies
├── vite.config.ts               # Vite configuration
└── README.md                     # Project documentation
```

## API Documentation

### Base URL
- Development: `http://localhost:5000/api`
- Production: `/api` (relative to domain)

### Authentication
All API requests (except login) require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Key Endpoints
- `POST /auth/login` - Login
- `GET /inventory` - Get all items
- `POST /inventory` - Create item
- `PUT /inventory/:id` - Update item
- `DELETE /inventory/:id` - Delete item
- `POST /transactions` - Create transaction
- `GET /transactions` - Get all transactions
- `DELETE /transactions/:id` - Delete transaction

## Backing Up Data

To backup your inventory data:

```bash
# Copy the database file
cp backend/data/inventory.db backup/inventory.db
```

Or set up automatic backups:

```bash
# Create a backup script (backup.sh on Linux/Mac or .bat on Windows)
cp backend/data/inventory.db "backup/inventory-$(date +%Y%m%d-%H%M%S).db"
```

## Updating the System

To update the system to the latest version:

```bash
# Pull latest changes
git pull origin main

# Reinstall dependencies
npm install
cd backend && npm install && cd ..

# Restart the application
```

## Support

For issues, errors, or feature requests:
1. Check the Troubleshooting section
2. Review error messages in the browser console (F12)
3. Check backend logs in the terminal
4. Review database logs at `backend/data/`

## License

SawelaCapella Inventory Management System

## Version

v1.0.0 - March 2026
