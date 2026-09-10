import express from 'express';
import cors from 'cors';
import path from 'path';
import { CONFIG } from './config';
import { db } from './db/jsonDb';
import { seedDatabase } from './db/seed';
import authRoutes from './routes/auth.routes';
import listingsRoutes from './routes/listings.routes';
import claimsRoutes from './routes/claims.routes';
import volunteerRoutes from './routes/volunteer.routes';
import adminRoutes from './routes/admin.routes';
import auditRoutes from './routes/audit.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    platform: 'FoodLink Platform',
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/claims', claimsRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/audit-logs', auditRoutes);

// Serve static frontend build in production
const frontendBuildPath = path.join(__dirname, '../../dist');
app.use(express.static(frontendBuildPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(frontendBuildPath, 'index.html');
  if (require('fs').existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  return res.send('FoodLink API Server is running on http://localhost:' + CONFIG.PORT);
});

// Global Error Handler
app.use(errorHandler);

// Bootstrap
const startServer = async () => {
  // Check if DB needs seed
  const data = db.getData();
  if (!data.users || data.users.length === 0) {
    console.log('No users found in database. Seeding initial data...');
    await seedDatabase();
  }

  app.listen(CONFIG.PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 FoodLink Server running on http://localhost:${CONFIG.PORT}`);
    console.log(`==================================================`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start FoodLink server:', err);
});
