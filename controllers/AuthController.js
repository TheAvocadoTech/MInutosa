const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const SMSService = require("../services/smsService");

/* ================= OTP SEND (USER + DELIVERY AGENT) ================= */

const sendOtp = async (req, res) => {
  try {
    let { phoneNumber, role } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const formattedPhone = SMSService.formatPhoneNumber(phoneNumber);

    // ✅ normalize role
    role = role ? role.toUpperCase() : "USER";

    let user = await User.findOne({ phoneNumber: formattedPhone });

    if (!user) {
      user = new User({
        phoneNumber: formattedPhone,
        role: role === "DELIVERY_AGENT" ? "DELIVERY_AGENT" : "USER",
      });
    } else {
      // ✅ update role if user is joining as delivery agent
      if (role === "DELIVERY_AGENT" && user.role !== "DELIVERY_AGENT") {
        user.role = "DELIVERY_AGENT";
      }
    }

    const otp = user.generateOTP();
    await user.save();

    const smsResult = await SMSService.sendOTP(formattedPhone, otp);
    if (!smsResult.success) {
      return res.status(500).json({ message: "Failed to send OTP" });
    }

    res.json({
      success: true,
      message: "OTP sent successfully",
      expiresIn: 300,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= OTP VERIFY (USER + DELIVERY AGENT) ================= */

const verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({ message: "Phone number & OTP required" });
    }

    const formattedPhone = SMSService.formatPhoneNumber(phoneNumber);
    const user = await User.findOne({ phoneNumber: formattedPhone });

    if (!user || !user.verifyOTP(otp)) {
      if (user) await user.save();
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    // ✅ SAME JWT FOR ALL ROLES
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "8d",
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= ADMIN LOGIN (EMAIL + PASSWORD) ================= */

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminUser = await User.findOne({
      email,
      role: "ADMIN",
    });

    if (!adminUser || !(await adminUser.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const token = jwt.sign({ userId: adminUser._id }, process.env.JWT_SECRET, {
      expiresIn: "8d",
    });

    res.json({
      success: true,
      message: "Admin login successful",
      token,
      user: {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= OTHER ================= */

const getAllUsers = async (req, res) => {
  const users = await User.find().select("-otp -__v -password");
  res.json({ success: true, users });
};

const logout = async (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
};

module.exports = {
  sendOtp,
  verifyOtp,
  adminLogin,
  getAllUsers,
  logout,
};
