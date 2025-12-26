const mongoose = require("mongoose");
const Product = require("../models/Product.model");
const Category = require("../models/Category.model");
const SubCategory = require("../models/subCategory.model");

// ✅ Create Product
const createProduct = async (req, res) => {
  try {
    // ✅ Check if req.body exists
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message:
          "Request body is empty or invalid. Make sure you're sending JSON data.",
      });
    }

    const productData = req.body;

    // Validate required fields
    const requiredFields = ["name", "category", "subCategory"];
    const missingFields = requiredFields.filter((f) => !productData[f]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `The following fields are required: ${missingFields.join(
          ", "
        )}`,
        missingFields,
      });
    }

    // ✅ Validate & fetch categories (array support)
    const categoryIds = Array.isArray(productData.category)
      ? productData.category
      : [productData.category];

    const categories = await Category.find({
      _id: { $in: categoryIds },
    });

    if (!categories.length) {
      return res.status(400).json({ message: "Invalid category IDs" });
    }

    // ✅ Validate & fetch subcategories (array support)
    const subCategoryIds = Array.isArray(productData.subCategory)
      ? productData.subCategory
      : [productData.subCategory];

    const subCategories = await SubCategory.find({
      _id: { $in: subCategoryIds },
    });

    if (!subCategories.length) {
      return res.status(400).json({ message: "Invalid subCategory IDs" });
    }

    // ✅ Create Product
    const product = await Product.create(productData);

    const populatedProduct = await Product.findById(product._id)
      .populate("category", "name")
      .populate("subCategory", "name");

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: populatedProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
// ✅ Get All Products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .populate("subCategory", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: products,
      total: products.length,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Get Product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(id)
      .populate("category", "name")
      .populate("subCategory", "name");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// ✅ Update Product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate category/subCategory if updating
    if (updateData.category) {
      const categories = await Category.find({
        _id: { $in: updateData.category },
      });
      if (!categories.length) {
        return res.status(400).json({ message: "Invalid category IDs" });
      }
    }

    if (updateData.subCategory) {
      const subCategories = await SubCategory.find({
        _id: { $in: updateData.subCategory },
      });
      if (!subCategories.length) {
        return res.status(400).json({ message: "Invalid subCategory IDs" });
      }
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("category", "name")
      .populate("subCategory", "name");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Delete Product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      product,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Category wise products
const categoryWiseProduct = async (req, res) => {
  try {
    const { category } = req.body;

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      return res.status(404).json({ message: "Category not found" });
    }

    const products = await Product.find({ category: categoryDoc._id }).populate(
      "category"
    );

    return res.status(200).json({
      success: true,
      message: "Category wise products",
      data: products,
      count: products.length,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ SubCategory wise products
const getProductsBySubCategories = async (req, res) => {
  try {
    let { subCategories } = req.query;

    if (!subCategories) {
      return res
        .status(400)
        .json({ message: "subCategories query is required" });
    }

    // Split comma-separated string into array
    if (typeof subCategories === "string") {
      subCategories = subCategories.split(",");
    }

    // Check if we're dealing with ObjectIds or names
    const isObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id.trim());

    let query;
    if (subCategories.every(isObjectId)) {
      const subCategoryIds = subCategories.map(
        (id) => new mongoose.Types.ObjectId(id.trim())
      );
      query = { subCategory: { $in: subCategoryIds } };
    } else {
      query = { "subCategory.name": { $in: subCategories } };
    }

    const products = await Product.find(query)
      .populate("subCategory", "name")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      total: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products by subCategories:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ✅ Bulk Upload Products

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  categoryWiseProduct,
  // bulkUploadProducts,
  getProductsBySubCategories,
};
