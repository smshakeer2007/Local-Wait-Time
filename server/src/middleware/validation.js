import mongoose from 'mongoose';
import { body, query, param, validationResult } from 'express-validator';
import { PLACE_CATEGORIES } from '../models/Place.js';
import { DAY_TYPES } from '../utils/timeBuckets.js';

/**
 * Middleware that checks validation results and rejects with 400 field-level errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = {};
    for (const err of errors.array()) {
      const field = err.path || err.param || 'unknown';
      if (!details[field]) {
        details[field] = err.msg;
      }
    }
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details
      }
    });
  }
  next();
};

/**
 * Checks for unknown/unexpected fields in request body
 */
export const rejectExtraFields = (allowedFields) => (req, res, next) => {
  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
    const extraKeys = Object.keys(req.body).filter((key) => !allowedFields.includes(key));
    if (extraKeys.length > 0) {
      const details = {};
      extraKeys.forEach((key) => {
        details[key] = `Field '${key}' is not allowed`;
      });
      return res.status(400).json({
        success: false,
        error: {
          message: 'Request contains disallowed fields',
          details
        }
      });
    }
  }
  next();
};

/**
 * Validates ObjectId parameter
 */
export const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .trim()
    .notEmpty()
    .withMessage(`${paramName} parameter is required`)
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage(`Invalid ${paramName}: must be a valid 24-character hexadecimal ObjectId`),
  handleValidationErrors
];

/**
 * Validates POST /api/places body
 */
export const validateCreatePlace = [
  rejectExtraFields(['name', 'category', 'address']),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Place name is required')
    .isLength({ min: 2, max: 80 })
    .withMessage('Place name must be between 2 and 80 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(PLACE_CATEGORIES)
    .withMessage(`Category must be one of: ${PLACE_CATEGORIES.join(', ')}`),
  body('address')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 160 })
    .withMessage('Address cannot exceed 160 characters'),
  handleValidationErrors
];

/**
 * Validates POST /api/places/:id/reports body
 */
export const validateCreateReport = [
  rejectExtraFields(['waitMinutes', 'visitedAt', 'note']),
  body('waitMinutes')
    .notEmpty()
    .withMessage('waitMinutes is required')
    .custom((val) => {
      const num = Number(val);
      if (isNaN(num) || !Number.isInteger(num)) {
        throw new Error('waitMinutes must be an integer');
      }
      if (num < 0 || num > 240) {
        throw new Error('waitMinutes must be between 0 and 240 minutes');
      }
      return true;
    }),
  body('visitedAt')
    .notEmpty()
    .withMessage('visitedAt is required')
    .isISO8601()
    .withMessage('visitedAt must be a valid ISO 8601 date string')
    .toDate()
    .custom((date) => {
      const now = Date.now();
      const fiveMinFuture = now + 5 * 60 * 1000;
      if (date.getTime() > fiveMinFuture) {
        throw new Error('visitedAt cannot be in the future');
      }
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
      if (date.getTime() < thirtyDaysAgo) {
        throw new Error('visitedAt cannot be older than 30 days');
      }
      return true;
    }),
  body('note')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('note must be a string')
    .trim()
    .isLength({ max: 200 })
    .withMessage('note cannot exceed 200 characters'),
  handleValidationErrors
];

/**
 * Validates GET /api/places query parameters
 */
export const validateGetPlacesQuery = [
  query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query cannot exceed 100 characters'),
  query('category')
    .optional({ values: 'falsy' })
    .isIn(PLACE_CATEGORIES)
    .withMessage(`Category must be one of: ${PLACE_CATEGORIES.join(', ')}`),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

/**
 * Validates GET /api/places/:id/stats query parameters
 */
export const validateGetStatsQuery = [
  query('dayType')
    .optional({ values: 'falsy' })
    .isIn([...DAY_TYPES, 'All'])
    .withMessage(`dayType must be one of: ${DAY_TYPES.join(', ')}, All`),
  handleValidationErrors
];

/**
 * Validates GET /api/places/:id/reports query parameters
 */
export const validateGetReportsQuery = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  handleValidationErrors
];
