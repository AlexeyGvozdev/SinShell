import { Router } from 'express';
import {
  getHealth,
  getDetailedHealth,
  getReadiness,
  getLiveness,
} from '../controllers/healthController';

const router = Router();

/**
 * @route   GET /api/v1/health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', getHealth);

/**
 * @route   GET /api/v1/health/detailed
 * @desc    Detailed health check with system info
 * @access  Public
 */
router.get('/detailed', getDetailedHealth);

/**
 * @route   GET /api/v1/health/ready
 * @desc    Readiness probe
 * @access  Public
 */
router.get('/ready', getReadiness);

/**
 * @route   GET /api/v1/health/live
 * @desc    Liveness probe
 * @access  Public
 */
router.get('/live', getLiveness);

export default router;