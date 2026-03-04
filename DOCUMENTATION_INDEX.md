# SawelaCapella Inventory Management System - Documentation Index

Welcome! This is your guide to all available documentation for the SawelaCapella system.

## 📚 Documentation Files

### For First-Time Users

Start here if you're setting up the system for the first time:

1. **[QUICKSTART.md](QUICKSTART.md)** ⚡ (5 minutes)
   - Fastest way to get started
   - Windows, Linux, macOS instructions
   - Default login credentials
   - Running again next time
   - **Best for**: Non-technical users, quick setup

2. **[README.md](README.md)** 📖 (Overview)
   - Project overview and features
   - System architecture
   - Project structure
   - Quick reference guide
   - **Best for**: Understanding what the system does

### For Detailed Setup

If you need more comprehensive information:

3. **[INSTALLATION.md](INSTALLATION.md)** 📋 (Complete)
   - System requirements
   - Step-by-step installation
   - Configuration options
   - Detailed troubleshooting
   - API documentation
   - **Best for**: Complete setup reference, troubleshooting

4. **[SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)** ✅ (Verification)
   - Pre-installation checklist
   - Installation verification steps
   - Feature testing checklist
   - Data persistence verification
   - **Best for**: Verifying installation is complete and working

### For Production/Deployment

If you're deploying to production:

5. **[DEPLOYMENT.md](DEPLOYMENT.md)** 🚀 (Production)
   - Production deployment steps
   - Nginx configuration
   - PM2 process manager setup
   - Database backups
   - Security best practices
   - Performance optimization
   - Scaling strategies
   - **Best for**: Production deployment and operations

### For Distribution

If you're packaging this for other computers:

6. **[DISTRIBUTION.md](DISTRIBUTION.md)** 📦 (Packaging)
   - Creating installation packages
   - ZIP/TAR file creation
   - Docker containerization
   - GitHub repository setup
   - Distribution methods
   - Security before distribution
   - **Best for**: Sharing system with other computers/users

## 🎯 Quick Path by Situation

### Situation: "I just want to use the system locally"
1. Read [QUICKSTART.md](QUICKSTART.md)
2. Run `setup.bat` (Windows) or `./setup.sh` (Linux/macOS)
3. Done! ✅

### Situation: "I want to deploy this to production"
1. Read [README.md](README.md) for overview
2. Read [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
3. Follow security guidelines in DEPLOYMENT.md
4. Test with [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)
5. Deploy! 🚀

### Situation: "I want to share this with my team"
1. Read [DISTRIBUTION.md](DISTRIBUTION.md)
2. Create distribution package
3. Share files with team
4. Provide them with [QUICKSTART.md](QUICKSTART.md)
5. Team installs independently ✅

### Situation: "Something isn't working"
1. Check [README.md](README.md#-troubleshooting) troubleshooting section
2. Check [INSTALLATION.md](INSTALLATION.md#troubleshooting) for detailed solutions
3. Use [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) to verify installation
4. Review error messages in browser console (F12)

### Situation: "I need to back up or maintain the system"
1. Read [DEPLOYMENT.md](DEPLOYMENT.md#setup-automatic-backups)
2. See database maintenance section
3. Set up backup scripts
4. Monitor with PM2

## 📖 Documentation Structure

```
SawelaCapella Inventory System
├── README.md                        # Start here - Overview
├── QUICKSTART.md                    # Fast setup (5 min)
├── INSTALLATION.md                  # Detailed setup
├── SETUP_CHECKLIST.md              # Verification steps
├── DEPLOYMENT.md                    # Production setup
├── DISTRIBUTION.md                  # Packaging & sharing
├── DOCUMENTATION_INDEX.md           # This file
├── setup.bat / setup.sh            # Automated setup scripts
├── .env.example                     # Configuration template
└── backend/.env.example             # Backend config template
```

## 🚀 Feature Overview

### Core Features
- ✅ Inventory management with units support (units, metres, litres, kgs)
- ✅ Stock in/out operations with recipient tracking
- ✅ Multi-tab reporting system
- ✅ CSV export with professional formatting
- ✅ Print functionality with page layouts
- ✅ Low stock alerts
- ✅ User authentication and roles
- ✅ SQLite database with auto-initialization

### User Roles
- **Admin**: Full system access, user management
- **Staff**: Inventory management, stock operations, reports

### Reports Available
- Inventory Report
- Low Stock Report
- Transaction Report
- Stock Out Report

## ⚙️ System Requirements

| Component | Requirement |
|-----------|-------------|
| Node.js | v16.0.0 or higher |
| npm | v7.0.0 or higher |
| RAM | Minimum 2GB |
| Disk Space | Minimum 500MB |
| OS | Windows, macOS, Linux |

## 🔐 Default Credentials

```
Email:    admin@example.com
Password: password123
```

**IMPORTANT**: Change these immediately after first login!

## 🔗 Key Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend API | 5000 | http://localhost:5000/api |
| Database | Local | backend/data/inventory.db |

## 📞 Common Tasks

### How to...

**Start the system**
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
npm run dev
```

**Change admin password**
- Login to system
- Click user icon (top right)
- Go to Settings/Profile
- Change password

**Initialize database**
```bash
cd backend && npm run db:init
```

**Add sample data**
```bash
cd backend && npm run db:seed
```

**Build for production**
```bash
npm run build && cd backend && npm run build && cd ..
```

**Export inventory**
- Go to Reports tab
- Select items with checkboxes
- Click Export CSV button
- File downloads to your default downloads folder

**Print reports**
- Go to Reports tab
- Select items with checkboxes
- Click Print button
- Print dialog opens
- Choose printer and settings
- Print!

## 🔄 Documentation Updates

Documentation is maintained alongside code updates:

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | March 2026 | Initial release |

## 📱 Responsive Design

The system works on:
- ✅ Desktop computers
- ✅ Tablets
- ✅ Large screens

Note: Mobile phones may require zoom due to table layouts.

## 🌐 Supported Browsers

- ✅ Chrome/Chromium 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 💾 Data Storage

**Database**: SQLite  
**Location**: `backend/data/inventory.db`  
**Backup**: Regular backups recommended  
**Persistence**: Data survives application restarts

## 🛠️ Technology Stack

### Frontend
- React 18+
- TypeScript
- Vite
- Shadcn UI Components
- Tailwind CSS
- Axios
- React Router

### Backend
- Express.js
- Node.js
- TypeScript
- SQLite3
- JWT Authentication
- CORS

## 📞 Support & Help

### If You Have Questions:

1. **Check the relevant documentation** above
2. **Review error messages** in browser console (F12)
3. **Check backend logs** in terminal
4. **Verify setup** with SETUP_CHECKLIST.md
5. **Review [INSTALLATION.md](INSTALLATION.md#troubleshooting)** troubleshooting section

### Common Error Messages:

| Error | Solution |
|-------|----------|
| "Port already in use" | Change port in config or stop other app |
| "Cannot find module" | Run `npm install` or `cd backend && npm install` |
| "Database error" | Run `npm run db:init` to recreate database |
| "Cannot connect to backend" | Ensure backend is running on port 5000 |
| "401 Unauthorized" | Login again, token may have expired |

## 📋 File Locations Reference

```
Project Root/
├── src/                      # React frontend app
├── backend/src/              # Express backend app
├── backend/data/             # SQLite database location
│   └── inventory.db
├── dist/                     # Built frontend (after npm run build)
├── backend/dist/             # Built backend (after npm run build)
├── node_modules/             # Frontend dependencies
├── backend/node_modules/     # Backend dependencies
└── Documentation files (*.md)
```

## 🎓 Learning Resources

### For Understanding the System:
- [README.md](README.md) - Project overview
- [INSTALLATION.md](INSTALLATION.md#-system-architecture) - System architecture

### For Setup:
- [QUICKSTART.md](QUICKSTART.md) - Fast setup
- [setup.bat or setup.sh](./setup.bat) - Automated installation

### For Troubleshooting:
- [INSTALLATION.md](INSTALLATION.md#troubleshooting) - Detailed solutions
- [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) - Verification steps

### For Production:
- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment guide
- [DISTRIBUTION.md](DISTRIBUTION.md) - Packaging and sharing

## ✨ Tips & Tricks

- Use Tab key to navigate forms faster
- Checkbox in table header selects/deselects all rows
- Use department filter on Reports page to narrow results
- Export CSV for offline data analysis
- Print reports to PDF using browser print dialog
- Hold Ctrl and click checkboxes for multi-select workflow

## 🔐 Security Reminders

- ⚠️ Change default admin password immediately
- ⚠️ Don't share .env files
- ⚠️ Use HTTPS in production
- ⚠️ Regular database backups
- ⚠️ Keep Node.js and npm updated
- ⚠️ Monitor access logs in production

## 📊 System Status Check

To verify everything is working:

1. ✅ Backend running on port 5000
2. ✅ Frontend running on port 5173
3. ✅ Database file exists
4. ✅ Can login with default credentials
5. ✅ Can create/edit inventory items
6. ✅ Can export to CSV
7. ✅ Can print reports

If all are working, system is ready! 🎉

---

## 📞 Questions?

Refer to appropriate documentation:
- **How to install?** → [QUICKSTART.md](QUICKSTART.md) or [INSTALLATION.md](INSTALLATION.md)
- **How to deploy?** → [DEPLOYMENT.md](DEPLOYMENT.md)
- **How to share?** → [DISTRIBUTION.md](DISTRIBUTION.md)
- **How to verify?** → [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)
- **What is this?** → [README.md](README.md)

---

**Documentation Index Version**: 1.0  
**Last Updated**: March 2026  
**System Version**: SawelaCapella Inventory Management System v1.0.0
