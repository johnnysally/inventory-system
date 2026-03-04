# SawelaCapella Inventory Management System - Setup Checklist

Complete this checklist to ensure your installation is working correctly.

## ✅ Pre-Installation

- [ ] Node.js v16+ installed - Verify with `node --version`
- [ ] npm v7+ installed - Verify with `npm --version`
- [ ] Git installed (if cloning) - Verify with `git --version`
- [ ] At least 2GB RAM available
- [ ] At least 500MB free disk space
- [ ] Internet connection available

## ✅ Installation Phase

### Automated Installation

- [ ] Extracted project to desired folder
- [ ] Ran `setup.bat` (Windows) or `./setup.sh` (Linux/macOS)
- [ ] All installation steps completed without errors
- [ ] `node_modules` folder created in root directory
- [ ] `backend/node_modules` folder created
- [ ] `backend/data/` directory created
- [ ] `backend/data/inventory.db` file created

### Manual Installation (if not using automated setup)

- [ ] Ran `npm install` in project root
- [ ] Ran `cd backend && npm install && cd ..`
- [ ] Created `backend/data/` directory
- [ ] Ran `cd backend && npm run db:init && cd ..`

## ✅ Configuration Phase

- [ ] Reviewed `INSTALLATION.md` for system details
- [ ] Created `.env` file in `backend/` (optional, using defaults is fine)
- [ ] Verified backend port (default: 5000) is available
- [ ] Verified frontend port (default: 5173) is available

## ✅ Startup Phase

### Backend Startup

Terminal 1:
```bash
cd backend
npm run dev
```

- [ ] Backend server started without errors
- [ ] "Server running on port 5000" message visible
- [ ] No "Address already in use" errors
- [ ] Database connection successful
- [ ] No TypeScript compilation errors (warnings are OK)

### Frontend Startup

Terminal 2:
```bash
npm run dev
```

- [ ] Development server started
- [ ] "Local: http://localhost:5173" visible
- [ ] No compilation errors
- [ ] Browser can be opened to `http://localhost:5173`

## ✅ Application Access

### Web Browser

- [ ] Can access `http://localhost:5173` in web browser
- [ ] Page loads without errors
- [ ] UI is fully responsive
- [ ] No console errors in browser (F12)

## ✅ Authentication Phase

### Login

- [ ] Can see login page at startup
- [ ] Email field accepts input
- [ ] Password field accepts input
- [ ] "Remember me" checkbox works
- [ ] Login button is clickable

### First Time Login

- [ ] Use credentials: `admin@example.com` / `password123`
- [ ] Click Login button
- [ ] Successfully redirected to Dashboard
- [ ] No authentication errors
- [ ] User name visible in header/sidebar
- [ ] Logout option available

## ✅ Feature Testing

### Dashboard
- [ ] Dashboard displays without errors
- [ ] Navigation menu is visible
- [ ] All features accessible from menu:
  - [ ] Inventory
  - [ ] Departments
  - [ ] Reports
  - [ ] Users

### Inventory Management
- [ ] Inventory page loads
- [ ] Can see existing inventory items (if seeded)
- [ ] "Add New Item" button works
- [ ] Add item form displays all fields:
  - [ ] Name
  - [ ] Department
  - [ ] Quantity
  - [ ] Unit (dropdown with: units, metres, litres, kgs)
  - [ ] Min Threshold
  - [ ] Specification
- [ ] Can submit and save new item
- [ ] Item appears in table immediately
- [ ] Can edit existing item
- [ ] Can delete items (confirmation shows)

### Stock Operations
- [ ] Stock In button visible in Inventory page
- [ ] Stock Out button visible in Inventory page
- [ ] Stock In dialog opens with form
- [ ] Stock Out dialog opens with form:
  - [ ] Item name
  - [ ] Quantity
  - [ ] Recipient name field
  - [ ] Notes field (optional)
- [ ] Can submit and create transaction
- [ ] Success message shows

### Reports
- [ ] Reports page loads with tabs:
  - [ ] Inventory
  - [ ] Low Stock
  - [ ] Transactions
  - [ ] Stock Out
- [ ] Inventory Report tab:
  - [ ] Shows list of items
  - [ ] Can select items with checkboxes
  - [ ] Can select all items
  - [ ] Export button exports to CSV
  - [ ] Print button shows print preview
- [ ] Low Stock Report tab:
  - [ ] Shows items below minimum threshold
  - [ ] Displays deficit calculation
  - [ ] Export and Print available
- [ ] Transactions Report tab:
  - [ ] Shows all transactions
  - [ ] Displays Stock In/Out types with colors
  - [ ] Export and Print available
- [ ] Stock Out Report tab:
  - [ ] Shows all stock out records
  - [ ] Displays recipient names
  - [ ] Shows notes/additional info
  - [ ] Delete button works with confirmation
  - [ ] Export and Print available

### User Management
- [ ] Users page loads (if admin user)
- [ ] Can see list of users
- [ ] Can create new user
- [ ] Can edit user roles

## ✅ Export and Print Functions

### CSV Export
- [ ] Select items in any report tab
- [ ] Click "Export" button
- [ ] CSV file downloads with proper filename
- [ ] CSV opens in spreadsheet with:
  - [ ] Header row with column names
  - [ ] All selected data
  - [ ] Summary section at bottom
  - [ ] System name and timestamp

### Print Function
- [ ] Select items in any report tab
- [ ] Click "Print" button
- [ ] Print preview shows with:
  - [ ] Professional header (title, system name, timestamp)
  - [ ] Formatted table with all columns
  - [ ] Summary statistics
  - [ ] Proper borders and spacing
- [ ] Print dialog opens
- [ ] Can print to paper or PDF
- [ ] Print preview displays correctly (F12)

## ✅ Data Persistence

### Logout and Login
- [ ] Click logout in user menu
- [ ] Returns to login page
- [ ] Login again with same credentials
- [ ] All previous data is still there
- [ ] Items and transactions preserved

### Server Restart
- [ ] Stop backend server (Ctrl+C in Terminal 1)
- [ ] Stop frontend (Ctrl+C in Terminal 2)
- [ ] Restart both services
- [ ] All data is still present

## ✅ Error Handling

### Invalid Login
- [ ] Try wrong password
- [ ] Error message displays
- [ ] Application doesn't crash

### Network Issues
- [ ] Stop backend server temporarily
- [ ] Try action in frontend
- [ ] Error message shows
- [ ] Restart backend
- [ ] Application recovers

## ✅ Performance Checks

- [ ] Pages load in < 2 seconds
- [ ] No UI lag or freezing
- [ ] Responsive design works on different window sizes
- [ ] Mobile-sized window (resize browser) displays correctly

## ✅ Browser Console Check

Open Developer Tools (F12):

- [ ] No red error messages
- [ ] No critical warnings
- [ ] API calls show in Network tab
- [ ] No CORS errors
- [ ] No authentication errors

## ✅ Final Verification

- [ ] System is fully functional
- [ ] Default password changed (recommended):
  - [ ] User Settings accessible
  - [ ] Can change password
  - [ ] New password works on re-login
- [ ] Can export sample data to CSV
- [ ] Can generate print-friendly reports
- [ ] System is ready for production use

## 📝 Notes & Issues

### If You Encounter Issues

**TypeScript Errors (non-critical):**
The system works even if you see TypeScript compilation warnings. These don't affect functionality.

**Port Already in Use:**
```bash
# Windows - find process on port
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/macOS
lsof -i :5000
kill -9 <PID>
```

**Database Errors:**
```bash
cd backend
rm data/inventory.db
npm run db:init
```

**Can't Install Dependencies:**
```bash
rm -rf node_modules
npm cache clean --force
npm install
```

## 🎉 Setup Complete!

Once all checkboxes are checked, your SawelaCapella Inventory Management System is ready for use!

### Next Steps:
1. Create backup of database file
2. Set up user accounts for team members
3. Import existing inventory data if needed
4. Configure system settings
5. Train team on system usage

### For Production Deployment:
See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive production setup guide.

---

**Checklist Version**: 1.0  
**Last Updated**: March 2026
