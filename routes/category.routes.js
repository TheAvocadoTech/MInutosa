// routes/subcategory.routes.js
const express = require("express");
const router = express.Router();

const {
  createcategory,
  getAllCategories,
  updateCategory,
  deleteCategory,

  getSubCategoriesByCategory,
} = require("../controllers/category.controller");

// RESTful routes
router.post("/categories", createcategory); // Create
router.get("/getcategories", getAllCategories); // Read all
router.put("/updatecategories/:id", updateCategory); // Update
router.delete("/deletecategories/:id", deleteCategory);
router.get("/subcategories/:identifier", getSubCategoriesByCategory);

module.exports = router;
