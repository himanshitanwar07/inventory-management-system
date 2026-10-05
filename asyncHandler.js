// middleware/asyncHandler.js
// Wraps an async controller function so that any error inside it
// is automatically passed to Express's error handling middleware (next(err))
// instead of writing try/catch in every single controller.

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
