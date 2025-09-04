const express = require("express");
const {
  createBanner,
  getAllBanners,
  updateBanner,
  deleteBanner,
} = require("../controllers/Banner.controller");

const router = express.Router();

// Create a new ad
router.post("/create", createBanner);

// Get all ads
router.get("/get", getAllBanners);

// Update an ad by ID
router.put("/:id", updateBanner);

// Delete an ad by ID
router.delete("/:id", deleteBanner);

module.exports = router;
