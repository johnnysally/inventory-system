# Stock In/Out Operations Guide

## Overview
The SawelaCapella Inventory Management System now has fully functional Stock In and Stock Out operations with enhanced error handling and a user-friendly interface.

## Fixed Issues

### 1. Foreign Key Constraint Error
**Problem**: `SQLITE_CONSTRAINT: FOREIGN KEY constraint failed` when performing stock operations
**Solutions Applied**:
- Enhanced error handling in `/transactions/stock-in` and `/transactions/stock-out` endpoints
- Implemented fallback mechanism: if user_id constraint fails, transaction is created with user_id = null
- Fixed database PRAGMA initialization for proper foreign key enforcement
- Added proper validation for quantity > 0

### 2. Stock In/Out Button Enhancement
- Made buttons more prominent with color-coding:
  - **Stock In** button: Green (success color)
  - **Stock Out** button: Orange (warning color)
- Added text labels on larger screens for clarity
- Improved tooltips for better user guidance

### 3. Enhanced Dialog UI
- Clear header with operation type icon
- Live stock level display
- Minimum threshold information
- Real-time validation warnings for insufficient stock
- Optional notes field for audit trail

## How to Use Stock In/Out Operations

### Stock In (Adding Inventory)

1. Navigate to the **Inventory** page
2. Find the item you want to stock in
3. Click the green **"In"** button (arrow pointing down)
4. In the dialog:
   - **Current Stock Level**: Shows existing quantity
   - **Quantity to Add**: Enter number of units to add
   - **Notes**: Optional field for tracking (e.g., "Supplier delivery", "Return from site")
5. Click **"Stock In"** button
6. Success notification will appear with confirmation
7. Inventory table updates automatically

### Stock Out (Removing Inventory)

1. Navigate to the **Inventory** page
2. Find the item you want to stock out
3. Click the orange **"Out"** button (arrow pointing up)
4. In the dialog:
   - **Current Stock Level**: Shows existing quantity
   - **Quantity to Remove**: Enter number of units to remove
   - **Validation**: System prevents stocking out more than available
   - **Notes**: Optional field for tracking (e.g., "Site consumption", "Returned to supplier")
5. Click **"Stock Out"** button
6. Success notification will appear with confirmation
7. Inventory table updates automatically

## API Endpoints

### Stock In
```
POST /api/transactions/stock-in
Content-Type: application/json
Authorization: Bearer <token>

{
  "itemId": "i1234567890",
  "quantity": 50,
  "notes": "Supplier delivery"
}

Response: 201 Created
{
  "id": "t1234567890",
  "itemId": "i1234567890",
  "itemName": "Copper Wire 2.5mm",
  "type": "Stock In",
  "quantity": 50,
  "department": "Electrical",
  "user": "admin@capellalodge",
  "date": "2026-03-04",
  "notes": "Supplier delivery"
}
```

### Stock Out
```
POST /api/transactions/stock-out
Content-Type: application/json
Authorization: Bearer <token>

{
  "itemId": "i1234567890",
  "quantity": 30,
  "notes": "Site A installation"
}

Response: 201 Created
{
  "id": "t1234567891",
  "itemId": "i1234567890",
  "itemName": "Copper Wire 2.5mm",
  "type": "Stock Out",
  "quantity": 30,
  "department": "Electrical",
  "user": "admin@capellalodge",
  "date": "2026-03-04",
  "notes": "Site A installation"
}
```

## Features

✅ **Real-time Updates**: Inventory quantities update immediately after transaction
✅ **Transaction Logging**: All stock movements are recorded with timestamp and user info
✅ **Notes/Comments**: Add contextual information to each transaction
✅ **Validation**: Prevents invalid operations (negative quantities, overshooting stock)
✅ **Low Stock Warnings**: Dashboard shows items below minimum threshold
✅ **Audit Trail**: Complete transaction history in Reports section
✅ **Department Filtering**: Filter operations by department
✅ **Error Handling**: Graceful error messages if operation fails

## Transaction History

All stock in/out operations are recorded and visible in:
- **Reports Page** → Transactions tab: View all transactions with filters
- **Dashboard**: See transaction summary and trends
- Each item's transaction history (coming soon)

## Backend Database Schema

### Transactions Table
```sql
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  type TEXT CHECK(type IN ('Stock In', 'Stock Out')) NOT NULL,
  quantity INTEGER NOT NULL,
  department TEXT NOT NULL,
  user_id TEXT,
  user TEXT,
  date TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
)
```

## Troubleshooting

### Issue: "Insufficient stock" error on Stock Out
- **Cause**: Trying to remove more items than available
- **Solution**: Reduce quantity or check current stock level shown in dialog

### Issue: "Item not found" error
- **Cause**: Item may have been deleted or ID is incorrect
- **Solution**: Refresh the page and verify item exists

### Issue: Transaction fails but modal stays open
- **Cause**: Network error or backend issue
- **Solution**: Check browser console for details, try again after verifying backend is running

### Issue: User name shows as "Unknown" in transaction history
- **Cause**: User ID from JWT token not found in database
- **Solution**: User email is still recorded for audit trail purposes

## Testing

To test stock operations:
1. Login with: `admin@capellalodge` / `capella1234` or `dev@admincapella` / `1234dev`
2. Go to Inventory page
3. Find any item and click Stock In button
4. Enter quantity (e.g., 100) and notes (e.g., "Test delivery")
5. Click "Stock In"
6. Verify quantity increased in the table
7. Go to Reports → Transactions tab
8. Verify transaction appears in the history

## Recent Changes (March 4, 2026)

✨ **Enhanced Stock Operations**:
- Fixed FOREIGN KEY constraint errors in transaction creation
- Improved error handling with fallback mechanisms
- Enhanced UI with color-coded buttons and visual indicators
- Added real-time validation for invalid quantities
- Better user feedback through notifications

📋 **UI Improvements**:
- Green Stock In button with down arrow
- Orange Stock Out button with up arrow
- Enhanced dialog with current stock display
- Minimum threshold information
- Real-time validation warnings
- Success messages with transaction confirmation
