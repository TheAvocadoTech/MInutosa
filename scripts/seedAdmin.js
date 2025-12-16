const mongoose = require("mongoose");
const User = require("../models/user.model");

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const adminEmail = "admin@minutus.in";

  const existingAdmin = await User.findOne({ email: adminEmail });

  if (existingAdmin) {
    console.log("Admin already exists");
    process.exit();
  }

  const admin = new User({
    name: "Super Admin",
    email: adminEmail,
    password: "Admin@123",
    phoneNumber: "9999999999",
    role: "ADMIN", // ✅ IMPORTANT
    isAdmin: true, // ✅ keep for backward compatibility
    isVerified: true,
  });

  await admin.save();

  console.log("✅ Admin seeded successfully");
  process.exit();
};

seedAdmin();
