# Automatic System Startup Setup

This document explains how to set up the SawelaCapella Inventory System to start automatically when your computer powers on.

## Quick Start

Use one of the provided startup scripts:
- **start-system.bat** - Simple batch script (recommended for most users)
- **start-system.ps1** - Advanced PowerShell script with logging and options
- **start-system-ps.bat** - Wrapper for PowerShell script

## Method 1: Windows Startup Folder (Easiest & Recommended)

### Option A: Using Batch Script (Simplest)

1. **Open the Startup Folder:**
   - Press `Windows Key + R`
   - Type: `shell:startup`
   - Press Enter

2. **Create a Shortcut:**
   - Right-click in the empty space → New → Shortcut
   - Paste the full path: `C:\Users\chris\Desktop\inventory-system\start-system.bat`
   - Click Next
   - Name it: `SawelaCapella Startup`
   - Click Finish

3. **Test It:**
   - Close all server windows (if any are running)
   - Double-click the shortcut to verify it works
   - You should see two new windows open: Backend and Frontend

### Option B: Using PowerShell Script (More Features)

Same as Option A, but use:
- Path: `C:\Users\chris\Desktop\inventory-system\start-system-ps.bat`
- Name: `SawelaCapella Startup (Advanced)`

**Features:**
- Automatic logging to `logs/` folder
- Minimized window support: `.\start-system.ps1 -RunMinimized`
- Hidden/background mode: `.\start-system.ps1 -RunHidden`

## Method 2: Task Scheduler (More Control)

Recommended if you want to customize timing, restart behavior, or run specific startup actions.

1. **Open Task Scheduler:**
   - Press `Windows Key`
   - Type: `Task Scheduler`
   - Press Enter

2. **Create a New Task:**
   - Click "Create Basic Task" on the right panel
   - **Name:** `SawelaCapella Inventory System`
   - **Description:** `Automatically starts the inventory management system servers`
   - Click Next

3. **Set the Trigger:**
   - Select "When the computer starts"
   - Click Next
   - If prompted, select "At log on" for immediate startup

4. **Set the Action:**
   - Select "Start a program"
   - **Program:** `C:\Users\chris\Desktop\inventory-system\start-system.bat`
   - Click Next

5. **Finish and Configure:**
   - Check "Open the Properties dialog"
   - Click Finish
   - In Properties dialog:
     - **General tab:**
       - ☑️ Run with highest privileges
       - ☑️ Run whether user is logged in or not
     - **Conditions tab:**
       - Uncheck "Stop the task if it runs longer than" (servers run indefinitely)
     - **Settings tab:**
       - ☑️ If the task fails, restart every: 5 minutes
     - Click OK

## Method 3: Windows Services (Production/Background Mode)

For keeping servers running in the background without visible windows, use these tools:

### Option A: NSSM (Non-Sucking Service Manager) - Recommended
1. Download from: https://nssm.cc/download
2. Extract and add to PATH, then:
   ```cmd
   nssm install SawelaCapellaBackend "C:\Windows\System32\cmd.exe" "/c cd /d C:\Users\chris\Desktop\inventory-system\backend && npm run dev"
   nssm install SawelaCapellaFrontend "C:\Windows\System32\cmd.exe" "/c cd /d C:\Users\chris\Desktop\inventory-system && npm run dev"
   nssm start SawelaCapellaBackend
   nssm start SawelaCapellaFrontend
   ```

### Option B: WinSW (Windows Service Wrapper)
More complex setup; see: https://github.com/winsw/winsw

## Verification

After setting up autostart, **restart your computer** and verify:
- ✅ [Backend] window shows: `📍 Running on http://192.168.15.30:5000`
- ✅ [Frontend] window shows: `Local: http://192.168.15.30:5173`
- ✅ System is accessible at `http://192.168.15.30:5173`
- ✅ Login page loads without errors

## Stopping the System

**Method 1 (Startup Folder):**
- Simply close the Backend and Frontend command windows

**Method 2 (Task Scheduler):**
- Open Task Scheduler
- Right-click the task → End

**Method 3 (Services via NSSM):**
```cmd
nssm stop SawelaCapellaBackend
nssm stop SawelaCapellaFrontend
```

## Manual Testing

Before setting up autostart, test the startup scripts manually:

### Test Basic Batch Script:
```cmd
cd C:\Users\chris\Desktop\inventory-system
start-system.bat
```

### Test PowerShell Script (Minimized):
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser
cd C:\Users\chris\Desktop\inventory-system
.\start-system.ps1 -RunMinimized
```

### Test PowerShell Script (Hidden/Background):
```powershell
cd C:\Users\chris\Desktop\inventory-system
.\start-system.ps1 -RunHidden
```

## Troubleshooting

### Issue: Script runs but disappears immediately
**Solution:** 
- Double-click the .bat file to see error messages
- Check that you're in the correct directory
- Verify file paths in the script match your system

### Issue: npm commands not recognized
**Solution:**
```cmd
node --version
npm --version
```
If these commands don't work:
- Reinstall Node.js from https://nodejs.org/
- Restart your computer
- Add Node.js to PATH manually:
  1. Right-click "This PC" → Properties
  2. Click "Advanced system settings"
  3. Click "Environment Variables"
  4. Under System variables, find PATH
  5. Add: `C:\Program Files\nodejs`

### Issue: Ports already in use (5000 or 5173)
**Solution A:** Change the ports in:
- **Backend:** `backend/.env` (change `PORT=5000` to `PORT=5001`)
- **Frontend:** `vite.config.ts` (change `port: 5173` to `port: 5174`)
- **API Connection:** `.env.local` (update `VITE_API_URL`)
- **CORS:** Update `backend/.env` (update `CORS_ORIGIN`)

**Solution B:** Find and stop the process using the port:
```cmd
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### Issue: Database errors on startup
**Solution:**
```cmd
cd C:\Users\chris\Desktop\inventory-system\backend
npm run db:init
npm run db:seed
```

### Issue: Script won't run (Execution Policy error)
**Solution:** Run PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: "npm: The term 'npm' is not recognized" in PowerShell
**Solution:** Use cmd.exe instead:
1. Right-click start-system.ps1
2. Choose "Run with PowerShell"
3. If it still fails, use start-system.bat instead

### Issue: Services won't start after reboot
**Solutions:**
- For Method 1: Check that your user account has write permissions to the system folder
- For Method 2: Task Scheduler → Right-click task → Properties → General → Check "Run with highest privileges"
- For Method 3: Run NSSM commands as Administrator

### Issue: Servers crash on startup
**Check the logs:**
```cmd
REM Batch script logs are shown in the console windows
REM PowerShell script logs are in: c:\Users\chris\Desktop\inventory-system\logs\
```

### Getting Help

If you encounter issues:
1. Take a screenshot of the error message
2. Check the console output in the server windows
3. Review the logs folder (for PowerShell method)
4. Verify npm modules are installed:
   ```cmd
   cd c:\Users\chris\Desktop\inventory-system
   npm install
   
   cd backend
   npm install
   ```

## Recommended Setup

**Method 1 - Startup Folder** is recommended for most users because:
- ✅ Simplest to set up (copy shortcut to startup folder)
- ✅ Shows server status in visible windows
- ✅ Easy to stop by closing windows
- ✅ No additional tools or permissions needed
- ✅ Can see server logs in real-time

**Method 3 - Services** is recommended for production/always-on servers:
- ✅ Servers run in background (no visible windows)
- ✅ Automatic restart on failure
- ✅ Survives user logoff
- ⚠️ Requires setup tools (NSSM)
