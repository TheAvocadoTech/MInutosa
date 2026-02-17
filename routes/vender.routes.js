const express = require("express");
const router = express.Router();

const {
  registerVendor,
  loginVendor,
  createVendor,
  getVendorDetails,
  getMyVendorProfile,
  updateVendor,
  getAllVendors,
  updateVendorStatus,
  deleteVendor,
} = require("../controllers/vender.controller");

const {
  protect,
  admin,
  protectVendor,
  acceptedVendorOnly,
} = require("../middleware/auth.middleware");

/* ================= AUTH ================= */

// Register a new vendor
router.post("/register", registerVendor);

// Login vendor → returns JWT
router.post("/login", loginVendor);

/* ================= VENDOR PROFILE (self) ================= */

// Get logged-in vendor's own profile
router.get("/profile/me", protectVendor, getMyVendorProfile);

// Update logged-in vendor's own profile
router.put("/profile/me", protectVendor, acceptedVendorOnly, updateVendor);

/* ================= VENDOR MANAGEMENT (admin) ================= */

// Create vendor manually (admin)
router.post("/", protect, admin, createVendor);

// Get all vendors (admin)
router.get("/", protect, admin, getAllVendors);

// Get vendor by ID (admin)
router.get("/:vendorId", protect, admin, getVendorDetails);

// Update vendor by ID (admin)
router.put("/:vendorId", protect, admin, updateVendor);

// Delete vendor (admin)
router.delete("/:vendorId", protect, admin, deleteVendor);

/* ================= VENDOR STATUS (admin) ================= */

// Accept / Reject vendor
router.patch("/:vendorId/status", protect, admin, updateVendorStatus);

module.exports = router;
