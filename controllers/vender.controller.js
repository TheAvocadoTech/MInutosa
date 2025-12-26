const Vendor = require("../models/Vendor.model");

/**
 * =====================================================
 * CREATE VENDOR
 * =====================================================
 * @route   POST /api/vendor
 * @access  Public / Admin
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

    // Check existing vendor
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

    res.json({
      success: true,
      vendor,
    });
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
    const vendorId = req.vendor.id;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    res.json({
      success: true,
      vendor,
    });
  } catch (error) {
    console.error("Get My Vendor Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
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

    res.json({
      success: true,
      count: vendors.length,
      vendors,
    });
  } catch (error) {
    console.error("Get All Vendors Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
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
      { new: true }
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

    res.json({
      success: true,
      message: "Vendor deleted successfully",
    });
  } catch (error) {
    console.error("Delete Vendor Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
