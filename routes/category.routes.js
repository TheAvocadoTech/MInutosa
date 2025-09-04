// routes/subcategory.routes.js
const express = require("express");
const router = express.Router();

const {
  createcategory,
  getAllCategories,
} = require("../controllers/category.controller");

// RESTful routes
router.post("/categories", createcategory); // Create
router.get("/getcategories", getAllCategories); // Read all
// router.get("/getcategories/:id", getcategoryById); // Read one
// router.put("/updatecategories/:id", updatecategory); // Update
// router.delete("/deletecategories/:id", deletecategory); // Delete

module.exports = router;
