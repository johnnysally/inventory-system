# API Integration Complete ✅

The frontend is now fully connected to the backend API. Here's what was set up:

## Files Created/Modified

### New Files
- **`src/services/api.ts`** - Axios instance with JWT interceptors
- **`.env.local`** - Environment variables for API URL

### Updated Files
- **`src/hooks/useAuth.tsx`** - Now uses backend API for authentication
- **`src/hooks/useInventory.tsx`** - Now fetches/syncs data with backend API
- **`src/pages/Login.tsx`** - Updated to handle async login
- **`src/pages/Inventory.tsx`** - Updated for async CRUD operations
- **`src/App.tsx`** - Added loading state handling
- **`package.json`** - Added axios dependency

## How It Works

### 1. API Service (`src/services/api.ts`)

Axios instance with:
- **Base URL**: From `VITE_API_URL` env var (default: `http://localhost:5000/api`)
- **Request Interceptor**: Automatically adds JWT token from localStorage
- **Response Interceptor**: Handles 401 errors by redirecting to login

```typescript
import api from '@/services/api';

// Token is automatically added to headers
const response = await api.get('/inventory');
```

### 2. Authentication (`src/hooks/useAuth.tsx`)

**Async Login:**
```typescript
const loginSuccess = await login('john@buildtrack.co', 'admin123');
```

**Automatic Session Persistence:**
- Checks localStorage on mount
- Stores token and user data
- Auto-redirects to login if token expires

**Usage in Components:**
```typescript
const { user, login, logout, isAuthenticated, loading } = useAuth();
```

### 3. Inventory Management (`src/hooks/useInventory.tsx`)

**All operations are now async:**
```typescript
const { items, transactions, loading, error, addItem, updateItem, deleteItem, stockIn, stockOut, refreshData } = useInventory();

// Add item
await addItem({ 
  name: 'Copper Wire', 
  department: 'Electrical',
  quantity: 100,
  minThreshold: 20,
  specification: '2.5mm...'
});

// Stock in
await stockIn(itemId, 50); // Backend tracks user from JWT

// Stock out
await stockOut(itemId, 25);
```

### 4. Error Handling

All API calls have error handling:
```typescript
try {
  await addItem(newItem);
  toast.success('Item added');
} catch (error) {
  toast.error('Failed to add item');
}
```

## Running Both Applications

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Runs on http://localhost:5173
```

The frontend will automatically connect to the backend at `http://localhost:5000/api`.

## Test the Integration

### 1. Seed Backend Database (if not done)
```bash
cd backend
npm run db:seed
```

### 2. Start Both Applications
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2  
npm run dev
```

### 3. Login
Use test credentials:
- Email: `john@buildtrack.co`
- Password: `admin123`

### 4. Test Operations
- View inventory (fetches from backend)
- Add new item (POST request to backend)
- Edit item (PUT request)
- Delete item (DELETE request)
- Stock in/out (creates transactions in backend)

## Environment Configuration

The `.env.local` file contains:
```env
VITE_API_URL=http://localhost:5000/api
```

To use a different backend:
```env
VITE_API_URL=https://api.example.com/api
```

## Data Flow Diagram

```
USER ACTION (e.g., Add Item)
    ↓
Component (Inventory.tsx)
    ↓
Hook (useInventory)
    ↓
API Service (api.ts) - Adds JWT token
    ↓
Backend (Express.js)
    ↓
Database (SQLite)
    ↓
Response JSON → Frontend Updates UI
```

## Key Features Implemented

✅ **JWT Authentication**
- Automatic token inclusion in requests
- Token persistence across sessions
- Auto-logout on token expiration

✅ **Real-time Data Sync**
- Frontend fetches latest data after operations
- Automatic error recovery

✅ **Loading States**
- Buttons disabled during submission
- Loading indicators during data fetch
- Auth loading state on app startup

✅ **Error Handling**
- User-friendly error messages
- Console logging for debugging
- Automatic session recovery

✅ **Type Safety**
- TypeScript throughout
- API responses properly typed
- Hook interfaces well-defined

## Debugging Tips

### Check API Connection
```typescript
// Open browser DevTools → Network tab
// All requests should show as "api" domain
```

### Verify JWT Token
```javascript
// In browser console
localStorage.getItem('token')
localStorage.getItem('user')
```

### Check Backend Logs
```bash
# Backend terminal shows incoming requests
# API errors displayed with status codes
```

### Enable CORS Debugging
If you see CORS errors:
1. Ensure backend is running on port 5000
2. Check `.env` CORS_ORIGIN matches frontend URL
3. Verify `VITE_API_URL` is correct

## Common Issues & Solutions

### 1. "Cannot connect to API"
- ❌ Backend not running
- ✅ Start backend with `npm run dev`
- ✅ Check it's running on `http://localhost:5000`

### 2. "401 Unauthorized"
- ❌ Token expired or invalid
- ✅ Login again
- ✅ Check localStorage has valid token

### 3. "CORS Error"
- ❌ `VITE_API_URL` mismatch
- ✅ Verify `.env.local` has correct URL
- ✅ Hard refresh browser (Ctrl+Shift+R)

### 4. "Data not updating"
- ❌ Frontend not connected
- ✅ Check Network tab in DevTools
- ✅ Verify requests succeed (200 status)

## Next Steps

1. ✅ Backend API running
2. ✅ Frontend API integration complete
3. 👉 **Test all features:**
   - Login/logout
   - View inventory
   - Add/edit/delete items
   - Stock in/out operations
   - View transactions
4. Deploy to production

## Production Deployment

Before deploying:

**Backend:**
```env
NODE_ENV=production
JWT_SECRET=<secure-random-key>
CORS_ORIGIN=https://your-frontend.com
```

**Frontend:**
```env
VITE_API_URL=https://api.your-domain.com/api
```

Also:
- ✅ Enable HTTPS for all requests
- ✅ Use environment-specific API URLs
- ✅ Add request timeout handling
- ✅ Set up error logging/monitoring
- ✅ Configure database backups

