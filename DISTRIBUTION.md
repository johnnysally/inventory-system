# SawelaCapella Inventory Management System - Distribution Guide

This guide explains how to package and distribute the SawelaCapella system to other computers.

## 📦 Preparing for Distribution

### Option 1: Complete Installation Package (Recommended)

Best for non-technical users. Provides ready-to-run system.

#### Step 1: Prepare the Project

```bash
# Start with clean project
npm install
cd backend
npm install
npm run db:init
npm run db:seed  # Optional: add sample data
cd ..

# Build for production
npm run build
cd backend
npm run build
cd ..
```

#### Step 2: Create Distribution Package

Create a `.gitignore` file in project root to exclude:
```
node_modules/
dist/
backend/dist/
.env
backend/.env
backend/data/inventory.db  # Remove production database
*.log
```

#### Step 3: Package Contents

Include these files:

```
📦 SawelaCapella-InventorySystem-v1.0.0/
├── 📂 src/                    # Frontend source
├── 📂 backend/
│   ├── 📂 src/               # Backend source
│   ├── 📂 dist/              # Compiled JavaScript
│   ├── 📂 data/              # Empty - will be created
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── 📂 public/
├── 📂 dist/                  # Built frontend
├── package.json
├── vite.config.ts
├── tsconfig.json
├── README.md
├── INSTALLATION.md
├── QUICKSTART.md
├── DEPLOYMENT.md
├── SETUP_CHECKLIST.md
├── setup.bat                 # Windows setup script
├── setup.sh                  # Linux/macOS setup script
└── .env.example
```

#### Step 4: Create Distribution Files

**Windows Distribution:**

```bash
# Create ZIP file
# Using Windows: Right-click folder → Send to → Compressed folder
# Or use PowerShell:
Compress-Archive -Path "SawelaCapella-InventorySystem-v1.0.0" -DestinationPath "SawelaCapella-v1.0.0-Windows.zip"
```

**Linux/macOS Distribution:**

```bash
# Create TAR.GZ file
tar -czf SawelaCapella-v1.0.0-Unix.tar.gz SawelaCapella-InventorySystem-v1.0.0/
```

**Cross-Platform (Universal):**

```bash
# Create ZIP that works on all platforms
zip -r SawelaCapella-v1.0.0-Universal.zip SawelaCapella-InventorySystem-v1.0.0/ \
  -x "node_modules/*" \
  "backend/node_modules/*" \
  "dist/*" \
  "backend/dist/*" \
  ".env" \
  "backend/.env" \
  "backend/data/inventory.db"
```

### Option 2: Source Code Only

For developers who want to compile/modify the system.

1. Create repository on GitHub/GitLab
2. Add `.gitignore`:
   ```
   node_modules/
   dist/
   backend/dist/
   backend/node_modules/
   .env
   backend/.env
   backend/data/inventory.db
   ```
3. Push code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <repository-url>
   git push -u origin main
   ```

### Option 3: Docker Container

Package everything in a Docker container for universal deployment.

Create `Dockerfile` in project root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY backend/package.json backend/package-lock.json ./backend/

# Install dependencies
RUN npm ci
RUN cd backend && npm ci && cd ..

# Copy source code
COPY src ./src
COPY backend/src ./backend/src
COPY public ./public
COPY tsconfig.json vite.config.ts index.html ./
COPY backend/tsconfig.json ./backend/

# Build frontend
RUN npm run build

# Build backend
WORKDIR /app/backend
RUN npm run build

# Expose ports
EXPOSE 5000 5173

# Initialize database and start
WORKDIR /app
CMD ["sh", "-c", "npm run db:init && npm run start"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  scp-app:
    build: .
    ports:
      - "5000:5000"
      - "5173:5173"
    environment:
      NODE_ENV: production
    volumes:
      - ./backend/data:/app/backend/data
```

Run with Docker:
```bash
docker build -t scp-inventory .
docker run -p 5000:5000 -p 5173:5173 scp-inventory
```

## 📋 Distribution Checklist

Before distributing, verify:

- [ ] All dependencies listed in package.json
- [ ] Backend `.env.example` includes all required variables
- [ ] Frontend `.env.example` includes all variables
- [ ] README.md is comprehensive and current
- [ ] QUICKSTART.md is clear and follows system
- [ ] INSTALLATION.md covers all scenarios
- [ ] Setup scripts (setup.bat, setup.sh) are executable
- [ ] Database initialization works: `npm run db:init`
- [ ] Application builds without errors: `npm run build`
- [ ] No node_modules in distribution package
- [ ] No production database file in distribution
- [ ] No sensitive environment variables included
- [ ] Documentation links are all correct
- [ ] Version numbers are consistent (package.json, README, INSTALLATION.md)

## 🚀 Installation Instructions for Recipients

Include these simple steps:

**For End Users:**

1. Extract the ZIP/TAR file
2. Read `QUICKSTART.md` (5-minute setup)
3. On Windows: Double-click `setup.bat`
   On Linux/macOS: Run `./setup.sh`
4. Follow on-screen instructions
5. Open `http://localhost:5173`

**For Developers:**

1. Extract files
2. Run `npm install && cd backend && npm install && cd ..`
3. Run `cd backend && npm run db:init && cd ..`
4. Terminal 1: `cd backend && npm run dev`
5. Terminal 2: `npm run dev`

## 📧 Distribution Methods

### Email or File Transfer

```
File: SawelaCapella-v1.0.0-Windows.zip
Size: ~50-100 MB (depending on node_modules size)
```

**Note**: If including pre-built (npm packages), file size will be larger.
Better to distribute source code only and let recipients install dependencies.

### Via Git Repository

```bash
git clone https://github.com/yourusername/scp-inventory.git
cd scp-inventory
npm install
# Follow setup instructions
```

### Via Cloud Storage

1. Upload ZIP to Google Drive, OneDrive, or Dropbox
2. Share link with installation team
3. Recipients download and extract
4. Follow QUICKSTART.md

### Via Docker Registry

Push to Docker Hub:

```bash
# Build image
docker build -t yourusername/scp-inventory:1.0.0 .

# Login to Docker Hub
docker login

# Tag and push
docker tag yourusername/scp-inventory:1.0.0 yourusername/scp-inventory:latest
docker push yourusername/scp-inventory:1.0.0
```

Recipients pull and run:
```bash
docker pull yourusername/scp-inventory:1.0.0
docker run -p 5000:5000 -p 5173:5173 yourusername/scp-inventory:1.0.0
```

## 🔒 Security Before Distribution

### Remove Sensitive Files

```bash
# Remove any credential files
rm -f backend/.env
rm -f .env
rm -f backend/data/inventory.db

# Remove development databases
rm -f backend/data/*.db-journal

# Ensure .gitignore excludes these
cat backend/.gitignore
```

### Update Default Credentials

Before distribution, document that users must change:
- Default admin password
- JWT secret in production

### Include Security Guide

Create `SECURITY.md`:

```markdown
# Security Checklist

1. Change default admin password immediately
2. Update JWT secret in production
3. Use HTTPS/SSL for production
4. Enable firewall rules
5. Regular database backups
6. Monitor access logs
7. Keep dependencies updated: `npm audit`
```

## 📞 Support Resources to Include

Include in distribution:

- [x] README.md - Project overview
- [x] QUICKSTART.md - 5-minute setup
- [x] INSTALLATION.md - Detailed guide
- [x] DEPLOYMENT.md - Production setup
- [x] SETUP_CHECKLIST.md - Verification steps
- [x] setup.bat / setup.sh - Automated setup

## 📈 Versioning

Follow semantic versioning:

```
v1.0.0
│ │ └─ Patch (bug fixes)
│ └─── Minor (new features)
└───── Major (breaking changes)
```

Update version in:
- package.json (both root and backend)
- README.md
- QUICKSTART.md
- Distribution filename

## 🔄 Update Distribution Process

For future updates:

1. Update version: `package.json`, `README.md`
2. Build and test: `npm run build`
3. Document changes in CHANGELOG
4. Create release notes
5. Re-package with new version
6. Notify users of availability

## 📦 File Size Optimization

### Without node_modules (Recommended)

```
Source only: ~5-10 MB
Compressed: ~1-2 MB
```

**Installation time**: ~5 minutes (download dependencies)

### With node_modules (Not Recommended)

```
Full package: ~200-300 MB
Compressed: ~50-100 MB
```

**Installation time**: ~1 minute (just extract)

**Recommendation**: Distribute source code only. Let npm install dependencies.

## ✅ Final Distribution Checklist

- [ ] Version number updated everywhere
- [ ] All documentation files included
- [ ] setup.bat and setup.sh tested
- [ ] .env.example files present and complete
- [ ] No sensitive files included
- [ ] File structure is correct
- [ ] README links are correct
- [ ] Package tested on target OS (Windows/Linux/macOS)
- [ ] Installation takes < 5 minutes
- [ ] Support documentation clear
- [ ] Default credentials documented
- [ ] Security guidelines included

---

**Distribution Guide Version**: 1.0  
**Last Updated**: March 2026
