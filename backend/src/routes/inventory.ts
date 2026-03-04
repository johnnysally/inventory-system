import { Router, Response } from 'express';
import { InventoryItemModel } from '../models/InventoryItem.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Get all inventory items
router.get(
  '/',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const department = req.query.department as string | undefined;
    const items = await InventoryItemModel.getAll(department);
    res.json(items);
  })
);

// Search inventory items
router.get(
  '/search',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const query = req.query.q as string;
    const department = req.query.department as string | undefined;

    if (!query) {
      res.status(400).json({ error: 'Search query required' });
      return;
    }

    const items = await InventoryItemModel.search(query, department);
    res.json(items);
  })
);

// Get item by ID
router.get(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const item = await InventoryItemModel.findById(req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }
    res.json(item);
  })
);

// Create item
router.post(
  '/',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, department, quantity, minThreshold, specification, unit } = req.body;

    if (!name || !department || quantity === undefined) {
      res.status(400).json({ error: 'Name, department, and quantity required' });
      return;
    }

    const item = await InventoryItemModel.create(
      name,
      department,
      quantity,
      minThreshold || 10,
      specification || '',
      unit || 'units'
    );

    res.status(201).json(item);
  })
);

// Update item
router.put(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const item = await InventoryItemModel.findById(req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    const { name, department, quantity, minThreshold, specification, unit } = req.body;
    const updates: any = {};

    if (name !== undefined) updates.name = name;
    if (department !== undefined) updates.department = department;
    if (quantity !== undefined) updates.quantity = quantity;
    if (minThreshold !== undefined) updates.minThreshold = minThreshold;
    if (specification !== undefined) updates.specification = specification;
    if (unit !== undefined) updates.unit = unit;

    await InventoryItemModel.update(req.params.id, updates);
    const updated = await InventoryItemModel.findById(req.params.id);
    res.json(updated);
  })
);

// Delete item
router.delete(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const item = await InventoryItemModel.findById(req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    await InventoryItemModel.delete(req.params.id);
    res.json({ message: 'Item deleted' });
  })
);

export default router;
