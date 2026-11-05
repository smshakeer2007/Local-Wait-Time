import rateLimit from 'express-rate-limit';

export const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 30, // 30 requests per 15 min per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP address, please try again in 15 minutes.'
    }
  }
});
