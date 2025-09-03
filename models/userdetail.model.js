const mongoose = require("mongoose");

const userDetailSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Reference to the User model
    },
    address: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      required: false, // Optional field for profile picture URL
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensure email is unique
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserDetail", userDetailSchema);
