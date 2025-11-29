import express from 'express';
import authRoutes from './auth.routes.js';
import projectRoutes from './project.routes.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);

export default router;
