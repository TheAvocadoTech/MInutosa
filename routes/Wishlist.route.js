// routes/wishlist.js
const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');

// Get Wishlist
router.get('/', wishlistController.getWishlist);

// Add to Wishlist
router.post('/add', wishlistController.addToWishlist);

// Remove from Wishlist
router.post('/remove', wishlistController.removeFromWishlist);

module.exports = router;
