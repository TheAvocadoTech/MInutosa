// routes/subcategory.routes.js
const express = require("express");
const router = express.Router();

const {
  createSubcategory,
  getSubcategories,
  getSubcategoryById,
  getSubcategoriesByCategory,
  updateSubcategory,
  deleteSubcategory,
  getAllCategoriesWithSubcategories,
} = require("../controllers/subCategory.controller");

// ================= Routes ================= //

// Create
router.post("/", createSubcategory);

// Read (all, with optional query filters)
router.get("/", getSubcategories);
router.get("/categories-with-subcategories", getAllCategoriesWithSubcategories);
// Read (single by ID)
router.get("/:id", getSubcategoryById);

// Read (all subcategories by category ID)
router.get("/category/:categoryId", getSubcategoriesByCategory);

// Update
router.put("/:id", updateSubcategory);

// Delete
router.delete("/:id", deleteSubcategory);

module.exports = router;
