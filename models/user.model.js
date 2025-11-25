const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    address: {
      type: String,
      // required: true,
    },

    profilePicture: {
      type: String,
      // required: false, // Optional
    },

    otp: {
      code: String,
      expiresAt: Date,
      attempts: { type: Number, default: 0 },
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Generate OTP
userSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = {
    code: bcrypt.hashSync(otp, 10),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    attempts: 0,
  };
  return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = function (inputOTP) {
  if (!this.otp.code || new Date() > this.otp.expiresAt) {
    return false;
  }
  if (this.otp.attempts >= 3) {
    return false;
  }

  const isValid = bcrypt.compareSync(inputOTP, this.otp.code);
  if (!isValid) {
    this.otp.attempts += 1;
  }
  return isValid;
};

module.exports = mongoose.model("User", userSchema);
