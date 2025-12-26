const express = require("express");
const {
  createVendor,
  getVendorDetails,
  //   getMyVendorProfile,
  //   updateVendor,
  getAllVendors,
  updateVendorStatus,
  deleteVendor,
} = require("../controllers/vender.controller");
const { protect, admin } = require("../middleware/auth.middleware");

// const vendorAuth = require("../middleware/auth.middleware");

const router = express.Router();

/* ================= VENDOR ORDER ACTIONS ================= */

// Accept order

/* ================= VENDOR PROFILE ================= */

// Get logged-in vendor profile
// router.get("/profile/me", getMyVendorProfile);

// Update logged-in vendor profile
// router.put("/profile/me", updateVendor);

/* ================= VENDOR MANAGEMENT ================= */

// Create vendor
router.post("/", createVendor);

// Get all vendors
router.get("/", getAllVendors);

// // Get vendor by ID
// router.get("/:vendorId", getVendorDetails);

// Update vendor by ID
// router.put("/:vendorId", vendorAuth, updateVendor);

// Delete vendor
router.delete("/:vendorId", deleteVendor);

/* ================= VENDOR STATUS (ADMIN / SUPER) ================= */

// Accept / Reject vendor
router.patch("/:vendorId/status", protect, admin, updateVendorStatus);

module.exports = router;
