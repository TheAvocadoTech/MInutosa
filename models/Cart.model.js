const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String },
  unit: { type: String },
  mrp: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  quantity: { type: Number, default: 1 },
  lineTotal: { type: Number, default: 0 },
});

cartItemSchema.pre("save", function (next) {
  this.lineTotal = this.sellingPrice * this.quantity;
  next();
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one active cart per user
    },
    items: { type: [cartItemSchema], default: [] },
    subTotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "ordered", "abandoned"],
      default: "active",
    },
  },
  { timestamps: true }
);

cartSchema.pre("save", function (next) {
  this.subTotal = this.items.reduce((sum, item) => sum + item.lineTotal, 0);
  this.grandTotal = this.subTotal + this.deliveryFee;
  next();
});

module.exports = mongoose.model("Cart", cartSchema);
