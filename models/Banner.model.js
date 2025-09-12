const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    homeBanner1: {
      type: String, // Single image URL
    },
    advertiseBanners: {
      type: [String], // Multiple image URLs
      default: [],
    },
    homeBanner2: {
      type: String,
    },
    homeBanner3: {
      type: String,
    },
    homeBanner4: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);
