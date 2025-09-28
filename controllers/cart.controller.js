// controllers/cartController.js

const Cart = require("../models/Cart.model");
const Product = require("../models/Product.model");

// Helper to safely convert ObjectId to string
const safeId = (id) => (id ? id.toString() : "");

// Get User Cart - Updated to handle both query and URL params
const userCart = async (req, res) => {
  // Support both /api/cart?userId=xxx and /api/cart/xxx formats
  const userId = req.query.userId || req.params.userId;

  if (!userId) return res.status(400).json({ message: "userId is required" });

  try {
    const cart = await Cart.findOne({ user: userId }).populate(
      "items.productId"
    );
    if (!cart) {
      return res.status(200).json({
        message: "Cart is empty",
        items: [], // ✅ Frontend expects 'items' directly
      });
    }

    // Filter out any malformed items
    const validItems = cart.items
      .filter((item) => item.product || item.productId)
      .map((item) => ({
        _id: item._id,
        productId: item.productId,
        name: item.name,
        image: item.image,
        images: item.image ? [item.image] : [], // ✅ Add images array for frontend
        unit: item.unit,
        price: item.sellingPrice, // ✅ Frontend expects 'price'
        originalPrice: item.mrp,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
        discount: item.discount,
      }));

    res.status(200).json({
      message: "Cart fetched successfully",
      items: validItems, // ✅ Return items directly
      subTotal: cart.subTotal,
      grandTotal: cart.grandTotal,
    });
  } catch (error) {
    console.error("Error fetching user cart:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Add to Cart - Updated to handle both add and update properly
const addToCart = async (req, res) => {
  const { userId, productId, quantity = 1, isUpdate = false } = req.body;

  console.log("Add to cart request:", {
    userId,
    productId,
    quantity,
    isUpdate,
  }); // Debug log

  if (!userId || !productId) {
    return res
      .status(400)
      .json({ message: "userId and productId are required" });
  }

  try {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, items: [] });

    const index = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (index > -1) {
      // If it's an update request, SET the quantity instead of adding
      if (isUpdate) {
        cart.items[index].quantity = parseInt(quantity);
      } else {
        // Only add to existing quantity if it's a new add request
        cart.items[index].quantity += parseInt(quantity);
      }
      cart.items[index].lineTotal =
        cart.items[index].quantity * cart.items[index].sellingPrice;
    } else {
      // Add new item
      const product = await Product.findById(productId);
      if (!product)
        return res.status(404).json({ message: "Product not found" });

      cart.items.push({
        productId: product._id,
        name: product.name,
        image: product.images?.[0] || "",
        unit: product.unit || "",
        mrp: product.originalPrice || 0,
        sellingPrice: product.price || 0,
        discount: product.originalPrice
          ? Math.round(
              ((product.originalPrice - product.price) /
                product.originalPrice) *
                100
            )
          : 0,
        quantity: parseInt(quantity),
        lineTotal: parseInt(quantity) * (product.price || 0),
      });
    }

    // Recalculate cart totals
    cart.subTotal = cart.items.reduce((sum, item) => sum + item.lineTotal, 0);
    cart.grandTotal = cart.subTotal + (cart.deliveryFee || 0);

    await cart.save();

    console.log("Cart updated successfully"); // Debug log

    // Format response
    const formattedItems = cart.items.map((item) => ({
      _id: item._id,
      productId: item.productId,
      name: item.name,
      image: item.image,
      images: item.image ? [item.image] : [],
      unit: item.unit,
      price: item.sellingPrice,
      originalPrice: item.mrp,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
      discount: item.discount,
    }));

    res.status(200).json({
      message: "Product added to cart",
      items: formattedItems,
      subTotal: cart.subTotal,
      grandTotal: cart.grandTotal,
    });
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Remove from Cart - Updated
const removeFromCart = async (req, res) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res
      .status(400)
      .json({ message: "userId and productId are required" });
  }

  try {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Remove item by productId
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // Recalculate totals
    cart.subTotal = cart.items.reduce((sum, item) => sum + item.lineTotal, 0);
    cart.grandTotal = cart.subTotal + (cart.deliveryFee || 0);

    await cart.save();

    // Format response
    const formattedItems = cart.items.map((item) => ({
      _id: item._id,
      productId: item.productId,
      name: item.name,
      image: item.image,
      images: item.image ? [item.image] : [],
      unit: item.unit,
      price: item.sellingPrice,
      originalPrice: item.mrp,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
      discount: item.discount,
    }));

    res.status(200).json({
      message: "Product removed from cart",
      items: formattedItems,
      subTotal: cart.subTotal,
      grandTotal: cart.grandTotal,
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Quantity - Fixed
const updateQuantity = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  console.log("Update quantity request:", { userId, productId, quantity }); // Debug log

  if (!userId || !productId) {
    return res
      .status(400)
      .json({ message: "userId and productId are required" });
  }

  if (quantity === undefined || quantity <= 0) {
    return res.status(400).json({ message: "Quantity must be greater than 0" });
  }

  try {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Find item by productId (not product)
    const productIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (productIndex === -1) {
      console.log(
        "Product not found in cart. Available items:",
        cart.items.map((item) => ({
          productId: item.productId.toString(),
          name: item.name,
        }))
      );
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // Update quantity and line total
    cart.items[productIndex].quantity = parseInt(quantity);
    cart.items[productIndex].lineTotal =
      parseInt(quantity) * cart.items[productIndex].sellingPrice;

    // Recalculate totals
    cart.subTotal = cart.items.reduce((sum, item) => sum + item.lineTotal, 0);
    cart.grandTotal = cart.subTotal + (cart.deliveryFee || 0);

    await cart.save();

    console.log("Cart updated successfully:", cart.items[productIndex]); // Debug log

    // Format response
    const formattedItems = cart.items.map((item) => ({
      _id: item._id,
      productId: item.productId,
      name: item.name,
      image: item.image,
      images: item.image ? [item.image] : [],
      unit: item.unit,
      price: item.sellingPrice,
      originalPrice: item.mrp,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
      discount: item.discount,
    }));

    res.status(200).json({
      message: "Cart updated successfully",
      items: formattedItems,
      subTotal: cart.subTotal,
      grandTotal: cart.grandTotal,
    });
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { userCart, addToCart, removeFromCart, updateQuantity };
