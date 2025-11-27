// seedAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user.model");

const MONGO_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";

async function seedAdmin() {
  try {
    if (!MONGO_URI) {
      console.log("❌ MONGO_URI missing in .env");
      process.exit(1);
    }

    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Check if admin exists
    const exists = await User.findOne({ email: ADMIN_EMAIL });

    if (exists) {
      console.log("⚠️ Admin already exists:");
      console.log(`ID: ${exists._id}`);
      console.log(`Email: ${exists.email}`);
      return process.exit(0);
    }

    // Create admin
    const admin = new User({
      email: ADMIN_EMAIL,

      password: ADMIN_PASSWORD, // Will be hashed by pre-save hook
      role: "admin",
    });

    await admin.save();

    console.log("🎉 Admin created successfully:");
    console.log("--------------------------------");
    console.log(`ID: ${admin._id}`);
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log("--------------------------------");
    console.log("⚠️ IMPORTANT: Change admin password after first login.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();
