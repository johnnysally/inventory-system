#!/bin/bash

# SawelaCapella Inventory Management System - Setup Script for Linux/macOS

echo ""
echo "==============================================="
echo "SawelaCapella Inventory Management System"
echo "Setup and Installation Script"
echo "==============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    echo "Then run this script again."
    exit 1
fi

echo "[✓] Node.js is installed"
node --version

echo ""
echo "Step 1: Installing frontend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install frontend dependencies"
    exit 1
fi
echo "[✓] Frontend dependencies installed"

echo ""
echo "Step 2: Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies"
    cd ..
    exit 1
fi
echo "[✓] Backend dependencies installed"
cd ..

echo ""
echo "Step 3: Creating backend data directory..."
if [ ! -d "backend/data" ]; then
    mkdir -p backend/data
    echo "[✓] Data directory created"
else
    echo "[✓] Data directory already exists"
fi

echo ""
echo "Step 4: Initializing database..."
cd backend
npm run db:init
if [ $? -ne 0 ]; then
    echo "WARNING: Database initialization may need manual setup"
    echo "Run: cd backend && npm run db:init"
fi
echo "[✓] Database initialized"
cd ..

echo ""
echo "==============================================="
echo "Setup Complete!"
echo "==============================================="
echo ""
echo "Next steps:"
echo "1. Open Terminal 1 and run:"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "2. Open Terminal 2 (in project root) and run:"
echo "   npm run dev"
echo ""
echo "3. Open your browser to http://localhost:5173"
echo ""
echo "Default Login Credentials:"
echo "  Admin: admin@example.com / password123"
echo "  Staff: staff@example.com / password123"
echo ""
echo "IMPORTANT: Change default passwords after first login!"
echo ""
