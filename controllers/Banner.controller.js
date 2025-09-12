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

    // ✅ Upload and set Home Banner 1
    if (homeBanner1) {
      const result = await cloudinary.uploader.upload(homeBanner1, {
        folder: "Banners/Home",
      });
      updateData.homeBanner1 = result.secure_url;
    }

    // ✅ Upload and set Advertise Banners (multiple images)
    if (advertiseBanners && advertiseBanners.length > 0) {
      let uploadedAds = [];
      for (let ad of advertiseBanners) {
        const result = await cloudinary.uploader.upload(ad, {
          folder: "Banners/Advertise",
        });
        uploadedAds.push(result.secure_url);
      }
      updateData.advertiseBanners = uploadedAds;
    }

    // ✅ Upload Home Banner 2
    if (homeBanner2) {
      const result = await cloudinary.uploader.upload(homeBanner2, {
        folder: "Banners/Home",
      });
      updateData.homeBanner2 = result.secure_url;
    }

    // ✅ Upload Home Banner 3
    if (homeBanner3) {
      const result = await cloudinary.uploader.upload(homeBanner3, {
        folder: "Banners/Home",
      });
      updateData.homeBanner3 = result.secure_url;
    }

    // ✅ Upload Home Banner 4
    if (homeBanner4) {
      const result = await cloudinary.uploader.upload(homeBanner4, {
        folder: "Banners/Home",
      });
      updateData.homeBanner4 = result.secure_url;
    }

    // ✅ Ensure only 1 Banner document exists (update or create)
    let banner = await BannerModel.findOne();
    if (banner) {
      banner = await BannerModel.findByIdAndUpdate(banner._id, updateData, {
        new: true,
      });
    } else {
      banner = new BannerModel(updateData);
      await banner.save();
    }

    res.status(201).json({
      success: true,
      message: "Banners saved successfully",
      banner,
    });
  } catch (error) {
    console.error("Error in createOrUpdateBanner:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
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
