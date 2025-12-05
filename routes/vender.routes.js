const router = require("express").Router();
const vendorCtrl = require("../controllers/vendorOrder.controller");
const vendorAuth = require("../middleware/vendorAuth");

router.put("/:orderId/accept", vendorAuth, vendorCtrl.vendorAccept);
router.put("/:orderId/ready", vendorAuth, vendorCtrl.vendorReady);

module.exports = router;
