const { cloudinary } = require("../config/cloudinary");
const BannerModel = require("../models/Banner.model"); // updated model

// Create / Update Banner (single document for all banners)
const createOrUpdateBanner = async (req, res) => {
  try {
    const {
      homeBanner1,
      homeBanner2,
      homeBanner3,
      homeBanner4,
      advertiseBanners,
    } = req.body;

    let updateData = {};

    const uploadImage = async (image, folder) => {
      const result = await cloudinary.uploader.upload(image, {
        folder,
        resource_type: "image",
        type: "upload", // ✅ FORCE PUBLIC
      });
      return result.secure_url;
    };

    if (homeBanner1) {
      updateData.homeBanner1 = await uploadImage(homeBanner1, "Banners/Home");
    }

    if (homeBanner2) {
      updateData.homeBanner2 = await uploadImage(homeBanner2, "Banners/Home");
    }

    if (homeBanner3) {
      updateData.homeBanner3 = await uploadImage(homeBanner3, "Banners/Home");
    }

    if (homeBanner4) {
      updateData.homeBanner4 = await uploadImage(homeBanner4, "Banners/Home");
    }

    if (advertiseBanners && advertiseBanners.length > 0) {
      updateData.advertiseBanners = [];
      for (const ad of advertiseBanners) {
        const url = await uploadImage(ad, "Banners/Advertise");
        updateData.advertiseBanners.push(url);
      }
    }

    let banner = await BannerModel.findOne();
    if (banner) {
      banner = await BannerModel.findByIdAndUpdate(banner._id, updateData, {
        new: true,
      });
    } else {
      banner = await BannerModel.create(updateData);
    }

    res.status(201).json({
      success: true,
      message: "Banners saved successfully",
      banner,
    });
  } catch (error) {
    console.error("Error in createOrUpdateBanner:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Banner (always returns single document)
const getBanner = async (req, res) => {
  try {
    const banner = await BannerModel.findOne();

    if (!banner) {
      return res.status(404).json({ message: "No banners found" });
    }

    res.status(200).json({
      success: true,
      banner,
    });
  } catch (error) {
    console.error("Error in getBanner:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching banners",
      error: error.message,
    });
  }
};

// Delete all banners (optional)
const deleteBanners = async (req, res) => {
  try {
    await BannerModel.deleteMany({});
    res.status(200).json({
      success: true,
      message: "All banners deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteBanners:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  createOrUpdateBanner,
  getBanner,
  deleteBanners,
};
