# SawelaCapella Inventory Management System

A professional, full-stack inventory management system built with React, TypeScript, Express, and SQLite. Designed for businesses to manage inventory, track stock operations, generate reports, and monitor low stock items.

## 🚀 Quick Start

Choose your setup method:

### Windows
1. Extract the project folder
2. Double-click `setup.bat`
3. Follow the on-screen instructions

### Linux/macOS
```bash
chmod +x setup.sh
./setup.sh
```

### Manual Setup
See [QUICKSTART.md](QUICKSTART.md) for a 5-minute setup guide.

## 📋 Documentation

Visit these guides based on your needs:

- **[QUICKSTART.md](QUICKSTART.md)** - Get running in 5 minutes ⚡
- **[INSTALLATION.md](INSTALLATION.md)** - Complete installation guide 📖
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide 🚀

## ✨ Features

### Inventory Management
- ✅ Add, edit, and delete inventory items
- ✅ Track quantities with multiple units (units, metres, litres, kgs)
- ✅ Set minimum thresholds with low-stock alerts
- ✅ Organize items by department (Electrical, Plumbing, General Construction)
- ✅ Add specifications and detailed descriptions

### Stock Operations
- ✅ Record stock in/out transactions
- ✅ Track recipient names for stock out items
- ✅ View complete transaction history
- ✅ Delete transaction records
- ✅ Automatic transaction logging with timestamps

### Reporting & Analytics
- ✅ **Inventory Report** - Current stock levels and specifications
- ✅ **Low Stock Report** - Items below minimum threshold with deficit info
- ✅ **Transaction Report** - Complete history of all stock movements
- ✅ **Stock Out Report** - Detailed stock issuance with recipients
- ✅ Select specific items and export just those
- ✅ Export to CSV with professional formatting
- ✅ Print reports with optimized page layouts
- ✅ Multi-tab navigation between report types

### User Management
- ✅ Admin and Staff roles
- ✅ Department-based access control
- ✅ JWT token authentication
- ✅ Secure login system

### Data Management
- ✅ SQLite database for reliability
- ✅ Automatic transaction logging
- ✅ Data persistence across sessions
- ✅ Database initialization and seeding
- ✅ Backup capabilities

## 🏗️ System Architecture

```
Frontend (React + TypeScript + Vite)
        ↓ (API calls via axios)
Backend (Express + TypeScript)
        ↓ (SQL queries)
Database (SQLite)
```

## 💻 System Requirements

- **Node.js**: v16.0.0 or higher
- **npm**: v7.0.0 or higher
- **RAM**: Minimum 2GB
- **Disk Space**: Minimum 500MB
- **Operating System**: Windows, macOS, or Linux

## 📁 Project Structure

```
scp-inventory/
├── src/                      # Frontend React application
│   ├── components/          # UI components (buttons, forms, etc.)
│   ├── pages/              # Page components (Inventory, Reports, etc.)
│   ├── hooks/              # Custom React hooks (useInventory, useAuth)
│   ├── services/           # API service (api.ts)
│   └── types/              # TypeScript definitions
├── backend/                # Express server
│   ├── src/
│   │   ├── server.ts       # Main server file
│   │   ├── routes/         # API endpoints
│   │   ├── models/         # Database models
│   │   ├── middleware/     # Auth, error handling
│   │   └── utils/          # Database initialization
│   └── data/               # SQLite database file
├── public/                 # Static assets
├── INSTALLATION.md         # Detailed setup guide
├── QUICKSTART.md          # Quick start guide
├── DEPLOYMENT.md          # Production deployment
└── setup.bat / setup.sh   # Automated setup scripts
```

## 🔐 Default Credentials

After installation, login with:

```
Email:    admin@example.com
Password: password123
```

**IMPORTANT**: Change these credentials immediately in User Settings!

## 🏃 Running the System

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Then open `http://localhost:5173` in your browser.

### Production Mode

```bash
npm run build
cd backend && npm run build && cd ..
cd backend && npm run start
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed production setup.

## 📊 Database

- **Type**: SQLite
- **Location**: `backend/data/inventory.db`
- **Schema**: Auto-initialized on first run
- **Tables**: 
  - `inventory_items` - Inventory data
  - `transactions` - Stock in/out records
  - `users` - User accounts

Initialize/Reset database:
```bash
cd backend
npm run db:init
npm run db:seed  # Optional: Add sample data
```

## 🔧 API Endpoints

Base URL: `http://localhost:5000/api`

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Inventory
- `GET /inventory` - Get all items
- `POST /inventory` - Create item
- `PUT /inventory/:id` - Update item
- `DELETE /inventory/:id` - Delete item

### Transactions
- `GET /transactions` - Get all transactions
- `POST /transactions` - Create transaction
- `DELETE /transactions/:id` - Delete transaction

### Users
- `GET /users` - Get all users
- `POST /users` - Create user
- `DELETE /users/:id` - Delete user

See [INSTALLATION.md](INSTALLATION.md#api-documentation) for complete API documentation.

## 🐛 Troubleshooting

### Can't install dependencies?
```bash
rm -rf node_modules
npm cache clean --force
npm install
```

### Database errors?
```bash
cd backend
npm run db:init
```

### Port already in use?
Edit `backend/src/server.ts` and change the PORT variable.

See [INSTALLATION.md](INSTALLATION.md#troubleshooting) for more issues and solutions.

## 📦 Dependencies

### Frontend
- React 18+
- TypeScript
- Shadcn UI Components
- Axios (API calls)
- Sonner (Notifications)
- Lucide Icons

### Backend
- Express.js
- TypeScript
- SQLite3
- JWT Authentication
- CORS support
- UUID generation
- Bcryptjs (Password hashing)

## 🚀 Deployment

For production deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## 📝 License

SawelaCapella Inventory Management System v1.0.0

## 📞 Support

1. Check the relevant documentation guide above
2. Review error messages in browser console (F12)
3. Check backend terminal output
4. Verify both frontend and backend services are running

## 🔄 Version History

- **v1.0.0** (March 2026) - Initial release
  - Inventory management with units support
  - Stock in/out operations with recipient tracking
  - Multi-tab reporting with print and export
  - User authentication and role-based access
  - SQLite database with auto-initialization

---

**Last Updated**: March 2026  
**Developed for**: SawelaCapella Organizations

- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
