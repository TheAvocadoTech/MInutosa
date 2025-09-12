const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  categoryWiseProduct,
  subCategoryWiseProduct,
} = require("../controllers/item.controller");
const router = express.Router();

// ✅ CRUD Routes
router.post("/", createProduct); // Create product
router.get("/", getAllProducts); // Get all products
router.get("/:id", getProductById); // Get product by ID
router.put("/:id", updateProduct); // Update product
router.delete("/:id", deleteProduct); // Delete product

// ✅ Extra Filters
router.post("/by-category", categoryWiseProduct); // Products by category name
router.post("/by-subcategory", subCategoryWiseProduct); // Products by subCategory name

module.exports = router;
