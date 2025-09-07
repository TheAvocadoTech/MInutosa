const express = require("express");
const {
  sendOtp,
  verifyOtp,
  resendOtp,
  getAllUsers,
} = require("../controllers/AuthController");

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.get("/all", getAllUsers);

module.exports = router;
