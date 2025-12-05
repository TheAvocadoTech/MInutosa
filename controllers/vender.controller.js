const Order = require("../models/Order");
const io = require("../socket").getIO();

exports.vendorAccept = async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      status: "VENDOR_ACCEPTED",
      vendorAcceptedAt: new Date(),
      $push: {
        events: {
          status: "VENDOR_ACCEPTED",
          actor: "VENDOR",
          actorId: req.vendor.id,
        },
      },
    },
    { new: true }
  );

  io.to(orderId).emit("statusUpdate", { status: "VENDOR_ACCEPTED" });

  res.json({ success: true, order });
};

exports.vendorReady = async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      status: "READY_FOR_PICKUP",
      readyForPickupAt: new Date(),
      $push: { events: { status: "READY_FOR_PICKUP", actor: "VENDOR" } },
    },
    { new: true }
  );

  io.emit("delivery_new_order", order);
  io.to(orderId).emit("statusUpdate", { status: "READY_FOR_PICKUP" });

  res.json({ success: true, order });
};
