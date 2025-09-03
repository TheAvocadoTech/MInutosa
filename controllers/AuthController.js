const jwt = require("jsonwebtoken");
const User = require("../models/user");
const SMSService = require("../services/smsService");

const sendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const formattedPhone = SMSService.formatPhoneNumber(phoneNumber);

    let user = await User.findOne({ phoneNumber: formattedPhone });
    if (!user) {
      user = new User({ phoneNumber: formattedPhone });
    }

    const otp = user.generateOTP();
    await user.save();

    const smsResult = await SMSService.sendOTP(formattedPhone, otp);

    if (!smsResult.success) {
      return res.status(500).json({ error: "Failed to send OTP" });
    }

    res.json({
      success: true,
      message: "OTP sent successfully",
      expiresIn: 300, // 5 minutes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res
        .status(400)
        .json({ error: "Phone number and OTP are required" });
    }

    const formattedPhone = SMSService.formatPhoneNumber(phoneNumber);
    const user = await User.findOne({ phoneNumber: formattedPhone });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.verifyOTP(otp)) {
      await user.save();
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, phoneNumber: user.phoneNumber },
      process.env.JWT_SECRET,
      { expiresIn: "8d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    const formattedPhone = SMSService.formatPhoneNumber(phoneNumber);
    const user = await User.findOne({ phoneNumber: formattedPhone });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = user.generateOTP();
    await user.save();

    const smsResult = await SMSService.sendOTP(formattedPhone, otp);

    if (!smsResult.success) {
      return res.status(500).json({ error: "Failed to resend OTP" });
    }

    res.json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  resendOtp,
};
