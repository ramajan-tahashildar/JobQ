import express from 'express';
import { createJob, getJob, listJobs, healthCheck } from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Health check (public)
router.get('/health', healthCheck);

// Protected routes
router.post('/', protect, createJob);
router.get('/:id', protect, getJob);
router.get('/', protect, listJobs);

export default router;

