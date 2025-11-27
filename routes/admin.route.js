const express = require("express");
const { loginAdmin } = require("../controllers/admin.controller");
const {
  requireAdmin,
  authMiddleware,
} = require("../middleware/auth.middleware");
const router = express.Router();

router.post("/adminLogin", loginAdmin);
module.exports = router;
