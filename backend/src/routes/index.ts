import { Router } from 'express';
import healthRoutes from './health';
import infoRoutes from './info';
import aboutRoutes from './about';

const router = Router();

/**
 * @route   GET /api/v1
 * @desc    API root endpoint
 * @access  Public
 */
router.get('/', (req, res) => {
  const timestamp = new Date().toISOString();
  
  res.json({
    success: true,
    message: 'SinShell API v1',
    version: '1.0.0',
    description: 'Backend API for SinShell terminal-styled website',
    endpoints: {
      health: '/health',
      info: '/info',
      about: '/about',
    },
    documentation: `${req.protocol}://${req.get('host')}/docs`,
    timestamp,
  });
});

/**
 * Health check routes
 */
router.use('/health', healthRoutes);

/**
 * System information routes
 */
router.use('/info', infoRoutes);

/**
 * Project information routes
 */
router.use('/about', aboutRoutes);

export default router;