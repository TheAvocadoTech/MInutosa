const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String },
    images: {
      type: [String], // multiple images
      default: [],
    },
    category: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Category",
      },
    ],
    subCategory: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "subCategory",
      },
    ],
    unit: { type: String, default: "" },
    stock: { type: Number, default: null },
    price: { type: Number, default: null },
    originalPrice: { type: Number, default: null },
    discountedMRP: { type: Number, default: null },
    discount: { type: Number, default: null },
    amountSaving: { type: Number, default: null },
    description: { type: String, default: "" },
    pack: { type: String, default: "" },
    productName: { type: String, default: "" },
    rating: { type: Number, default: null },
    more_details: { type: Object, default: {} },
  },
  { timestamps: true }
);

const ProductModel = mongoose.model("Product", productSchema);

module.exports = ProductModel;
