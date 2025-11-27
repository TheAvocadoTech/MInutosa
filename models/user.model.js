// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      // required: true,
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
      sparse: true, // allow multiple docs without email
    },

    address: {
      type: String,
    },

    profilePicture: {
      type: String,
    },

    password: {
      type: String,
      // required only for password-based accounts (admins/users). You can enforce on register route.
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isAdmin: {
      type: Boolean,
      default: false,
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

// Pre-save: hash password if modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Instance: compare password
userSchema.methods.comparePassword = function (plainPassword) {
  if (!this.password) return false;
  return bcrypt.compare(plainPassword, this.password);
};

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
  if (!this.otp || !this.otp.code || new Date() > this.otp.expiresAt) {
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
