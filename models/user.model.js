const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ── Saved Address Sub-schema ──────────────────────────────────────────────────
const savedAddressSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Home",
    },
    street: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true, timestamps: true },
);

// ── User Schema ───────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      unique: true,
      trim: true,
      sparse: true,
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
      sparse: true,
    },

    address: {
      type: String,
    },

    // ── Saved delivery addresses ──────────────────────────────────
    savedAddresses: {
      type: [savedAddressSchema],
      default: [],
    },

    profilePicture: {
      type: String,
    },

    password: {
      type: String,
    },

    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },

    role: {
      type: String,
      enum: ["USER", "DELIVERY_AGENT", "ADMIN"],
      default: "USER",
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
  { timestamps: true },
);

// ── Pre-save: hash password if modified ──────────────────────────────────────
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

// ── Instance: compare password ────────────────────────────────────────────────
userSchema.methods.comparePassword = function (plainPassword) {
  if (!this.password) return false;
  return bcrypt.compare(plainPassword, this.password);
};

// ── Generate OTP ──────────────────────────────────────────────────────────────
userSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = {
    code: bcrypt.hashSync(otp, 10),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    attempts: 0,
  };
  return otp;
};

// ── Verify OTP ────────────────────────────────────────────────────────────────
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
  } else {
    this.otp = undefined;
  }

  return isValid;
};

module.exports = mongoose.model("User", userSchema);
