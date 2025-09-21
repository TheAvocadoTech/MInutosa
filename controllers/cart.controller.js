// controllers/cartController.js

const Cart = require("../models/Cart.model");
const Product = require("../models/Product.model");
// Helper to safely convert ObjectId to string
const safeId = (id) => (id ? id.toString() : "");

// Get User Cart
const userCart = async (req, res) => {
  const userId = req.query.userId;

  if (!userId) return res.status(400).json({ message: "userId is required" });

  try {
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      return res.status(200).json({
        message: "Cart is empty",
        cart: { items: [] },
      });
    }

    // Filter out any malformed items
    cart.items = cart.items.filter((item) => item.product);

    res.status(200).json({
      message: "Cart fetched successfully",
      cart,
    });
  } catch (error) {
    console.error("Error fetching user cart:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Add to Cart
const addToCart = async (req, res) => {
  const { userId, productId, quantity = 1 } = req.body;

  if (!userId || !productId) {
    return res
      .status(400)
      .json({ message: "userId and productId are required" });
  }

  try {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, items: [] });

    const index = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (index > -1) {
      cart.items[index].quantity += quantity;
      cart.items[index].lineTotal =
        cart.items[index].quantity * cart.items[index].sellingPrice;
    } else {
      // Fetch product details
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
        quantity,
        lineTotal: quantity * (product.price || 0),
      });
    }

    // Recalculate cart totals
    cart.subTotal = cart.items.reduce((sum, item) => sum + item.lineTotal, 0);
    cart.grandTotal = cart.subTotal + cart.deliveryFee;

    await cart.save();

    res.status(200).json({ message: "Product added to cart", cart });
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// Remove from Cart
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

    // Filter out malformed items
    cart.items = cart.items.filter((item) => item.product);

    const exists = cart.items.some(
      (item) => safeId(item.product) === productId
    );

    if (!exists)
      return res.status(404).json({ message: "Product not found in cart" });

    cart.items = cart.items.filter(
      (item) => safeId(item.product) !== productId
    );

    await cart.save();

    res.status(200).json({ message: "Product removed from cart", cart });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Quantity
const updateQuantity = async (req, res) => {
  const { userId, productId, quantity } = req.body;

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

    // Filter out malformed items
    cart.items = cart.items.filter((item) => item.product);

    const productIndex = cart.items.findIndex(
      (item) => safeId(item.product) === productId
    );

    if (productIndex === -1)
      return res.status(404).json({ message: "Product not found in cart" });

    cart.items[productIndex].quantity = quantity;

    await cart.save();

    res.status(200).json({ message: "Cart updated successfully", cart });
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { userCart, addToCart, removeFromCart, updateQuantity };
