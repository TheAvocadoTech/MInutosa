const express = require("express");
const { loginAdmin } = require("../controllers/admin.controller");

const router = express.Router();

router.post("/adminLogin", loginAdmin);
module.exports = router;
