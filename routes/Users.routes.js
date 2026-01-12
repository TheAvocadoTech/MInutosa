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

const router = express.Router();

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
