const router = require("express").Router();
const deliveryCtrl = require("../controllers/deliveryAgent.controller");
const deliveryAuth = require("../middleware/deliveryAuth");
const upload = require("../utils/multer");

router.get("/orders", deliveryAuth, deliveryCtrl.getAvailableOrders);
router.put("/:orderId/accept", deliveryAuth, deliveryCtrl.acceptOrder);
router.put("/:orderId/pick", deliveryAuth, deliveryCtrl.pickUpOrder);
router.put(
  "/:orderId/out-for-delivery",
  deliveryAuth,
  deliveryCtrl.outForDelivery
);
router.post("/location", deliveryAuth, deliveryCtrl.updateLocation);
router.put(
  "/:orderId/deliver",
  deliveryAuth,
  upload.single("photo"),
  deliveryCtrl.deliverOrder
);

module.exports = router;
