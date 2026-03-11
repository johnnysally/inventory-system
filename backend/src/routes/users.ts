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

// Create user (admin or developer user only)
router.post(
  '/',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // Check if user is admin or the developer user
    const isDeveloper = req.user?.email === 'dev@admincapella';
    const isAdmin = req.user?.role === 'Admin';
    
    if (!isDeveloper && !isAdmin) {
      res.status(403).json({ error: 'Unauthorized: Only admins or developer can create users' });
      return;
    }

    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ error: 'Name, email, password, and role required' });
      return;
    }

    if (!['Admin', 'Staff'].includes(role)) {
      res.status(400).json({ error: 'Role must be either Admin or Staff' });
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

// Update user (admin, developer, or self)
router.put(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // Check if user has permission: admin, developer, or updating self
    const isDeveloper = req.user?.email === 'dev@admincapella';
    const isAdmin = req.user?.role === 'Admin';
    const isSelf = req.user?.id === req.params.id;

    if (!isSelf && !isAdmin && !isDeveloper) {
      res.status(403).json({ error: 'Unauthorized: Cannot update other users' });
      return;
    }

    const user = await UserModel.findById(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { name, email, password, role } = req.body;
    const updates: any = {};

    if (name) updates.name = name;
    if (email && email !== user.email) {
      const existing = await UserModel.findByEmail(email);
      if (existing) {
        res.status(400).json({ error: 'Email already exists' });
        return;
      }
      updates.email = email;
    }
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }
    if (role && (isAdmin || isDeveloper)) {
      if (!['Admin', 'Staff'].includes(role)) {
        res.status(400).json({ error: 'Role must be either Admin or Staff' });
        return;
      }
      updates.role = role;
    }

    await UserModel.update(req.params.id, updates);
    const updated = await UserModel.findById(req.params.id);
    const { password: _, ...userWithoutPassword } = updated!;
    res.json(userWithoutPassword);
  })
);

// Delete user (admin or developer only)
router.delete(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // Check if user is admin or developer
    const isDeveloper = req.user?.email === 'dev@admincapella';
    const isAdmin = req.user?.role === 'Admin';

    if (!isAdmin && !isDeveloper) {
      res.status(403).json({ error: 'Unauthorized: Only admins or developer can delete users' });
      return;
    }

    const user = await UserModel.findById(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Prevent deleting the developer user themselves
    if (req.params.id === req.user?.id) {
      res.status(400).json({ error: 'Cannot delete your own account' });
      return;
    }

    await UserModel.delete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  })
);

export default router;
