const express = require("express");
const {
  sendOtp,
  verifyOtp,
  resendOtp,
  getAllUsers,
  adminLogin,
  logout,
} = require("../controllers/AuthController");

const { protect, admin } = require("../middleware/auth.middleware");
const {
  getSavedAddresses,
  saveAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../controllers/Address.Controller");

const router = express.Router();

router.get("/addresses", protect, getSavedAddresses);

// POST   /api/user/addresses            → save a new address
router.post("/addresses", protect, saveAddress);

// PUT    /api/user/addresses/:addressId → update an existing address
router.put("/addresses/:addressId", protect, updateAddress);

// DELETE /api/user/addresses/:addressId → delete an address
router.delete("/addresses/:addressId", protect, deleteAddress);

// PATCH  /api/user/addresses/:addressId/default → set as default
router.patch("/addresses/:addressId/default", protect, setDefaultAddress);
/* ================= USER (OTP AUTH) ================= */

// Send OTP
router.post("/send-otp", sendOtp);

// Verify OTP (login)
router.post("/verify-otp", verifyOtp);

// //Resend OTP
// router.post("/resend-otp", resendOtp);

// Logout (both user & admin)
router.post("/logout", protect, logout);

/* ================= ADMIN AUTH ================= */

// Admin login (email + password)
router.post("/admin/login", adminLogin);

/* ================= PROTECTED ADMIN ROUTES ================= */

// Get all users (ADMIN ONLY)
router.get("/users", protect, admin, getAllUsers);

module.exports = router;
