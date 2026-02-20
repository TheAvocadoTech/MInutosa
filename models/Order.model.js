const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: String,
    price: Number,
    quantity: Number,
  },
  { _id: false },
);

const AddressSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    line1: String,
    city: String,
    state: String,
    pincode: String,
  },
  { _id: false },
);

// 🔹 NEW: Payment sub-schema
const PaymentSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["NOT_INITIATED", "PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "NOT_INITIATED",
    },
    razorpayOrderId: { type: String, default: null }, // created on Step 1
    razorpayPaymentId: { type: String, default: null }, // filled after success
    razorpaySignature: { type: String, default: null }, // filled after verify
    paidAt: { type: Date, default: null },
  },
  { _id: false },
);

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingAddress: AddressSchema,
    status: {
      type: String,
      enum: ["PLACED", "ACCEPTED", "REJECTED", "COMPLETED"],
      default: "PLACED",
    },
    // 🔹 NEW: Embedded payment info
    payment: {
      type: PaymentSchema,
      default: () => ({}),
    },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);
