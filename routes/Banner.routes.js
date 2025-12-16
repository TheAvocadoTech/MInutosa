const express = require("express");
const {
  createOrUpdateBanner,
  getBanner,
  deleteBanners,
} = require("../controllers/Banner.controller");
const { protect, admin } = require("../middleware/auth.middleware");

const router = express.Router();

// ✅ Create or Update Banner (single doc for all banners)
router.post("/create-or-update", protect, admin, createOrUpdateBanner);

// ✅ Get Banner (always returns single doc)
router.get("/get", getBanner);

// ✅ Delete all banners
router.delete("/delete", deleteBanners);

module.exports = router;
