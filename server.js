// server.js
// Entry point of the application. Sets up Express, connects to MongoDB,
// and wires up routes and centralized error handling.

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Load environment variables from .env
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Built-in middleware to parse incoming JSON request bodies
app.use(express.json());

// Simple request logger (helps while testing in Postman)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Root route - quick sanity check
app.get('/', (req, res) => {
  res.send('Inventory and Data Management System API is running...');
});

// Product routes
app.use('/api/products', productRoutes);

// 404 handler for unknown routes
app.use(notFound);

// Centralized error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
