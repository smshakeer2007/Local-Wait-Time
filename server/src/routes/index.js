import express from 'express';
import healthRoutes from './healthRoutes.js';
import placeRoutes from './placeRoutes.js';

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/places', placeRoutes);

export default router;
