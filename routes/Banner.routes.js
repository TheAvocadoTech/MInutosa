const express = require("express");
const {
  createAd,
  getAllAds,
  updateAd,
  deleteAd,
} = require("../controllers/Banner.controller");

const router = express.Router();

// Create a new ad
router.post("/create", createAd);

// Get all ads
router.get("/get", getAllAds);

// Update an ad by ID
router.put("/:id", updateAd);

// Delete an ad by ID
router.delete("/:id", deleteAd);

module.exports = router;
