const Vendor = require("../models/Vendor.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ─── Helper: generate JWT ────────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

/**
 * =====================================================
 * REGISTER VENDOR
 * =====================================================
 * @route   POST /api/vendor/register
 * @access  Public
 * Registers a new vendor using storeName, email,
 * password and confirmPassword.
 */
exports.registerVendor = async (req, res) => {
  try {
    const { storeName, email, password, confirmPassword } = req.body;

    // ── All fields required ───────────────────────────────────────────────────
    if (!storeName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Store name, email, password and confirm password are required",
      });
    }

    // ── Passwords match ───────────────────────────────────────────────────────
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password do not match",
      });
    }

    // ── Duplicate email ───────────────────────────────────────────────────────
    const emailExists = await Vendor.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "A vendor with this email already exists",
      });
    }

    // ── Duplicate storeName ───────────────────────────────────────────────────
    const storeExists = await Vendor.findOne({ storeName });
    if (storeExists) {
      return res.status(400).json({
        success: false,
        message: "This store name is already taken",
      });
    }

    // ── Hash password ─────────────────────────────────────────────────────────
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const hashedConfirm = await bcrypt.hash(confirmPassword, salt);

    // ── Create vendor ─────────────────────────────────────────────────────────
    const vendor = await Vendor.create({
      storeName,
      email,
      password: hashedPassword,
      confirmPassword: hashedConfirm,
    });

    const token = generateToken(vendor._id);

    res.status(201).json({
      success: true,
      message: "Vendor registered successfully",
      token,
      vendor: {
        _id: vendor._id,
        storeName: vendor.storeName,
        email: vendor.email,
        status: vendor.status,
      },
    });
  } catch (error) {
    console.error("Register Vendor Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while registering vendor",
    });
  }
};

/**
 * =====================================================
 * LOGIN VENDOR
 * =====================================================
 * @route   POST /api/vendor/login
 * @access  Public
 * Authenticates a vendor with email + password
 * and returns a JWT token.
 */
exports.loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // ── Find vendor (include password field explicitly) ───────────────────────
    const vendor = await Vendor.findOne({ email }).select("+password");
    if (!vendor) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ── Compare password ──────────────────────────────────────────────────────
    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ── (Optional) block REJECTED vendors from logging in ────────────────────
    if (vendor.status === "REJECTED") {
      return res.status(403).json({
        success: false,
        message: "Your account has been rejected. Please contact support.",
      });
    }

    const token = generateToken(vendor._id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      vendor: {
        _id: vendor._id,
        firstName: vendor.firstName,
        lastName: vendor.lastName,
        storeName: vendor.storeName,
        email: vendor.email,
        status: vendor.status,
      },
    });
  } catch (error) {
    console.error("Login Vendor Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while logging in",
    });
  }
};

/**
 * =====================================================
 * CREATE VENDOR  (admin / manual creation)
 * =====================================================
 * @route   POST /api/vendor
 * @access  Admin
 */
exports.createVendor = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      businessName,
      businessType,
      streetAddress,
      city,
      state,
      pinCode,
      nominateForAwards,
      acceptMessages,
      latitude,
      longitude,
    } = req.body;

    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: "Vendor already exists with this email",
      });
    }

    const vendor = await Vendor.create({
      firstName,
      lastName,
      email,
      phone,
      businessName,
      businessType,
      streetAddress,
      city,
      state,
      pinCode,
      nominateForAwards,
      acceptMessages,
      latitude,
      longitude,
    });

    res.status(201).json({
      success: true,
      message: "Vendor created successfully",
      vendor,
    });
  } catch (error) {
    console.error("Create Vendor Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating vendor",
    });
  }
};

/**
 * =====================================================
 * GET SINGLE VENDOR DETAILS
 * =====================================================
 * @route   GET /api/vendor/:vendorId
 * @access  Private (Vendor/Admin)
 */
exports.getVendorDetails = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    res.json({ success: true, vendor });
  } catch (error) {
    console.error("Get Vendor Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching vendor",
    });
  }
};

/**
 * =====================================================
 * GET LOGGED-IN VENDOR PROFILE
 * =====================================================
 * @route   GET /api/vendor/profile/me
 * @access  Private (Vendor)
 */
exports.getMyVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor.id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    res.json({ success: true, vendor });
  } catch (error) {
    console.error("Get My Vendor Profile Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * =====================================================
 * UPDATE VENDOR DETAILS
 * =====================================================
 * @route   PUT /api/vendor/:vendorId
 * @access  Private (Vendor/Admin)
 */
exports.updateVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findByIdAndUpdate(vendorId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    res.json({
      success: true,
      message: "Vendor updated successfully",
      vendor,
    });
  } catch (error) {
    console.error("Update Vendor Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating vendor",
    });
  }
};

/**
 * =====================================================
 * GET ALL VENDORS
 * =====================================================
 * @route   GET /api/vendor
 * @access  Admin
 */
exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });

    res.json({ success: true, count: vendors.length, vendors });
  } catch (error) {
    console.error("Get All Vendors Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * =====================================================
 * UPDATE VENDOR STATUS (ACCEPT / REJECT)
 * =====================================================
 * @route   PATCH /api/vendor/:vendorId/status
 * @access  Admin
 */
exports.updateVendorStatus = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { status } = req.body;

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { status },
      { new: true },
    );

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json({
      success: true,
      message: `Vendor ${status.toLowerCase()} successfully`,
      vendor,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * =====================================================
 * DELETE VENDOR
 * =====================================================
 * @route   DELETE /api/vendor/:vendorId
 * @access  Admin
 */
exports.deleteVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findByIdAndDelete(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    res.json({ success: true, message: "Vendor deleted successfully" });
  } catch (error) {
    console.error("Delete Vendor Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
