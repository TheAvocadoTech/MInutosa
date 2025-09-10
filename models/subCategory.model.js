const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subcategory name is required"],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    image: {
      type: String, // will store image URL
      required: false, // optional
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("subCategory", subCategorySchema);
