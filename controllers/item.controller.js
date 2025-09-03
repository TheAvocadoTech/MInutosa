const mongoose = require("mongoose");
const Item = require("../models/item.model");
const Category = require("../models/Category.model");
const Subcategory = require("../models/subCategory.model"); // Make sure this is exporting 'Subcategory'

const createItem = async (req, res) => {
  try {
    const itemData = req.body;

    // Validate required fields
    const requiredFields = [
      "productNo",
      "name",
      "brand",
      "category",
      "subcategory",
    ];
    const missingFields = requiredFields.filter((field) => !itemData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `The following fields are required: ${missingFields.join(
          ", "
        )}`,
        missingFields,
      });
    }

    // Validate and fetch category
    const categoryExists = mongoose.Types.ObjectId.isValid(itemData.category)
      ? await Category.findById(itemData.category)
      : await Category.findOne({ name: itemData.category });

    if (!categoryExists) {
      return res
        .status(400)
        .json({ message: "Invalid category. No matching category found." });
    }

    // Validate and fetch subcategory
    const subcategoryExists = mongoose.Types.ObjectId.isValid(
      itemData.subcategory
    )
      ? await Subcategory.findById(itemData.subcategory)
      : await Subcategory.findOne({ name: itemData.subcategory });

    if (!subcategoryExists) {
      return res.status(400).json({
        message: "Invalid subcategory. No matching subcategory found.",
      });
    }

    // Replace name with ObjectId
    itemData.category = categoryExists._id;
    itemData.subcategory = subcategoryExists._id;

    // Create and populate item
    const item = await Item.create(itemData);
    const populatedItem = await Item.findById(item._id)
      .populate("category", "name")
      .populate("subcategory", "name");
    ç;

    return res.status(201).json({
      message: "Item created successfully",
      item: populatedItem,
    });
  } catch (error) {
    console.error("Error creating item:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate entry found",
        details: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Additional CRUD operations for completeness
const getAllItems = async (req, res) => {
  try {
    const { category, subcategory, brand } = req.query;

    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (brand) filter.brand = new RegExp(brand, "i"); // Case-insensitive search

    // Fetch all items with filters and sorting
    // Remove populate if models are not properly registered
    const items = await Item.find(filter)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Items retrieved successfully",
      data: items,
      total: items.length,
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    return res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message 
    });
  }
};

const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id)
      .populate("category", "name")
      .populate("subcategory", "name");

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(200).json({
      message: "Item retrieved successfully",
      item,
    });
  } catch (error) {
    console.error("Error fetching item:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If category or subcategory is being updated, validate them
    if (updateData.category) {
      const categoryExists = await Category.findById(updateData.category);
      if (!categoryExists) {
        return res.status(400).json({
          message: "Invalid category ID. Category does not exist.",
        });
      }
    }

    if (updateData.subcategory) {
      const subcategoryExists = await Subcategory.findById(
        updateData.subcategory
      );
      if (!subcategoryExists) {
        return res.status(400).json({
          message: "Invalid subcategory ID. Subcategory does not exist.",
        });
      }
    }

    const item = await Item.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("category", "name")
      .populate("subcategory", "name");

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(200).json({
      message: "Item updated successfully",
      item,
    });
  } catch (error) {
    console.error("Error updating item:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(200).json({
      message: "Item deleted successfully",
      item,
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const categoryWiseItem = async (req, res) => {
  try {
    const { category } = req.body;

    if (!category) {
      return res.status(400).json({
        message: "Category is required",
        error: true,
        success: false,
      });
    }

    // First find the category by name
    const categoryDoc = await Category.findOne({ name: category });

    if (!categoryDoc) {
      return res.status(404).json({
        message: "Category not found",
        error: true,
        success: false,
      });
    }

    // Then find items using the category ObjectId
    const items = await Item.find({
      category: categoryDoc._id,
    }).populate("category"); // Optional: populate to get category details

    return res.status(200).json({
      message: "Category wise Item List",
      data: items,
      category: category,
      count: items.length,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

const subCategoryWiseItem = async (req, res) => {
  try {
    const { subCategory } = req.body;

    if (!subCategory) {
      return res.status(400).json({
        message: "Sub Category is required",
        error: true,
        success: false,
      });
    }

    const subCategoryDoc = await Subcategory.findOne({ name: subCategory });

    // Check if subcategory exists
    if (!subCategoryDoc) {
      return res.status(404).json({
        message: "Sub Category not found",
        error: true,
        success: false
      });
    }

    const items = await Item.find({
      subCategory: subCategoryDoc._id
    }).populate('subCategory'); // Optional: populate to get subcategory details

    return res.status(200).json({
      message: "Sub-Category wise Item List",
      data: items,
      subCategory: subCategory, // Fixed: was 'category', should be 'subCategory'
      count: items.length,
      error: false,
      success: true
    });
  }
  catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  } // Fixed: missing closing brace
};
module.exports = {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  categoryWiseItem,
  subCategoryWiseItem
};
