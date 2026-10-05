// routes/productRoutes.js
// All routes for the Product/Inventory resource, mounted at /api/products in server.js

const express = require('express');
const router = express.Router();

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  updateStock,
  deleteProduct,
  getLowStockProducts,
  getCategorySummary,
} = require('../controllers/productController');

// NOTE: Specific routes like /low-stock and /summary MUST be declared
// BEFORE the dynamic /:id route. Otherwise Express will treat
// "low-stock" or "summary" as if they were a product ID.

// GET /api/products/low-stock  -> products at or below reorder level
router.get('/low-stock', getLowStockProducts);

// GET /api/products/summary    -> category-wise aggregation report
router.get('/summary', getCategorySummary);

// POST /api/products           -> create a new product
// GET  /api/products           -> get all products (filter/sort/paginate)
router.route('/').post(createProduct).get(getAllProducts);

// PATCH /api/products/:id/stock -> restock or sell (safe quantity adjustment)
router.patch('/:id/stock', updateStock);

// GET    /api/products/:id -> get single product
// PUT    /api/products/:id -> update product details
// DELETE /api/products/:id -> delete product
router
  .route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

module.exports = router;
