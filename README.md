# Inventory and Data Management System

Lab Assignment 3 — Web Dev III (Unit 3).
A RESTful backend built with **Node.js, Express.js, MongoDB, and Mongoose** that lets a
store/warehouse manage its product catalogue — create products, adjust stock,
filter/search/paginate the catalogue, and generate inventory reports using
aggregation pipelines.

## Tech Stack
- Node.js
- Express.js
- MongoDB (NoSQL database)
- Mongoose (schema, validation, querying)
- dotenv (environment variable management)

## Project Structure
```
inventory-management-system/
├── config/
│   └── db.js                 # MongoDB connection using Mongoose
├── models/
│   └── Product.js             # Mongoose schema + field-level validation
├── controllers/
│   └── productController.js   # All business logic (CRUD, filtering, aggregation)
├── routes/
│   └── productRoutes.js       # API route definitions
├── middleware/
│   ├── asyncHandler.js        # Wraps async controllers to forward errors
│   └── errorHandler.js        # Centralized error handling + 404 handler
├── server.js                  # App entry point
├── package.json
├── .env                       # Environment variables (already filled in for local MongoDB)
├── .env.example                # Template showing required variables
└── README.md
```

## Setup Instructions

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
A `.env` file is already included, pointing to a local MongoDB instance:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/inventory_db
```
If you're using MongoDB Atlas (cloud) instead, replace `MONGO_URI` with your
own connection string (see `.env.example` for the format).

### 3. Make sure MongoDB is running
If using local MongoDB, start it (e.g. `mongod`, or via MongoDB Compass /
the MongoDB service on your machine) before starting the server.

### 4. Run the server
```bash
npm start
```
or, for auto-restart on file changes during development:
```bash
npm run dev
```

You should see:
```
MongoDB Connected: 127.0.0.1
Server running on http://localhost:5000
```

## API Endpoints

Base URL: `http://localhost:5000/api/products`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/products` | Create a new product |
| GET    | `/api/products` | Get all products (supports filtering, sorting, pagination) |
| GET    | `/api/products/low-stock` | Get products at or below their reorder level |
| GET    | `/api/products/summary` | Category-wise inventory summary (aggregation) |
| GET    | `/api/products/:id` | Get a single product by ID |
| PUT    | `/api/products/:id` | Update product details |
| PATCH  | `/api/products/:id/stock` | Adjust stock (restock or sale) |
| DELETE | `/api/products/:id` | Delete a product |

### 1. Create Product — `POST /api/products`
```json
{
  "name": "Gel Pen Pack of 15",
  "sku": "STNY-PN-713",
  "category": "Stationery",
  "price": 120,
  "quantity": 40,
  "reorderLevel": 20,
  "supplier": "Cello Pens"
}
```

### 2. Get All Products — `GET /api/products`
Supports query parameters:
- `category` — filter by category (e.g. `?category=Furniture`)
- `supplier` — filter by supplier
- `minPrice`, `maxPrice` — filter by price range (e.g. `?minPrice=100&maxPrice=5000`)
- `inStock` — `true` or `false`
- `search` — case-insensitive search on name or SKU (e.g. `?search=table`)
- `sort` — sort by field(s), prefix with `-` for descending (e.g. `?sort=-price` or `?sort=category,-price`)
- `page`, `limit` — pagination (e.g. `?page=2&limit=5`)

Example:
```
GET /api/products?category=Furniture&sort=-price&page=1&limit=10
```

### 3. Get Single Product — `GET /api/products/:id`

### 4. Update Product — `PUT /api/products/:id`
```json
{
  "price": 140,
  "quantity": 60
}
```

### 5. Adjust Stock (Restock/Sale) — `PATCH /api/products/:id/stock`
```json
{ "change": 10 }
```
Use a positive number to restock, a negative number to record a sale.
The API prevents quantity from ever going below 0.

### 6. Delete Product — `DELETE /api/products/:id`

### 7. Low-Stock Alert Report — `GET /api/products/low-stock`
Returns every product where `quantity <= reorderLevel`.

### 8. Category-wise Inventory Summary — `GET /api/products/summary`
Returns, for each category:
- `totalItems` — number of distinct products
- `totalQuantity` — total units in stock
- `totalStockValue` — sum of (price × quantity)
- `avgPrice` — average price

## Concepts Covered
Mongoose Schema Design, Field-Level Validation, RESTful CRUD, Query
Parameters, Filtering, Sorting, Pagination, Aggregation Pipelines,
Middleware, Centralized Error Handling, dotenv Configuration.
