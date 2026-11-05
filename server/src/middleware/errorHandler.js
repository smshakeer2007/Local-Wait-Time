import { env } from '../config/env.js';

/**
 * 404 Not Found middleware for unmatched routes
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Endpoint ${req.method} ${req.originalUrl} not found`
    }
  });
};

/**
 * Central Error-handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || res.statusCode;
  if (!statusCode || statusCode < 400) {
    statusCode = 500;
  }

  let message = err.message || 'Internal server error';
  let details = err.details || undefined;

  // Handle Mongoose Duplicate Key Error (code 11000) -> 409 Conflict
  if (err.code === 11000) {
    statusCode = 409;
    const duplicatedFields = Object.keys(err.keyPattern || err.keyValue || {});
    message = 'A place with this name and address already exists';
    details = {
      fields: duplicatedFields,
      duplicateValues: err.keyValue
    };
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Database validation failed';
    details = {};
    for (const key in err.errors) {
      details[key] = err.errors[key].message;
    }
  }

  const response = {
    success: false,
    error: {
      message,
      ...(details && { details })
    }
  };

  // Only include stack trace if in non-production environment
  if (env.NODE_ENV !== 'production' && statusCode === 500) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
