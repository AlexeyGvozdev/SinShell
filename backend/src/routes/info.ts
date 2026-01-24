import { Router } from 'express';
import {
  getSystemInfo,
  getApiInfo,
  getServerStatus,
} from '../controllers/infoController';

const router = Router();

/**
 * @route   GET /api/v1/info
 * @desc    Get system information
 * @access  Public
 */
router.get('/', getSystemInfo);

/**
 * @route   GET /api/v1/info/api
 * @desc    Get API information
 * @access  Public
 */
router.get('/api', getApiInfo);

/**
 * @route   GET /api/v1/info/server
 * @desc    Get server status
 * @access  Public
 */
router.get('/server', getServerStatus);

export default router;