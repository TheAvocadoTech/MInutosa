const mongoose = require("mongoose");
const User = require("../models/user.model");

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existingAdmin = await User.findOne({
    email: process.env.ADMIN_EMAIL,
  });

  if (existingAdmin) {
    console.log("Admin already exists");
    process.exit();
  }

  const admin = new User({
    name: "Super Admin",
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD, // 🔐 hidden
    phoneNumber: process.env.ADMIN_PHONE,
    role: "ADMIN",
    isAdmin: true,
    isVerified: true,
  });

  await admin.save();

  console.log("✅ Admin seeded successfully");
  process.exit();
};

seedAdmin();
