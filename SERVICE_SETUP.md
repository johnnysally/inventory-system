# SawelaCapellaLodge Inventory System - Windows Service Setup

## Overview
This directory contains scripts to run the Inventory System as hidden Windows Services. Services run completely in the background with no visible terminals and will auto-start on **system power-on** (before any user login).

---

## Initial Setup (One-Time Only)

### Step 1: Run Setup as Administrator
1. Right-click **`setup-service.bat`**
2. Select **"Run as administrator"**
3. Wait for completion (it will download and configure NSSM)
4. Services will automatically start

**What this does:**
- Downloads NSSM (Non-Sucking Service Manager)
- Creates two Windows Services:
  - `InventorySystemBackend` (Port 5000)
  - `InventorySystemFrontend` (Port 5173)
- Sets both to auto-start on **system power-on** (before login)
- Runs services under LocalSystem account
- Starts the services immediately

---

## Daily Usage

### Start Services
```
start-service.bat
```
- Right-click and select "Run as administrator"
- Or just double-click (services do their own admin check)

### Stop Services
```
stop-service.bat
```
- Right-click and select "Run as administrator"

### Check Status
```
service-status.bat
```
- Shows which services are running/stopped
- No admin required

---

## System Access

Once services are running:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

---

## Windows Services Management

### View in Services App
1. Press `Win + R`
2. Type `services.msc`
3. Look for:
   - `InventorySystemBackend`
   - `InventorySystemFrontend`

### Command Line Control
```powershell
# Start services
net start InventorySystemBackend
net start InventorySystemFrontend

# Stop services
net stop InventorySystemBackend
net stop InventorySystemFrontend

# Check status
sc query InventorySystemBackend
sc query InventorySystemFrontend
```

---

## Removing Services (If Needed)

Run **`remove-service.bat`** as administrator
- Requires confirmation
- Removes all service entries
- System will no longer auto-start

---

## Troubleshooting

### Services won't start
1. Check that ports 5000 and 5173 are not in use
2. Verify Node.js is installed: `node --version`
3. Check logs in Windows Event Viewer

### Need to see logs/console output temporarily
Use the hidden runner instead:
```
run-hidden.vbs
```
(Will show popup window, but runs in background)

### Ports in use error
If ports are already in use:
```powershell
# Find what's using port 5173
netstat -ano | findstr :5173

# Kill the process (replace XXXX with PID)
taskkill /PID XXXX /F
```

---

## Key Features

✅ **Completely Hidden** - No terminals, no visible windows
✅ **Power-On Auto-Start** - Runs immediately when system boots (before login)
✅ **Easy Control** - Simple start/stop scripts
✅ **Professional** - Proper Windows Service implementation
✅ **Logging** - Integrates with Windows Event Viewer
✅ **No Installation** - Just copy scripts and run setup once

---

## Security Notes

- Services run under **LocalSystem** account (system-level, for boot-time startup)
- Can only be managed by Administrator
- Services are restricted to local network (localhost)
- All traffic goes through internal ports
- Starts before any user login

---

## Questions or Issues?

Check Windows Event Viewer for service logs:
1. Press `Win + R`
2. Type `eventvwr.msc`
3. Look in "Windows Logs" → "System"
