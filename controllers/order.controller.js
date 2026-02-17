const Order = require("../models/Order.model");
const Product = require("../models/Product.model");
const Vendor = require("../models/Vendor.model");
const mongoose = require("mongoose");

// 🔹 CREATE ORDER
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { vendorId, items, shippingAddress } = req.body;

    if (!vendorId)
      return res.status(400).json({ message: "Vendor is required" });

    const vendorExists = await Vendor.findById(vendorId);
    if (!vendorExists)
      return res.status(400).json({ message: "Vendor not found" });

    if (!items || items.length === 0)
      return res.status(400).json({ message: "No items provided" });

    const products = await Product.find({
      _id: { $in: items.map((i) => i.product) },
    });

    if (products.length === 0)
      return res.status(400).json({ message: "Products not found" });

    let totalAmount = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p) => p._id.toString() === item.product);
      if (!product) throw new Error("Invalid product in order");
      totalAmount += product.price * item.quantity;
      return {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      };
    });

    const order = await Order.create({
      user: userId,
      vendor: vendorId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      status: "PLACED",
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating order" });
  }
};

// 🔹 GET USER ORDERS
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("vendor", "businessName phone")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// ✅ FIXED: GET VENDOR ORDERS — populates user + full product (including images array)
exports.getVendorOrders = async (req, res) => {
  try {
    // console.log("Logged in vendor ID:", req.vendor._id);

    const orders = await Order.find({ vendor: req.vendor._id })
      // ✅ populate all user fields needed for display
      .populate("user", "firstName lastName email phone")
      // ✅ populate full product including images array
      .populate(
        "items.product",
        "name description price originalPrice discount discountedMRP sku category subCategory images photos gallery imageUrl image photo thumbnail unit pack stock productName rating",
      )
      .sort({ createdAt: -1 });

    console.log("Orders found:", orders.length);
    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    res.status(500).json({ message: "Error fetching vendor orders" });
  }
};

// 🔹 GET SINGLE ORDER
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "firstName lastName email")
      .populate("vendor", "businessName phone")
      .populate("items.product");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: "Error fetching order" });
  }
};

// 🔹 ADMIN GET ALL ORDERS
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "email")
      .populate("vendor", "businessName")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching all orders" });
  }
};

// 🔹 VENDOR UPDATE ORDER STATUS
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["ACCEPTED", "REJECTED", "COMPLETED"];
    if (!allowedStatuses.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
};
