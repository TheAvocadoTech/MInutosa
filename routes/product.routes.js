const express = require("express");
const {
  getProductsBySubCategories,
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/item.controller");
const { protect, admin } = require("../middleware/auth.middleware");

const router = express.Router();
// ─── Filtered/Fancy Routes ─────────────────────────────────
// Subcategory-wise products
router.get("/subcategories", getProductsBySubCategories);

// ─── Item CRUD Routes ───────────────────────────────────────
// Create item
router.post("/create", protect, admin, createProduct);
// Get all items
router.get("/", getAllProducts);
// Get item by ID
router.get("/:id", getProductById);
// Update item by ID
router.put("/:id", protect, admin, protect, admin, updateProduct);
// Delete item by ID
router.delete("/:id", protect, admin, deleteProduct);

exports = module.exports = router;
