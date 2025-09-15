const express = require("express");
const {
  getProductsBySubCategories,
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/item.controller");

const router = express.Router();
// ─── Filtered/Fancy Routes ─────────────────────────────────
// Subcategory-wise products
router.get("/subcategories", getProductsBySubCategories);

// ─── Item CRUD Routes ───────────────────────────────────────
// Create item
router.post("/create", createProduct);
// Get all items
router.get("/", getAllProducts);
// Get item by ID
router.get("/:id", getProductById);
// Update item by ID
router.put("/id/:id", updateProduct);
// Delete item by ID
router.delete("/id/:id", deleteProduct);

exports = module.exports = router;
