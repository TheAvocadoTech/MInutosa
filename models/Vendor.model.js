const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    // ── Required at registration ──────────────────────────────────────────────
    storeName: {
      type: String,
      required: [true, "Store name is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // never returned in queries by default
    },

    confirmPassword: {
      type: String,
      required: [true, "Confirm password is required"],
      select: false,
    },

    // ── Filled in later (profile completion / admin) ──────────────────────────
    firstName: {
      type: String,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    businessName: {
      type: String,
      trim: true,
    },

    businessType: {
      type: String,
      trim: true,
    },

    streetAddress: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    pinCode: {
      type: String,
      trim: true,
    },

    nominateForAwards: {
      type: Boolean,
      default: false,
    },

    acceptMessages: {
      type: Boolean,
      default: true,
    },

    latitude: {
      type: Number,
    },

    longitude: {
      type: Number,
    },

    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Vendor", vendorSchema);
