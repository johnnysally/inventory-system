import { Router, Response } from 'express';
import { InventoryItemModel } from '../models/InventoryItem.js';
import { TransactionModel } from '../models/Transaction.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Get inventory report
router.get(
  '/inventory',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const department = req.query.department as string | undefined;
    const items = await InventoryItemModel.getAll(department);
    
    const report = {
      generated_at: new Date().toISOString(),
      department: department || 'All Departments',
      total_items: items.length,
      total_stock: items.reduce((sum, item) => sum + item.quantity, 0),
      low_stock_items: items.filter(item => item.quantity <= item.minThreshold).length,
      items,
    };

    res.json(report);
  })
);

// Get low stock report
router.get(
  '/low-stock',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const department = req.query.department as string | undefined;
    const items = await InventoryItemModel.getAll(department);
    const lowStockItems = items.filter(item => item.quantity <= item.minThreshold);

    const report = {
      generated_at: new Date().toISOString(),
      department: department || 'All Departments',
      low_stock_count: lowStockItems.length,
      items: lowStockItems,
    };

    res.json(report);
  })
);

// Get transactions report
router.get(
  '/transactions',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const department = req.query.department as string | undefined;
    const transactions = await TransactionModel.getAll(department);
    const stats = await TransactionModel.getStats(department);

    const report = {
      generated_at: new Date().toISOString(),
      department: department || 'All Departments',
      stats,
      transactions,
    };

    res.json(report);
  })
);

// Get dashboard stats
router.get(
  '/dashboard',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const items = await InventoryItemModel.getAll();
    const transactions = await TransactionModel.getAll();
    const stats = await TransactionModel.getStats();

    const departments = ['Electrical', 'Plumbing', 'General Construction', 'Landscaping'];
    const deptData = departments.map((dept: string) => {
      const deptItems = items.filter(i => i.department === dept);
      return {
        name: dept === 'General Construction' ? 'Gen. Const.' : dept,
        fullName: dept,
        items: deptItems.length,
        stock: deptItems.reduce((s, i) => s + i.quantity, 0),
      };
    });

    const report = {
      generated_at: new Date().toISOString(),
      total_items: items.length,
      total_stock: items.reduce((sum, item) => sum + item.quantity, 0),
      low_stock_items: items.filter(item => item.quantity <= item.minThreshold).length,
      total_transactions: transactions.length,
      stats,
      departments: deptData,
    };

    res.json(report);
  })
);

export default router;
