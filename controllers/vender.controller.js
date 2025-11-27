const Vendor = require("../models/Vendor.model");

// Helper: validate lat/lng if provided
const validateLatLng = (lat, lng) => {
  if (lat === undefined && lng === undefined) return { ok: true };
  if (lat === undefined || lng === undefined) {
    return {
      ok: false,
      message: "Both latitude and longitude must be provided together.",
    };
  }
  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
    return {
      ok: false,
      message: "Latitude and longitude must be valid numbers.",
    };
  }
  if (latNum < -90 || latNum > 90) {
    return { ok: false, message: "Latitude must be between -90 and 90." };
  }
  if (lngNum < -180 || lngNum > 180) {
    return { ok: false, message: "Longitude must be between -180 and 180." };
  }
  return { ok: true, lat: latNum, lng: lngNum };
};

// Create Vendor
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

    // Basic validations
    if (!firstName || !firstName.trim())
      return res.status(400).json({ message: "First name is required" });

    if (!lastName || !lastName.trim())
      return res.status(400).json({ message: "Last name is required" });

    if (!email || !email.trim())
      return res.status(400).json({ message: "Email is required" });

    if (!phone) return res.status(400).json({ message: "Phone is required" });

    if (!businessName || !businessName.trim())
      return res.status(400).json({ message: "Business name is required" });

    if (!businessType || !businessType.trim())
      return res.status(400).json({ message: "Business type is required" });

    // latitude/longitude validation (optional)
    const latLngValidation = validateLatLng(latitude, longitude);
    if (!latLngValidation.ok) {
      return res.status(400).json({ message: latLngValidation.message });
    }

    // Duplicate email check
    const existingVendor = await Vendor.findOne({
      email: email.trim().toLowerCase(),
    });
    if (existingVendor)
      return res
        .status(400)
        .json({ message: "Vendor with this email already exists" });

    const newVendor = new Vendor({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone,
      businessName: businessName.trim(),
      businessType: businessType.trim(),
      streetAddress: streetAddress ? streetAddress.trim() : undefined,
      city: city ? city.trim() : undefined,
      state: state ? state.trim() : undefined,
      pinCode: pinCode ? pinCode.trim() : undefined,
      nominateForAwards: !!nominateForAwards,
      acceptMessages: acceptMessages === undefined ? true : !!acceptMessages,
      latitude: latLngValidation.lat,
      longitude: latLngValidation.lng,
      status: "PENDING",
    });

    await newVendor.save();

    res.status(201).json({
      message: "Vendor created successfully",
      vendor: newVendor,
    });
  } catch (error) {
    console.error("Error in createVendor:", error);

    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation error", details: error.message });
    }
    if (error.code === 11000) {
      // duplicate key (likely email)
      return res
        .status(400)
        .json({ message: "Vendor with this email already exists" });
    }

    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get All Vendors
exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find();

    if (!vendors.length)
      return res.status(404).json({ message: "No vendors found" });

    res.status(200).json({
      message: "Vendors fetched successfully",
      vendors,
    });
  } catch (error) {
    console.error("Error in getAllVendors:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Vendors by Status (e.g., PENDING, ACCEPTED, REJECTED)
exports.getVendorsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const valid = ["PENDING", "ACCEPTED", "REJECTED"];
    if (!valid.includes(status)) {
      return res
        .status(400)
        .json({ message: `Status must be one of: ${valid.join(", ")}` });
    }

    const vendors = await Vendor.find({ status });

    if (!vendors.length)
      return res
        .status(404)
        .json({ message: "No vendors found for this status" });

    res.status(200).json({ message: "Vendors fetched successfully", vendors });
  } catch (error) {
    console.error("Error in getVendorsByStatus:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Single Vendor
exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    res.status(200).json({
      message: "Vendor fetched successfully",
      vendor,
    });
  } catch (error) {
    console.error("Error in getVendorById:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Vendor
exports.updateVendor = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // If email is being updated, ensure uniqueness
    if (updateData.email) {
      const existing = await Vendor.findOne({
        email: updateData.email.trim().toLowerCase(),
        _id: { $ne: req.params.id },
      });
      if (existing) {
        return res
          .status(400)
          .json({ message: "Another vendor with this email already exists" });
      }
      updateData.email = updateData.email.trim().toLowerCase();
    }

    // Trim string fields if present
    [
      "firstName",
      "lastName",
      "businessName",
      "businessType",
      "streetAddress",
      "city",
      "state",
      "pinCode",
    ].forEach((key) => {
      if (updateData[key] && typeof updateData[key] === "string") {
        updateData[key] = updateData[key].trim();
      }
    });

    // Validate lat/lng if provided
    if ("latitude" in updateData || "longitude" in updateData) {
      const latLngValidation = validateLatLng(
        updateData.latitude,
        updateData.longitude
      );
      if (!latLngValidation.ok) {
        return res.status(400).json({ message: latLngValidation.message });
      }
      updateData.latitude = latLngValidation.lat;
      updateData.longitude = latLngValidation.lng;
    }

    const updatedVendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedVendor)
      return res.status(404).json({ message: "Vendor not found" });

    res.status(200).json({
      message: "Vendor updated successfully",
      vendor: updatedVendor,
    });
  } catch (error) {
    console.error("Error in updateVendor:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error during update",
        details: error.message,
      });
    }

    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Vendor
exports.deleteVendor = async (req, res) => {
  try {
    const deletedVendor = await Vendor.findByIdAndDelete(req.params.id);

    if (!deletedVendor)
      return res.status(404).json({ message: "Vendor not found" });

    res.status(200).json({ message: "Vendor deleted successfully" });
  } catch (error) {
    console.error("Error in deleteVendor:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================================
// ADMIN - ACCEPT / REJECT VENDOR
// ================================
exports.updateVendorStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !["PENDING", "ACCEPTED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        message: "Status must be PENDING, ACCEPTED, or REJECTED",
      });
    }

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json({
      message: `Vendor status updated to ${status}`,
      vendor,
    });
  } catch (error) {
    console.error("Error in updateVendorStatus:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
