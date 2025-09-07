const mongoose = require("mongoose");
const Subcategory = require("../models/subCategory.model");
const Category = require("../models/Category.model");

// ================= Helper Functions ================= //

// Validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Find category by ID or name
const findCategory = async (categoryInput) => {
  if (isValidObjectId(categoryInput)) {
    return await Category.findById(categoryInput);
  }
  return await Category.findOne({ name: categoryInput });
};

// ================= CRUD Controllers ================= //

// CREATE Subcategory
const createSubcategory = async (req, res) => {
  try {
    const { name, category } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        message: "Name and category ID/name are required",
      });
    }

    const categoryExists = await findCategory(category);
    if (!categoryExists) {
      return res.status(400).json({
        message: "Invalid category. Category does not exist.",
      });
    }

    const categoryId = categoryExists._id;

    // Prevent duplicates
    const existingSubcategory = await Subcategory.findOne({
      name: name.trim(),
      category: categoryId,
    });
    if (existingSubcategory) {
      return res.status(400).json({
        message: "Subcategory with this name already exists in this category",
      });
    }

    const subcategory = await Subcategory.create({
      name: name.trim(),
      category: categoryId,
    });

    const populatedSubcategory = await Subcategory.findById(
      subcategory._id
    ).populate("category", "name");

    return res.status(201).json({
      message: "Subcategory created successfully",
      subcategory: populatedSubcategory,
    });
  } catch (error) {
    console.error("Error creating subcategory:", error);

    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation error", details: error.message });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid category ID format" });
    }
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Duplicate subcategory name in this category" });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

// READ All Subcategories (with pagination & filter)
const getSubcategories = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (category) {
      if (isValidObjectId(category)) {
        filter.category = category;
      } else {
        const categoryDoc = await Category.findOne({ name: category });
        if (!categoryDoc) {
          return res.status(400).json({ message: "Category not found" });
        }
        filter.category = categoryDoc._id;
      }
    }

    const limitNum = Math.min(Math.max(parseInt(limit), 1), 100);
    const pageNum = Math.max(parseInt(page), 1);

    const subcategories = await Subcategory.find(filter)
      .populate("category", "name")
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ name: 1 });

    const total = await Subcategory.countDocuments(filter);

    return res.status(200).json({
      message: "Subcategories retrieved successfully",
      subcategories,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// READ Subcategory by ID
const getSubcategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid subcategory ID format" });
    }

    const subcategory = await Subcategory.findById(id).populate(
      "category",
      "name"
    );

    if (!subcategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    return res.status(200).json({
      message: "Subcategory retrieved successfully",
      subcategory,
    });
  } catch (error) {
    console.error("Error fetching subcategory:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// READ Subcategories by Category
const getSubcategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!isValidObjectId(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID format" });
    }

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(404).json({ message: "Category not found" });
    }

    const subcategories = await Subcategory.find({ category: categoryId })
      .populate("category", "name")
      .sort({ name: 1 });

    return res.status(200).json({
      message: "Subcategories retrieved successfully",
      category: categoryExists.name,
      subcategories,
      count: subcategories.length,
    });
  } catch (error) {
    console.error("Error fetching subcategories by category:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE Subcategory
const updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid subcategory ID format" });
    }
    if (!name || !category) {
      return res
        .status(400)
        .json({ message: "Name and category ID/name are required" });
    }

    const categoryExists = await findCategory(category);
    if (!categoryExists) {
      return res
        .status(400)
        .json({ message: "Invalid category. Category does not exist." });
    }

    const categoryId = categoryExists._id;

    const existingSubcategory = await Subcategory.findOne({
      name: name.trim(),
      category: categoryId,
      _id: { $ne: id },
    });
    if (existingSubcategory) {
      return res.status(400).json({
        message: "Subcategory with this name already exists in this category",
      });
    }

    const subcategory = await Subcategory.findByIdAndUpdate(
      id,
      { name: name.trim(), category: categoryId },
      { new: true, runValidators: true }
    ).populate("category", "name");

    if (!subcategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    return res.status(200).json({
      message: "Subcategory updated successfully",
      subcategory,
    });
  } catch (error) {
    console.error("Error updating subcategory:", error);

    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation error", details: error.message });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE Subcategory
const deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid subcategory ID format" });
    }

    const subcategory = await Subcategory.findByIdAndDelete(id).populate(
      "category",
      "name"
    );

    if (!subcategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    return res.status(200).json({
      message: "Subcategory deleted successfully",
      subcategory,
    });
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ================= Export ================= //
module.exports = {
  createSubcategory,
  getSubcategories,
  getSubcategoryById,
  getSubcategoriesByCategory,
  updateSubcategory,
  deleteSubcategory,
};
