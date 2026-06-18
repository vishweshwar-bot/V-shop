/**
 * Middleware to handle exceptions inside async Express routes.
 * Avoids verbose try-catch nesting.
 * @param {Function} fn - Async Express middleware function.
 * @returns {Function} Express middleware wrapper.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
