// const Order = require("../models/Order");
// const Product = require("../models/Product");
// const Vendor = require("../models/Vendor");
// const io = require("../socket").getIO();

// exports.createOrder = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { items, shippingAddress, selectedStore, paymentMethod } = req.body;

//     const productIds = items.map((i) => i.product);
//     const productDocs = await Product.find({ _id: { $in: productIds } });

//     let subtotal = 0;
//     const orderItems = items.map((i) => {
//       const p = productDocs.find((x) => x._id.equals(i.product));
//       subtotal += p.price * i.quantity;

//       return {
//         product: p._id,
//         quantity: i.quantity,
//         price: p.price,
//         name: p.name,
//         vendorId: p.vendorId,
//       };
//     });

//     const tax = subtotal * 0.05;
//     const deliveryFee = 20;
//     const totalAmount = subtotal + tax + deliveryFee;

//     const vendor = await Vendor.findById(selectedStore.storeId);

//     const storeSnapshot = {
//       storeId: vendor._id,
//       name: vendor.businessName,
//       phone: vendor.phone,
//       streetAddress: vendor.streetAddress,
//       city: vendor.city,
//       state: vendor.state,
//       pinCode: vendor.pinCode,
//       latitude: vendor.latitude,
//       longitude: vendor.longitude,
//       autoSelected: selectedStore.autoSelected,
//     };

//     const order = await Order.create({
//       user: userId,
//       items: orderItems,
//       subtotal,
//       tax,
//       deliveryFee,
//       totalAmount,
//       shippingAddress,
//       selectedStore: storeSnapshot,
//       paymentMethod,
//       status: "PLACED",
//       events: [{ status: "PLACED", actor: "USER" }],
//     });

//     io.emit("admin_new_order", order);
//     io.emit(`vendor_${vendor._id}`, { type: "NEW_ORDER", order });

//     res.json({ success: true, orderId: order._id, order });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Error creating order" });
//   }
// };

// exports.getOrder = async (req, res) => {
//   const order = await Order.findById(req.params.id)
//     .populate("items.product")
//     .populate("deliveryAgent.partnerId");

//   res.json({ success: true, order });
// };

// exports.getMyOrders = async (req, res) => {
//   const orders = await Order.find({ user: req.user.id }).sort({
//     createdAt: -1,
//   });
//   res.json({ success: true, orders });
// };

// exports.getAllOrders = async (req, res) => {
//   const orders = await Order.find().sort({ createdAt: -1 });
//   res.json({ success: true, orders });
// };
