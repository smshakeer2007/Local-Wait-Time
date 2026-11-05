/**
 * Wraps async Express handlers to catch unhandled rejections and forward to next()
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
