import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler, asyncHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import inventoryRoutes from './routes/inventory.js';
import transactionRoutes from './routes/transactions.js';
import reportRoutes from './routes/reports.js';
import { db } from './utils/db.js';
import { initDatabase } from './utils/initDb.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:8080,http://localhost:8081').split(',');

// Middleware
app.use(cors({ origin: corsOrigins }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    console.log('📋 Initializing database...');
    await initDatabase();
    console.log('✅ Database initialized\n');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`🚀 SawelaCapella Backend Server`);
    console.log(`📍 Running on http://localhost:${port}`);
    console.log(`🔓 CORS enabled for ${corsOrigins.join(', ')}\n`);
  });
}

startServer();
