import express from 'express';
import {
  getPlaces,
  createPlace,
  getPlaceById
} from '../controllers/placeController.js';
import {
  createReport,
  getReportsByPlace
} from '../controllers/reportController.js';
import { getPlaceStats } from '../controllers/statsController.js';
import {
  validateCreatePlace,
  validateCreateReport,
  validateObjectId,
  validateGetPlacesQuery,
  validateGetStatsQuery,
  validateGetReportsQuery
} from '../middleware/validation.js';
import { postLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// GET /api/places
router.get('/', validateGetPlacesQuery, getPlaces);

// POST /api/places
router.post('/', postLimiter, validateCreatePlace, createPlace);

// GET /api/places/:id
router.get('/:id', validateObjectId('id'), getPlaceById);

// GET /api/places/:id/stats
router.get('/:id/stats', validateObjectId('id'), validateGetStatsQuery, getPlaceStats);

// GET /api/places/:id/reports
router.get('/:id/reports', validateObjectId('id'), validateGetReportsQuery, getReportsByPlace);

// POST /api/places/:id/reports
router.post(
  '/:id/reports',
  postLimiter,
  validateObjectId('id'),
  validateCreateReport,
  createReport
);

export default router;
