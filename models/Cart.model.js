const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true, // must always have a product
  },
  name: { type: String, required: true }, // product name
  image: { type: String }, // optional
  unit: { type: String }, // optional
  mrp: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 }, // optional but default 0
  discount: { type: Number, default: 0 },
  quantity: { type: Number, default: 1 },
  lineTotal: { type: Number, default: 0 },
});

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [cartItemSchema], default: [] },
    subTotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
