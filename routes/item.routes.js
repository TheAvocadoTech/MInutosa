// routes/subcategory.routes.js
const express = require("express");
const router = express.Router();
const {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  categoryWiseItem,
  getProductsBySubCategories,
} = require("../controllers/item.controller");

router.post("/createItem", createItem); // Create item
router.get("/getAllItems", getAllItems); // Get all items
router.get("/getItemById/:id", getItemById); // Get item by ID
router.put("/updateItem/:id", updateItem); // Update item by ID
router.delete("/deleteItem/:id", deleteItem); // Delete item by ID
router.post("/categoryWiseItem", categoryWiseItem); // Category wise Item
router.post("/by-subcategories", getProductsBySubCategories);
router.post("/bulk", bulkUploadProducts);

// Sub category wise Item
module.exports = router;
