const express = require("express");
const router = express.Router();
const vendorController = require("../controllers/vender.controller"); // keep path you use

// Optional: add your auth/admin middleware here
// const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Create a new vendor
router.post("/createVendor", vendorController.createVendor);

// Get all vendors (optionally filter by status via query ?status=ACCEPTED)
router.get("/getAllVendors", vendorController.getAllVendors);

// Get vendors by status (explicit route)
// e.g. GET /vendors/status/PENDING
// router.get("/status/:status", vendorController.getVendorsByStatus);

// Get a single vendor by ID
router.get("/getVendorById/:id", vendorController.getVendorById);

// Update a vendor (partial or full update)
router.put("/updateVendor/:id", vendorController.updateVendor);

// Admin: update vendor status (accept/reject)
// example body: { "status": "ACCEPTED" }
router.put(
  "/updateStatus/:id",
  /* isAdmin, */ vendorController.updateVendorStatus
);

// Delete a vendor
router.delete("/deleteVendor/:id", vendorController.deleteVendor);

module.exports = router;
