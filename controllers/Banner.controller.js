const { cloudinary } = require("../config/cloudinary");
const BannerModel = require("../models/Banner.model");

const createBanner = async (req, res) => {
  try {
    const { image, Description } = req.body;

    if (!image || !Description) {
      return res
        .status(400)
        .json({ message: "Image and Description are required" });
    }

    const result = await cloudinary.uploader.upload(image, {
      folder: "Banner",
    });

    const newPost = new BannerModel({
      image: result.secure_url,
      Description,
    });

    await newPost.save();
    res.status(201).json({
      message: "Banner post created successfully",
      post: newPost,
    });
  } catch (error) {
    console.error("Error in Banner:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllBanners = async (req, res) => {
  try {
    const banners = await BannerModel.find();

    if (!banners || banners.length === 0) {
      return res.status(404).json({ message: "No banners found" });
    }

    res.status(200).json({
      success: true,
      count: banners.length,
      banners,
    });
  } catch (error) {
    console.error("Error in fetching banners:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching banners",
      error: error.message,
    });
  }
};

// Update Banner
const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { image, Description } = req.body;

    let updatedData = { Description };

    if (image) {
      const result = await cloudinary.uploader.upload(image, {
        folder: "Banner",
      });
      updatedData.image = result.secure_url;
    }

    const banner = await BannerModel.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!banner) {
      return res
        .status(404)
        .json({ success: false, message: "Banner not found" });
    }

    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      banner,
    });
  } catch (error) {
    console.error("Error in updateBanner:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Delete Banner
const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await BannerModel.findByIdAndDelete(id);

    if (!banner) {
      return res
        .status(404)
        .json({ success: false, message: "Banner not found" });
    }

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
      banner,
    });
  } catch (error) {
    console.error("Error in deleteBanner:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
module.exports = {
  createBanner,
  getAllBanners,
  updateBanner,
  deleteBanner,
};
