// routes/subcategory.routes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  createcategory,
  getAllCategories,
  updateCategory,
  deleteCategory,

  getSubCategoriesByCategory,
  bulkUploadCategories,
} = require("../controllers/category.controller");
const {
  getProductsByCategory,
} = require("../controllers/subCategory.controller");

const upload = multer({ dest: "uploads/" });

// RESTful routes
router.post("/categories", createcategory); // Create
router.get("/getcategories", getAllCategories); // Read all
router.put("/updatecategories/:id", updateCategory); // Update
router.delete("/deletecategories/:id", deleteCategory);
router.get("/category/:categoryId", getProductsByCategory);
router.post(
  "/categories/bulk-upload",
  upload.single("file"),
  bulkUploadCategories
);

router.get("/subcategories/:identifier", getSubCategoriesByCategory);

module.exports = router;
