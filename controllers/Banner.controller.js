const { cloudinary } = require("../config/cloudinary");
const AdsModel = require("../models/Banner.model"); // updated model import

// Create Ad
const createAd = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }

    const result = await cloudinary.uploader.upload(image, {
      folder: "Ads",
    });

    const newAd = new AdsModel({
      image: result.secure_url,
    });

    await newAd.save();
    res.status(201).json({
      success: true,
      message: "Ad created successfully",
      ad: newAd,
    });
  } catch (error) {
    console.error("Error in createAd:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get All Ads
const getAllAds = async (req, res) => {
  try {
    const ads = await AdsModel.find();

    if (!ads || ads.length === 0) {
      return res.status(404).json({ message: "No ads found" });
    }

    res.status(200).json({
      success: true,
      count: ads.length,
      ads,
    });
  } catch (error) {
    console.error("Error in getAllAds:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching ads",
      error: error.message,
    });
  }
};

// Update Ad
const updateAd = async (req, res) => {
  try {
    const { id } = req.params;
    const { image } = req.body;

    let updatedData = {};

    if (image) {
      const result = await cloudinary.uploader.upload(image, {
        folder: "Ads",
      });
      updatedData.image = result.secure_url;
    }

    const ad = await AdsModel.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!ad) {
      return res.status(404).json({ success: false, message: "Ad not found" });
    }

    res.status(200).json({
      success: true,
      message: "Ad updated successfully",
      ad,
    });
  } catch (error) {
    console.error("Error in updateAd:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Delete Ad
const deleteAd = async (req, res) => {
  try {
    const { id } = req.params;

    const ad = await AdsModel.findByIdAndDelete(id);

    if (!ad) {
      return res.status(404).json({ success: false, message: "Ad not found" });
    }

    res.status(200).json({
      success: true,
      message: "Ad deleted successfully",
      ad,
    });
  } catch (error) {
    console.error("Error in deleteAd:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  createAd,
  getAllAds,
  updateAd,
  deleteAd,
};
