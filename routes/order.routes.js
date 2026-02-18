const router = require("express").Router();
const orderCtrl = require("../controllers/order.controller");

const {
  protect,
  protectVendor,
  admin,
} = require("../middleware/auth.middleware");

// USER
router.post("/create", protect, orderCtrl.createOrder);
router.get("/my-orders", protect, orderCtrl.getMyOrders);
router.get("/:id", protect, orderCtrl.getOrder);

// VENDOR
router.get("/vendor/orders", protectVendor, orderCtrl.getVendorOrders);
router.put("/vendor/:id/status", protectVendor, orderCtrl.updateOrderStatus);

// ADMIN
router.get("/admin/all", orderCtrl.getAllOrders);

module.exports = router;
