import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.js';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Get all users
router.get(
  '/',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const users = await UserModel.getAll();
    res.json(users);
  })
);

// Get user by ID
router.get(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  })
);

// Create user (admin only)
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ error: 'Name, email, password, and role required' });
      return;
    }

    const existing = await UserModel.findByEmail(email);
    if (existing) {
      res.status(400).json({ error: 'Email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create(name, email, hashedPassword, role);
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  })
);

// Update user (admin or self)
router.put(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user?.id !== req.params.id && req.user?.role !== 'Admin') {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const user = await UserModel.findById(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { name, email, role } = req.body;
    const updates: any = {};
    
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role && req.user?.role === 'Admin') updates.role = role;

    await UserModel.update(req.params.id, updates);
    const updated = await UserModel.findById(req.params.id);
    const { password, ...userWithoutPassword } = updated!;
    res.json(userWithoutPassword);
  })
);

// Delete user (admin only)
router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await UserModel.delete(req.params.id);
    res.json({ message: 'User deleted' });
  })
);

export default router;
