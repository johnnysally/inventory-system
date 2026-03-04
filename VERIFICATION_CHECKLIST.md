# ✅ API Integration Verification Checklist

Use this checklist to verify the API integration is complete and working.

## Pre-Flight Checks

### Backend Setup
- [ ] `/backend/src/server.ts` exists
- [ ] `/backend/src/routes/` has 5 files (auth, users, inventory, transactions, reports)
- [ ] `/backend/src/models/` has 3 files (User, InventoryItem, Transaction)
- [ ] `/backend/src/middleware/` has 2 files (auth, errorHandler)
- [ ] `/backend/package.json` includes: express, sqlite3, jsonwebtoken, bcryptjs
- [ ] `/backend/data/` directory exists
- [ ] `/backend/.env.example` exists
- [ ] Backend dependencies installed (run `cd backend && npm install`)

### Frontend Setup  
- [ ] `/src/services/api.ts` exists with Axios configuration
- [ ] `/src/hooks/useAuth.tsx` uses API service
- [ ] `/src/hooks/useInventory.tsx` uses API service
- [ ] `/src/pages/Login.tsx` has async login
- [ ] `/src/pages/Inventory.tsx` has async CRUD
- [ ] `/src/App.tsx` handles loading state
- [ ] `.env.local` exists with `VITE_API_URL`
- [ ] `package.json` includes axios
- [ ] Frontend dependencies installed (run `npm install`)

## Database Initialization

After all files are in place:

### Initialize Backend Database
```bash
cd backend
npm run db:init
```

**Check:**
- [ ] Command completes without errors
- [ ] Console shows: "Database initialized successfully"
- [ ] `/backend/data/inventory.db` file exists (10-20KB)

### Seed Sample Data
```bash
cd backend
npm run db:seed
```

**Check:**
- [ ] Command completes without errors  
- [ ] Console shows: "Database seeded successfully"
- [ ] Database file size increased slightly

## Server Startup

### Start Backend Server
```bash
cd backend
npm run dev
```

**Check:**
- [ ] Console shows: "🚀 BuildTrack Backend Server"
- [ ] Console shows: "📍 Running on http://localhost:5000"
- [ ] Server is listening on port 5000
- [ ] No error messages in console

**Keep this terminal open!**

### Start Frontend Server (New Terminal)
```bash
npm run dev
```

**Check:**
- [ ] Vite dev server starts
- [ ] Console shows: "Local: http://localhost:5173"
- [ ] No error messages about missing modules
- [ ] No CORS errors

**Keep this terminal open!**

## API Connectivity Test

### Test Backend Health
```bash
curl http://localhost:5000/health
```

**Expected response:**
```json
{"status":"ok"}
```

**Check:**
- [ ] Response is 200 OK with status ok

### Test Backend is Running
Open browser to: `http://localhost:5000`

**Check:**
- [ ] Page shows "Cannot GET /" or similar (expected - no route)
- [ ] Not a connection refused error

## Frontend Loading Test

### Open Frontend in Browser
Go to: `http://localhost:5173`

**Check:**
- [ ] Page loads without errors
- [ ] No console errors (DevTools F12)
- [ ] Redirects to `/login` page
- [ ] Login page displays correctly

## Authentication Test

### Test Login
1. Go to http://localhost:5173/login
2. Default credentials are pre-filled:
   - Email: `john@buildtrack.co`
   - Password: `admin123`
3. Click "Sign In" button

**Check:**
- [ ] Network tab shows POST to `http://localhost:5000/api/auth/login` ✅
- [ ] Response status is 200
- [ ] Response includes token and user data
- [ ] No CORS errors
- [ ] Toast shows "Welcome back!"
- [ ] Page redirects to dashboard
- [ ] Dashboard loads with data

**Verify in localStorage:**
```javascript
// Open DevTools Console and run:
localStorage.getItem('token')        // Should show JWT token
localStorage.getItem('user')         // Should show user JSON
```

**Check:**
- [ ] Token exists and starts with "eyJ"
- [ ] User object has name, email, role

## Frontend Data Loading Test

### Check Inventory Loads from Backend
1. After login, go to Inventory page
2. Open DevTools Network tab
3. Refresh the page

**Check:**
- [ ] GET request to `http://localhost:5000/api/inventory` shows 200
- [ ] Response shows array of items
- [ ] Items display in table
- [ ] No "Loading..." message stays forever
- [ ] All 15 sample items visible

### Check Department Filter
1. In Inventory page, select "Electrical" from dropdown
2. Watch Network tab

**Check:**
- [ ] GET request sent with query param `?department=Electrical`
- [ ] Table filters to show only Electrical items
- [ ] Count matches (5 electrical items)

## CRUD Operations Test

### Test Add Item
1. Click "+ Add Item" button
2. Fill in form:
   - Name: "Test Wire"
   - Department: "Electrical"
   - Quantity: "100"
   - Min Threshold: "20"
   - Specification: "Test item"
3. Click "Add Item"

**Check:**
- [ ] POST request sent to `/api/inventory`
- [ ] Request body includes all fields
- [ ] Response status is 201
- [ ] Toast shows "Item added"
- [ ] New item appears in table
- [ ] Button is disabled during submission
- [ ] Network request completes before table updates

### Test Edit Item
1. Click pencil icon on any item
2. Change the name to "Edited Item"
3. Click "Save Changes"

**Check:**
- [ ] Dialog shows "Edit Item"
- [ ] Form populated with existing data
- [ ] PUT request sent to `/api/inventory/:id`
- [ ] Response status is 200
- [ ] Toast shows "Item updated"
- [ ] Table updates with new name
- [ ] Button is disabled during submission

### Test Delete Item
1. Click trash icon on "Test Wire" item
2. No confirmation needed, should delete directly

**Check:**
- [ ] DELETE request sent to `/api/inventory/:id`
- [ ] Response status is 200
- [ ] Toast shows "Item deleted"
- [ ] Item removed from table
- [ ] Item count decreases
- [ ] Button was disabled during deletion

## Stock Operations Test

### Test Stock In
1. Click arrow-down icon (Stock In) on first item
2. Enter quantity: `50`
3. Enter notes: `Test delivery`
4. Click "Stock In"

**Check:**
- [ ] Dialog opens with current stock amount
- [ ] POST request sent to `/api/transactions/stock-in`
- [ ] Request includes itemId, quantity, notes
- [ ] Response status is 201
- [ ] Toast shows "Stocked in 50 units"
- [ ] Item quantity increases by 50
- [ ] Transaction appears in Transactions page

### Test Stock Out
1. Click arrow-up icon (Stock Out) on first item
2. Enter quantity: `25`
3. Click "Stock Out"

**Check:**
- [ ] Dialog opens with current stock
- [ ] POST request sent to `/api/transactions/stock-out`
- [ ] Response status is 201
- [ ] Toast shows "Stocked out 25 units"
- [ ] Item quantity decreases by 25
- [ ] Transaction recorded

### Test Insufficient Stock
1. Attempt to stock out more than available
2. Enter quantity higher than current quantity
3. Click "Stock Out"

**Check:**
- [ ] Toast shows "Insufficient stock"
- [ ] No POST request sent
- [ ] Quantity unchanged
- [ ] Figure validated on frontend

## Session & Auth Test

### Test Session Persistence
1. Login with test credentials
2. Open browser DevTools → Application → Cookies
3. Refresh the entire page (F5)

**Check:**
- [ ] Page shows "Loading..." briefly
- [ ] Still logged in (no redirect to login)
- [ ] Dashboard loads with data
- [ ] User info visible in sidebar/header

### Test Token in Requests
1. After login, go to Inventory page
2. Open DevTools → Network tab
3. Make any request (add, edit, delete, stock in/out)
4. Click on request → Headers tab → Request Headers

**Check:**
- [ ] Authorization header exists
- [ ] Format: `Authorization: Bearer eyJ...`
- [ ] Token value matches localStorage token

### Test Session Expiry
1. Open localStorage
2. Manually delete the token: `localStorage.removeItem('token')`
3. Try to navigate to Inventory or make any request

**Check:**
- [ ] Request fails with 401 status
- [ ] Automatically redirected to `/login`
- [ ] Login page displays

## Error Handling Test

### Test Invalid Credentials
1. Go to login page
2. Change email to something invalid
3. Try to login

**Check:**
- [ ] POST to `/api/auth/login` returns 401
- [ ] Toast shows "Invalid credentials"
- [ ] Not redirected (stays on login page)

### Test Network Error
1. Stop backend server
2. Try to perform any operation (add item, refresh, etc.)
3. Watch console and UI

**Check:**
- [ ] Network error shown
- [ ] Toast shows error message
- [ ] UI doesn't break
- [ ] Graceful error handling

## Component Rendering Test

### Test Dashboard Page
1. Login
2. Go to Dashboard

**Check:**
- [ ] Page loads data from `/api/reports/dashboard`
- [ ] Stats cards show correct totals
- [ ] Department breakdown chart displays
- [ ] Recent transactions show
- [ ] Low stock alerts appear

### Test Department Dashboard
1. Go to Departments page
2. Click on "Electrical" card

**Check:**
- [ ] GET request to `/api/inventory?department=Electrical`
- [ ] Department dashboard loads
- [ ] Shows only electrical items
- [ ] Stats calculated correctly
- [ ] Charts and tables display

### Test Reports Page
1. Go to Reports page
2. Try different filters

**Check:**
- [ ] Data loads from `/api/reports/inventory`
- [ ] Filters work (department dropdown)
- [ ] Export CSV button exists
- [ ] Tables display correctly

## Performance Check

### Check Response Times
1. Open DevTools Network tab
2. Perform various operations
3. Look at "Time" column

**Check:**
- [ ] API responses under 500ms (local)
- [ ] Database queries fast
- [ ] No hanging requests
- [ ] No memory leaks (watch console)

### Check Request/Response Size
1. In Network tab, click requests
2. Check Response tab

**Check:**
- [ ] Inventory list response under 100KB
- [ ] Single item response under 10KB
- [ ] No massive payloads

## Final Verification Checklist

- [ ] Backend running on port 5000 ✅
- [ ] Frontend running on port 5173 ✅
- [ ] Database initialized with 15 items ✅
- [ ] Login works with test credentials ✅
- [ ] Token stored in localStorage ✅
- [ ] Inventory page loads from API ✅
- [ ] Add item creates in database ✅
- [ ] Edit item updates in database ✅
- [ ] Delete item removes from database ✅
- [ ] Stock in/out creates transactions ✅
- [ ] Session persists on refresh ✅
- [ ] Auth error handling works ✅
- [ ] Loading states display ✅
- [ ] Error messages show in toasts ✅
- [ ] No console errors ✅
- [ ] CORS working properly ✅

## If Something Isn't Working

### Backend Won't Start
```bash
# Check for errors
node -e "require('./backend/src/server.ts')"

# Check if port in use
netstat -ano | findstr :5000

# Try different port
PORT=5001 npm run dev
```

### Frontend Can't Connect
```bash
# Check API URL
cat .env.local  # Should have VITE_API_URL=http://localhost:5000/api

# Test backend
curl http://localhost:5000/health

# Clear cache & restart
rm -rf node_modules/.vite
npm run dev
```

### Login Fails
```bash
# Check database was seeded
cd backend && npm run db:seed

# Check database file exists
ls -la data/inventory.db
```

### CORS Errors
```bash
# Verify backend .env
cat backend/.env

# Ensure CORS_ORIGIN=http://localhost:5173
# Then restart: npm run dev
```

## Success Criteria

✅ You're done when:
- Both servers running without errors
- Frontend loads without CORS or connection errors
- Login works with test credentials
- Inventory data loads from backend
- CRUD operations work and persist
- Transactions recorded and visible
- No errors in browser console
- Loading states work
- Error messages display properly

---

**If all checks pass, the API integration is complete! 🎉**

