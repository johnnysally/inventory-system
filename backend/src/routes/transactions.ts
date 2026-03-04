import { Router, Response } from 'express';
import { TransactionModel } from '../models/Transaction.js';
import { InventoryItemModel } from '../models/InventoryItem.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Get all transactions
router.get(
  '/',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const department = req.query.department as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

    const transactions = await TransactionModel.getAll(department, limit, offset);
    res.json(transactions);
  })
);

// Get transactions for item
router.get(
  '/item/:itemId',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const transactions = await TransactionModel.getByItemId(req.params.itemId);
    res.json(transactions);
  })
);

// Get transaction stats
router.get(
  '/stats',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const department = req.query.department as string | undefined;
    const stats = await TransactionModel.getStats(department);
    res.json(stats);
  })
);

// Create stock in transaction
router.post(
  '/stock-in',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { itemId, quantity, notes } = req.body;

    if (!itemId || !quantity) {
      res.status(400).json({ error: 'itemId and quantity required' });
      return;
    }

    if (quantity <= 0) {
      res.status(400).json({ error: 'Quantity must be greater than 0' });
      return;
    }

    const item = await InventoryItemModel.findById(itemId);
    if (!item) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    try {
      // Update inventory
      await InventoryItemModel.update(itemId, {
        quantity: item.quantity + quantity,
      });

      // Create transaction - use email as fallback if id is not available
      const transaction = await TransactionModel.create(
        itemId,
        item.name,
        'Stock In',
        quantity,
        item.department,
        req.user?.email || 'Unknown',
        req.user?.id, // undefined if not available
        notes
      );

      res.status(201).json(transaction);
    } catch (error: any) {
      // If foreign key constraint fails due to user_id, retry without user_id
      if (error.message?.includes('FOREIGN KEY')) {
        const transaction = await TransactionModel.create(
          itemId,
          item.name,
          'Stock In',
          quantity,
          item.department,
          req.user?.email || 'Unknown',
          undefined, // No user_id
          notes
        );
        res.status(201).json(transaction);
      } else {
        throw error;
      }
    }
  })
);

// Create stock out transaction
router.post(
  '/stock-out',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { itemId, quantity, notes } = req.body;

    if (!itemId || !quantity) {
      res.status(400).json({ error: 'itemId and quantity required' });
      return;
    }

    if (quantity <= 0) {
      res.status(400).json({ error: 'Quantity must be greater than 0' });
      return;
    }

    const item = await InventoryItemModel.findById(itemId);
    if (!item) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    if (item.quantity < quantity) {
      res.status(400).json({ error: 'Insufficient stock' });
      return;
    }

    try {
      // Update inventory
      await InventoryItemModel.update(itemId, {
        quantity: Math.max(0, item.quantity - quantity),
      });

      // Create transaction - use email as fallback if id is not available
      const transaction = await TransactionModel.create(
        itemId,
        item.name,
        'Stock Out',
        quantity,
        item.department,
        req.user?.email || 'Unknown',
        req.user?.id, // undefined if not available
        notes
      );

      res.status(201).json(transaction);
    } catch (error: any) {
      // If foreign key constraint fails due to user_id, retry without user_id
      if (error.message?.includes('FOREIGN KEY')) {
        const transaction = await TransactionModel.create(
          itemId,
          item.name,
          'Stock Out',
          quantity,
          item.department,
          req.user?.email || 'Unknown',
          undefined, // No user_id
          notes
        );
        res.status(201).json(transaction);
      } else {
        throw error;
      }
    }
  })
);

// Delete transaction
router.delete(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'Transaction ID required' });
      return;
    }

    // Note: TransactionModel.delete would need to be implemented
    // For now, we just delete from the database directly
    const query = 'DELETE FROM transactions WHERE id = ?';
    
    try {
      const { dbRun } = await import('../utils/db.js');
      await dbRun(query, [id]);
      res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete transaction' });
    }
  })
);

export default router;
