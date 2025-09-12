const Product = require("../models/Product.model");
const Category = require("../models/Category.model");
const SubCategory = require("../models/subCategory.model");

// ✅ Create Product
const createProduct = async (req, res) => {
  try {
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
    const categories = await Category.find({
      _id: { $in: productData.category },
    });

    if (!categories.length) {
      return res.status(400).json({ message: "Invalid category IDs" });
    }

    // ✅ Validate & fetch subcategories (array support)
    const subCategories = await SubCategory.find({
      _id: { $in: productData.subCategory },
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
    const { category, subCategory, name } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (name) filter.name = new RegExp(name, "i");

    const products = await Product.find(filter)
      .populate("category", "name")
      .populate("subCategory", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: products,
      total: products.length,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get Product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

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
const subCategoryWiseProduct = async (req, res) => {
  try {
    const { subCategory } = req.body;

    if (!subCategory) {
      return res.status(400).json({ message: "SubCategory is required" });
    }

    const subCategoryDoc = await SubCategory.findOne({ name: subCategory });
    if (!subCategoryDoc) {
      return res.status(404).json({ message: "SubCategory not found" });
    }

    const products = await Product.find({
      subCategory: subCategoryDoc._id,
    }).populate("subCategory");

    return res.status(200).json({
      success: true,
      message: "SubCategory wise products",
      data: products,
      count: products.length,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  categoryWiseProduct,
  subCategoryWiseProduct,
};
