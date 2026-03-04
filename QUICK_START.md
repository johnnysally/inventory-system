# 🚀 BuildTrack - Quick Start Guide

Complete setup of BuildTrack Inventory Management System (Frontend + Backend API).

## Project Structure

```
buildtrack-inventory-main/
├── src/                          # Frontend (React + TypeScript)
│   ├── services/
│   │   └── api.ts               # ✅ API service with JWT
│   ├── hooks/
│   │   ├── useAuth.tsx          # ✅ Updated: Backend auth
│   │   └── useInventory.tsx     # ✅ Updated: Backend API
│   ├── pages/
│   │   ├── Login.tsx            # ✅ Updated: Async login
│   │   ├── Inventory.tsx        # ✅ Updated: Async CRUD
│   │   ├── Dashboard.tsx
│   │   ├── Departments.tsx
│   │   ├── Reports.tsx
│   │   └── ...
│   └── ...
├── backend/                      # Backend (Express + SQLite)
│   ├── src/
│   │   ├── middleware/          # Auth & error handling
│   │   ├── models/              # Data models
│   │   ├── routes/              # API endpoints
│   │   ├── utils/               # DB utilities
│   │   └── server.ts            # Express app
│   ├── data/
│   │   └── inventory.db         # SQLite database
│   ├── package.json
│   └── ...
├── .env.local                    # ✅ Frontend env vars
├── package.json                  # ✅ Updated with axios
└── ...
```

## Quick Start (5 minutes)

### Step 1: Prepare Backend Database

```bash
cd backend
npm run db:init      # Create schema
npm run db:seed      # Add sample data
```

### Step 2: Start Backend Server

```bash
# Terminal 1
cd backend
npm run dev
# Output: 🚀 BuildTrack Backend Server
#         📍 Running on http://localhost:5000
```

### Step 3: Start Frontend

```bash
# Terminal 2
npm run dev
# Vite dev server runs locally at http://localhost:5173
```

### Step 4: Login

Go to `http://localhost:5173/login`

**Test Credentials:**
| Email | Password | Role |
|-------|----------|------|
| john@buildtrack.co | admin123 | Admin |
| mary@buildtrack.co | staff123 | Staff |
| peter@buildtrack.co | staff123 | Staff |

## What's Connected

### Frontend → Backend Communication

```
Login Form
  ↓
useAuth.login() 
  ↓
POST /api/auth/login
  ↓
Backend validates, returns JWT token
  ↓
Token stored in localStorage
  ↓
Dashboard loads, fetches inventory
```

### Data Operations

**All inventory operations now:**
1. Call backend API
2. Update database
3. Return fresh data
4. Update frontend state

Example: Adding an item
```typescript
await addItem({
  name: 'Copper Wire 2.5mm',
  department: 'Electrical',
  quantity: 100,
  minThreshold: 20,
  specification: '2.5mm single core'
});
// API Call: POST /api/inventory → SQLite → Response with new item
```

## API Endpoints

All require JWT token in `Authorization: Bearer <token>` header

### Authentication
- `POST /api/auth/login` → Returns token + user

### Inventory CRUD
- `GET /api/inventory` → List all items
- `GET /api/inventory/:id` → Get single item
- `POST /api/inventory` → Create item
- `PUT /api/inventory/:id` → Update item
- `DELETE /api/inventory/:id` → Delete item

### Transactions
- `GET /api/transactions` → List all transactions
- `POST /api/transactions/stock-in` → Record stock in
- `POST /api/transactions/stock-out` → Record stock out

### Reports
- `GET /api/reports/dashboard` → Dashboard data
- `GET /api/reports/inventory` → Inventory report
- `GET /api/reports/low-stock` → Low stock report
- `GET /api/reports/transactions` → Transaction report

## Features Implemented

### ✅ Authentication
- JWT-based auth with backend
- Password hashing (bcryptjs)
- Role-based access control
- Session persistence
- Auto-logout on token expiration

### ✅ Inventory Management
- Real-time data sync with backend
- Add/edit/delete items
- Search and filter by department
- Low stock tracking
- Edit/delete with validation

### ✅ Transactions
- Stock in/out operations
- Automatic audit trail
- User attribution
- Transaction history
- Date tracking

### ✅ UI/UX
- Loading states
- Error messages
- Disabled buttons during submission
- Real-time feedback with toasts
- Responsive design

## Development

### Backend Development

```bash
cd backend

# Start dev server with hot reload
npm run dev

# Type checking
tsc --noEmit

# Format code
npx prettier --write .
```

**Backend Stack:**
- Express.js - Web framework
- SQLite - Database
- TypeScript - Type safety
- JWT - Authentication
- bcryptjs - Password hashing

### Frontend Development

```bash
# Start dev server
npm run dev

# Build for production
npm build

# Type checking
npx tsc --noEmit

# Lint code
npx eslint .
```

**Frontend Stack:**
- React 18 - UI framework
- TypeScript - Type safety
- Vite - Build tool
- Tailwind CSS - Styling
- Shadcn/ui - Components
- Recharts - Data visualization

## Testing the Integration

### 1. Inventory CRUD
```
✓ Go to Inventory page
✓ View all items from backend
✓ Add new item → appears in list
✓ Edit item → updates in backend
✓ Delete item → removed from list
```

### 2. Stock Operations
```
✓ Click Stock In button → increases quantity
✓ Click Stock Out button → decreases quantity
✓ Check Transactions page → see history
```

### 3. Authentication
```
✓ Login with valid credentials → dashboard loads
✓ Logout → redirects to login
✓ Refresh page → stays logged in (token persisted)
✓ Modify localStorage token → redirects to login on next API call
```

### 4. Real-time Data
```
✓ Add item in one browser tab
✓ Refresh in another tab → new item appears
✓ All tabs see same data
```

## Troubleshooting

### Backend Won't Start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F

# Or use different port
PORT=5001 npm run dev
```

### Frontend Can't Connect to Backend
```bash
# Verify backend is running
curl http://localhost:5000/health
# Should respond: {"status":"ok"}

# Check .env.local
cat .env.local
# Should have: VITE_API_URL=http://localhost:5000/api
```

### Login Fails
```bash
# Check if database was seeded
backend$ npm run db:seed

# Verify email/password are correct
# john@buildtrack.co / admin123
```

### CORS Errors
```bash
# In backend .env
CORS_ORIGIN=http://localhost:5173

# Restart backend
npm run dev
```

## Project Checklist

- ✅ Backend API created with Express.js
- ✅ SQLite database with schema
- ✅ Sample data seeded
- ✅ JWT authentication implemented
- ✅ API service layer created
- ✅ Frontend hooks updated to use API
- ✅ Login/auth flow connected
- ✅ Inventory CRUD connected
- ✅ Transactions API connected
- ✅ Error handling implemented
- ✅ Loading states added
- ⏭️ Ready for production deployment

## Next Steps

### Option 1: Deploy Locally
```bash
# Build frontend
npm run build

# Build backend
cd backend && npm run build && npm start
```

### Option 2: Deploy to Cloud

**Frontend Options:**
- Vercel (recommended for Next.js but works with React)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

**Backend Options:**
- Heroku
- Railway
- Render
- AWS EC2 / Lambda
- DigitalOcean

### Set Production URLs

After deployment, update environment variables:

**Frontend:**
```bash
# .env.production.local or hosting platform
VITE_API_URL=https://api.your-domain.com/api
```

**Backend:**
```bash
# .env
CORS_ORIGIN=https://your-frontend-domain.com
JWT_SECRET=<secure-random-key>
NODE_ENV=production
```

## Documentation

- [Backend Setup Guide](./BACKEND_SETUP.md)
- [API Integration Details](./API_INTEGRATION.md)
- [API Setup Complete](./API_SETUP_COMPLETE.md)
- [Backend README](./backend/README.md)

## Support

For issues or questions:
1. Check the documentation files
2. Review error messages in browser console
3. Check backend logs in terminal
4. Verify all environment variables are set

---

**Happy Inventory Management! 🎉**

