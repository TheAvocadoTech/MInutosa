// controllers/cartController.js

const Cart = require("../models/Cart.model");
const Product = require("../models/Product.model");

// ---------------- GET USER CART ----------------
const userCart = async (req, res) => {
  const userId = req.query.userId || req.params.userId;
  if (!userId) return res.status(400).json({ message: "userId is required" });

  try {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(200).json({
        items: [],
        subTotal: 0,
        grandTotal: 0,
      });
    }

    res.status(200).json({
      items: cart.items.map(formatItem),
      subTotal: cart.subTotal,
      grandTotal: cart.grandTotal,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- ADD TO CART ----------------
const addToCart = async (req, res) => {
  const { userId, productId, quantity = 1 } = req.body;

  if (!userId || !productId)
    return res.status(400).json({ message: "Missing fields" });

  try {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId });

    const index = cart.items.findIndex(
      (i) => i.productId.toString() === productId
    );

    if (index > -1) {
      cart.items[index].quantity += Number(quantity);
    } else {
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
        quantity: Number(quantity),
      });
    }

    await cart.save();

    res.status(200).json({
      message: "Added to cart",
      items: cart.items.map(formatItem),
      subTotal: cart.subTotal,
      grandTotal: cart.grandTotal,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- UPDATE QUANTITY ----------------
const updateQuantity = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  if (!userId || !productId || quantity <= 0)
    return res.status(400).json({ message: "Invalid request" });

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find((i) => i.productId.toString() === productId);

    if (!item) return res.status(404).json({ message: "Item not in cart" });

    item.quantity = Number(quantity);
    await cart.save();

    res.status(200).json({
      message: "Quantity updated",
      items: cart.items.map(formatItem),
      subTotal: cart.subTotal,
      grandTotal: cart.grandTotal,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- REMOVE FROM CART ----------------
const removeFromCart = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((i) => i.productId.toString() !== productId);

    await cart.save();

    res.status(200).json({
      message: "Item removed",
      items: cart.items.map(formatItem),
      subTotal: cart.subTotal,
      grandTotal: cart.grandTotal,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- FORMAT RESPONSE ----------------
const formatItem = (item) => ({
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
});

module.exports = {
  userCart,
  addToCart,
  updateQuantity,
  removeFromCart,
};
