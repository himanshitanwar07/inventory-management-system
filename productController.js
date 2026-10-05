// controllers/productController.js
// All the business logic for the Product/Inventory resource lives here.

const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create a new product
// @route   POST /api/products
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

// @desc    Get all products with filtering, sorting and pagination
// @route   GET /api/products
// @query   category, supplier, minPrice, maxPrice, search, inStock,
//          sort (e.g. "price" or "-price" or "price,-quantity"),
//          page, limit
const getAllProducts = asyncHandler(async (req, res) => {
  const { category, supplier, minPrice, maxPrice, search, inStock, sort } = req.query;

  // ---- Build filter object ----
  const filter = {};

  if (category) {
    filter.category = category;
  }

  if (supplier) {
    filter.supplier = supplier;
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (inStock === 'true') {
    filter.quantity = { $gt: 0 };
  } else if (inStock === 'false') {
    filter.quantity = { $lte: 0 };
  }

  if (search) {
    // case-insensitive search on name or sku
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ];
  }

  // ---- Sorting ----
  // Example: ?sort=price (ascending) or ?sort=-price (descending)
  // Multiple fields: ?sort=category,-price
  let sortBy = { createdAt: -1 }; // default: newest first
  if (sort) {
    sortBy = sort
      .split(',')
      .reduce((acc, field) => {
        if (field.startsWith('-')) {
          acc[field.substring(1)] = -1;
        } else {
          acc[field] = 1;
        }
        return acc;
      }, {});
  }

  // ---- Pagination ----
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter).sort(sortBy).skip(skip).limit(limit);

  res.status(200).json({
    total,
    page,
    totalPages: Math.ceil(total / limit),
    count: products.length,
    products,
  });
});

// @desc    Get a single product by ID
// @route   GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.status(200).json(product);
});

// @desc    Update product details (name, sku, category, price, quantity, etc.)
// @route   PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // return the updated document
    runValidators: true, // re-run schema validation on update
  });

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.status(200).json(product);
});

// @desc    Adjust stock safely (restock or sale) without overwriting the rest of the document
// @route   PATCH /api/products/:id/stock
// @body    { "change": 10 }   -> positive number to restock, negative number to record a sale
const updateStock = asyncHandler(async (req, res) => {
  const { change } = req.body;

  if (change === undefined || isNaN(change)) {
    res.status(400);
    throw new Error('Please provide a valid numeric "change" value');
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const newQuantity = product.quantity + Number(change);

  if (newQuantity < 0) {
    res.status(400);
    throw new Error(
      `Insufficient stock. Current quantity is ${product.quantity}, cannot reduce by ${Math.abs(change)}`
    );
  }

  product.quantity = newQuantity;
  await product.save();

  res.status(200).json({
    message: 'Stock updated',
    product,
  });
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.status(200).json({
    message: 'Product deleted',
    id: req.params.id,
  });
});

// @desc    Get all products whose quantity is at or below their reorderLevel
// @route   GET /api/products/low-stock
const getLowStockProducts = asyncHandler(async (req, res) => {
  // $expr lets us compare two fields of the same document to each other
  const lowStockItems = await Product.find({
    $expr: { $lte: ['$quantity', '$reorderLevel'] },
  });

  res.status(200).json({
    count: lowStockItems.length,
    lowStockItems,
  });
});

// @desc    Category-wise inventory summary using the MongoDB aggregation pipeline
// @route   GET /api/products/summary
const getCategorySummary = asyncHandler(async (req, res) => {
  const summary = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        totalItems: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        totalStockValue: { $sum: { $multiply: ['$price', '$quantity'] } },
        avgPrice: { $avg: '$price' },
      },
    },
    { $sort: { totalStockValue: -1 } },
  ]);

  res.status(200).json({
    categories: summary.length,
    summary,
  });
});

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  updateStock,
  deleteProduct,
  getLowStockProducts,
  getCategorySummary,
};
