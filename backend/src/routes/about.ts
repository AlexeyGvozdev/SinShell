import { Router } from 'express';
import {
  getAbout,
  getExtendedAbout,
  getLicense,
} from '../controllers/aboutController';

const router = Router();

/**
 * @route   GET /api/v1/about
 * @desc    Get basic project information
 * @access  Public
 */
router.get('/', getAbout);

/**
 * @route   GET /api/v1/about/extended
 * @desc    Get extended project information
 * @access  Public
 */
router.get('/extended', getExtendedAbout);

/**
 * @route   GET /api/v1/about/license
 * @desc    Get license information
 * @access  Public
 */
router.get('/license', getLicense);

export default router;