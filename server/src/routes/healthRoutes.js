import express from 'express';

const router = express.Router();

/**
 * GET /api/health
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  });
});

export default router;
