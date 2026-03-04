# SawelaCapella Inventory Management System - Quick Start Guide

## ⚡ Quick Start (5 Minutes)

### Windows Users

1. **Extract the project** to a folder
2. **Double-click** `setup.bat` to automatically install
3. **Open Terminal 1** in the project folder and run:
   ```bash
   cd backend
   npm run dev
   ```
4. **Open Terminal 2** in the project folder and run:
   ```bash
   npm run dev
   ```
5. **Open your browser** to: `http://localhost:5173`

### Linux/macOS Users

1. **Extract the project** to a folder
2. **Open Terminal** in the project folder
3. **Make setup script executable** and run:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```
4. **Terminal 1** - Start backend:
   ```bash
   cd backend
   npm run dev
   ```
5. **Terminal 2** - Start frontend:
   ```bash
   npm run dev
   ```
6. **Open browser** to: `http://localhost:5173`

## 🔐 Login Credentials

After startup, use these to login:

```
Email:    admin@example.com
Password: password123
```

**⚠️ IMPORTANT**: Change these credentials immediately in User Settings!

## 📖 Full Documentation

See `INSTALLATION.md` for detailed setup instructions and troubleshooting.

## 🏃 Running Again

To start the system on subsequent days:

**Terminal 1:**
```bash
cd backend
npm run dev
```

**Terminal 2:**
```bash
npm run dev
```

Then visit `http://localhost:5173`

## ⚙️ Main Features

✓ **Inventory Management** - Add, edit, track items with units  
✓ **Stock Operations** - Record in/out transactions with recipients  
✓ **Reporting** - Generate and export professional reports  
✓ **Low Stock Alerts** - Automatic notifications for low inventory  
✓ **User Management** - Multiple user roles and permissions  
✓ **Data Export** - CSV and print functionality  

## 🆘 Common Issues

**Can't connect to backend?**
- Ensure both services are running (see Terminal 1 & 2 above)
- Check browser console (F12) for errors

**Database errors?**
- Try: `cd backend && npm run db:init`

**Port already in use?**
- See `INSTALLATION.md` for changing ports

## 📞 Need Help?

1. Check `INSTALLATION.md` troubleshooting section
2. Review browser console errors (F12)
3. Check terminal output for backend errors

---

**Version**: 1.0.0  
**Last Updated**: March 2026
