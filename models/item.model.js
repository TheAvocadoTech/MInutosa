const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
    },
    description: String,

    images: [
      {
        url: { type: String, required: true },
        alt: { type: String },
      },
    ],

    price: {
      mrp: { type: Number, required: true },
      sellingPrice: { type: Number, required: true },
      discountPercent: { type: Number, default: 0 },
    },

    unit: {
      quantity: { type: Number, required: true },
      unitType: {
        type: String,
        enum: ["g", "kg", "ml", "l", "pack", "pcs"],
        required: true,
      },
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subCat", // ✅ Matches model name exactly
      required: true,
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    tags: [String],

    expiryDate: Date,

    warehouseLocation: String,

    deliveryTimeEstimate: {
      type: String, // Example: "10 mins"
    },

    rating: {
      average: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor", // If vendors are managed separately
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
