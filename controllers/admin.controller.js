// controllers/adminAuth.controller.js
const asyncHandler = require("express-async-handler");
const User = require("../models/user.model"); // your /User model path
const { generateRefreshToken } = require("../config/refreshToken");
const { generateToken } = require("../config/jwtToken");
// adjust path
// generateToken(userId) -> access token
// generateRefreshToken(userId) -> refresh token (string)

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const findAdmin = await User.findOne({ email }).select(
    "+password +refreshToken"
  ); // ensure password selected if schema hides it
  if (!findAdmin) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  // ensure role is admin (case-insensitive). Accept variations like 'admin'/'ADMIN'
  const role = (findAdmin.role || "").toString().toLowerCase();
  if (role !== "admin" && role !== "superadmin") {
    res.status(403);
    throw new Error("Not authorised as admin");
  }

  // Support either isPasswordMatched (common in many examples) or comparePassword
  let isMatch = false;
  if (typeof findAdmin.isPasswordMatched === "function") {
    isMatch = await findAdmin.isPasswordMatched(password);
  } else if (typeof findAdmin.comparePassword === "function") {
    isMatch = await findAdmin.comparePassword(password);
  } else {
    // fallback: compare using bcrypt directly if password stored as plain (not recommended)
    throw new Error("Password comparison method not found on User model");
  }

  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  // generate tokens
  const accessToken = generateToken(findAdmin._id); // short-lived access token
  const refreshToken = await generateRefreshToken(findAdmin._id); // refresh token (longer-lived)

  // persist refresh token to DB (so you can revoke later)
  findAdmin.refreshToken = refreshToken;
  await findAdmin.save();

  // set cookie for refresh token
  const cookieOptions = {
    httpOnly: true,
    // secure: true, // enable in production (HTTPS)
    sameSite: "Strict",
    maxAge: 72 * 60 * 60 * 1000, // 72 hours
  };
  res.cookie("refreshToken", refreshToken, cookieOptions);

  // respond with admin info + access token
  res.json({
    success: true,
    _id: findAdmin._id,

    email: findAdmin.email,
    role: findAdmin.role,
    token: accessToken,
  });
});

module.exports = {
  loginAdmin,
};
