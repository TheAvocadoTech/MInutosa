const express = require("express");
const {
  userCart: getUserCart,
  addToCart,
  updateQuantity,
  removeFromCart,
} = require("../controllers/cart.controller");
const router = express.Router();

// ✅ Get user cart
router.get("/", getUserCart);

// ✅ Add product to cart
router.post("/add", addToCart);

// ✅ Update quantity
router.put("/update", updateQuantity);

// ✅ Remove from cart
// Change this line in your routes file
router.post("/remove", removeFromCart); // Changed from DELETE to POST
module.exports = router;
