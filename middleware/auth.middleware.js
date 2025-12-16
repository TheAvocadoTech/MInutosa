const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

/**
 * AUTHENTICATION
 * - USER / ADMIN / DELIVERY_AGENT
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach full user (includes role & isAdmin)
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * ADMIN ONLY
 */
const admin = (req, res, next) => {
  if (!req.user || (!req.user.isAdmin && req.user.role !== "ADMIN")) {
    return res.status(403).json({
      message: "Admin access only",
    });
  }
  next();
};

/**
 * DELIVERY AGENT ONLY
 */
const deliveryOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "DELIVERY_AGENT") {
    return res.status(403).json({
      message: "Delivery agent access only",
    });
  }
  next();
};

/**
 * GENERIC ROLE GUARD (OPTIONAL BUT CLEAN)
 */
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

module.exports = {
  protect,
  admin,
  deliveryOnly,
  allowRoles,
};
