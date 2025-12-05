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
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
  },
  { _id: false }
);

const StoreSnapshotSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    name: String,
    phone: String,
    streetAddress: String,
    city: String,
    state: String,
    pinCode: String,
    latitude: Number,
    longitude: Number,
    autoSelected: Boolean,
  },
  { _id: false }
);

const AddressSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    latitude: Number,
    longitude: Number,
  },
  { _id: false }
);

const DeliveryAgentSnapshotSchema = new mongoose.Schema(
  {
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryPartner" },
    name: String,
    phone: String,
    vehicleType: String,
    vehicleNumber: String,
  },
  { _id: false }
);

const ProofSchema = new mongoose.Schema(
  {
    photoUrl: String,
    note: String,
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: { type: [OrderItemSchema], required: true },

    subtotal: Number,
    tax: Number,
    deliveryFee: Number,
    discounts: Number,
    totalAmount: Number,

    shippingAddress: AddressSchema,
    selectedStore: StoreSnapshotSchema,

    paymentMethod: { type: String, enum: ["COD", "RAZORPAY"], default: "COD" },
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PENDING", "PAID", "FAILED"],
      default: "UNPAID",
    },

    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    deliveryAgent: DeliveryAgentSnapshotSchema,
    deliveryAgentLocation: {
      lat: Number,
      lng: Number,
      updatedAt: Date,
    },

    vendorNotifiedAt: Date,
    vendorAcceptedAt: Date,
    readyForPickupAt: Date,
    agentAssignedAt: Date,
    pickedUpAt: Date,
    outForDeliveryAt: Date,
    deliveredAt: Date,

    deliveryProof: ProofSchema,

    status: {
      type: String,
      enum: [
        "PLACED",
        "VENDOR_NOTIFIED",
        "VENDOR_ACCEPTED",
        "READY_FOR_PICKUP",
        "AGENT_ASSIGNED",
        "PICKED_UP",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PLACED",
    },

    events: [
      {
        status: String,
        actor: String,
        actorId: mongoose.Schema.Types.ObjectId,
        note: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
