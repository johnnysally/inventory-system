# Removing Autostart - User Guide

This guide explains how to remove the SawelaCapellaLodge Inventory System from automatic startup.

---

## Overview

The inventory system is currently configured to start automatically in two ways:
1. **Startup Folder** - Shortcuts added to Windows Startup folder
2. **Windows Services** - Background services using NSSM that start before login

These removal scripts will disable both autostart methods.

---

## Quick Start

### Option 1: Simple Batch Script (Recommended)
**Best for:** Most users

1. Right-click **`remove-autostart.bat`**
2. Select **"Run as administrator"**
3. Follow the prompts
4. Script will remove all autostart configurations

### Option 2: PowerShell Script with Logging
**Best for:** Advanced users who want detailed information

**Method A: Using Wrapper (Easiest)**
1. Right-click **`remove-autostart-ps.bat`**
2. Select **"Run as administrator"**
3. PowerShell window will open with detailed output

**Method B: Direct PowerShell**
1. Open PowerShell as Administrator
2. Navigate to the inventory system folder:
   ```powershell
   cd C:\Users\chris\Desktop\inventory-system
   ```
3. Run the script:
   ```powershell
   .\remove-autostart.ps1
   ```

---

## What Each Script Does

### remove-autostart.bat
- **Simple, no-frills batch script**
- Removes startup folder shortcuts
- Removes Windows Services (if they exist)
- Checks for running processes
- Works with basic Windows tools
- Best for quick removal

### remove-autostart.ps1
- **Advanced PowerShell script**
- Same functionality as .bat version
- Colored output for easier reading
- Better error handling and messaging
- Can run with or without admin privileges
- Supports command-line options:
  - `-Verbose` - Show detailed information
  - `-Force` - Skip confirmation prompts

### remove-autostart-ps.bat
- **Wrapper for PowerShell script**
- Automatically runs PowerShell as Administrator
- Simplest way to run the PowerShell version

---

## What Gets Removed

### Startup Folder Shortcuts
Removes from: `C:\Users\chris\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup`
- `SawelaCapella Startup.lnk`
- `SawelaCapella Startup (Advanced).lnk`

### Windows Services
If NSSM is installed, removes:
- `InventorySystemBackend` service
- `InventorySystemFrontend` service

Both services will be:
- Stopped (if running)
- Unregistered from Windows Service database
- No longer available for startup

---

## Verification

After running a removal script:

**Check Startup Folder:**
1. Press `Windows Key + R`
2. Type: `shell:startup`
3. Verify the SawelaCapella shortcuts are gone

**Check Windows Services:**
1. Press `Windows Key` and type "Services"
2. Search for `InventorySystemBackend` and `InventorySystemFrontend`
3. Both should not appear in the list

**Restart Computer:**
- Close all inventory system windows
- Restart your computer
- Verify that the system does NOT automatically start

---

## If Something Goes Wrong

### Admin Privileges Not Working
- Right-click the script
- Select "Run as administrator"
- Click "Yes" if prompted by User Account Control

### Can't Remove Services
- Ensure the services are not currently running:
  ```
  net stop InventorySystemBackend
  net stop InventorySystemFrontend
  ```
- Run the removal script again as Administrator

### Run in Safe Mode
If you're having permission issues:
1. Restart in Safe Mode with Command Prompt
2. Run `remove-autostart.bat`
3. Restart normally

---

## To Re-enable Autostart Later

If you want to automatically start the system again:

**Use:** `AUTOSTART_SETUP.md` file
**Or:** `SERVICE_SETUP.md` file

These documents explain how to set up autostart again when needed.

---

## Manual Startup

The system can still be started manually anytime:

**Simple Startup:**
```
start-system.bat
```

**Service Mode (Background):**
```
start-service.bat
```

---

## Important Notes

- **No Data Loss:** This only removes startup configuration, not your system files or data
- **Reversible:** You can set up autostart again at any time using the setup scripts
- **Safe:** These scripts are designed to be safe and only remove what they created
- **Requires Admin:** For Windows Services removal, you need administrator privileges

---

## Questions?

For detailed information about the system's autostart methods, see:
- [AUTOSTART_SETUP.md](AUTOSTART_SETUP.md) - Startup folder method details
- [SERVICE_SETUP.md](SERVICE_SETUP.md) - Windows Services method details
