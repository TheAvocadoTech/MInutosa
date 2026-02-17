const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Vendor = require("../models/Vendor.model");

// ─────────────────────────────────────────────────────────────────────────────
// SHARED HELPER — verify Bearer token and return decoded payload
// ─────────────────────────────────────────────────────────────────────────────
const extractToken = (req) => {
  if (req.headers.authorization?.startsWith("Bearer")) {
    return req.headers.authorization.split(" ")[1];
  }
  if (req.cookies?.jwt) {
    return req.cookies.jwt;
  }
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// USER / ADMIN / DELIVERY_AGENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Protect routes that require a logged-in USER
 * Attaches: req.user
 */
const protect = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * ADMIN only
 */
const admin = (req, res, next) => {
  if (!req.user || (!req.user.isAdmin && req.user.role !== "ADMIN")) {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

/**
 * DELIVERY AGENT only
 */
const deliveryOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "DELIVERY_AGENT") {
    return res.status(403).json({ message: "Delivery agent access only" });
  }
  next();
};

/**
 * Generic role guard  e.g. allowRoles("ADMIN", "DELIVERY_AGENT")
 */
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Protect routes that require a logged-in VENDOR
 * Attaches: req.vendor
 *
 * Also blocks REJECTED vendors from accessing protected routes.
 */
const protectVendor = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const vendor = await Vendor.findById(decoded.id).select(
      "-password -confirmPassword",
    );
    if (!vendor) {
      return res.status(401).json({ message: "Vendor not found" });
    }

    if (vendor.status === "REJECTED") {
      return res.status(403).json({
        message: "Your account has been rejected. Please contact support.",
      });
    }

    req.vendor = vendor;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * ACCEPTED vendors only  (use after protectVendor)
 * Useful if you want PENDING vendors to log in but not access certain routes.
 *
 * Usage:  router.get("/dashboard", protectVendor, acceptedVendorOnly, handler)
 */
const acceptedVendorOnly = (req, res, next) => {
  if (!req.vendor || req.vendor.status !== "ACCEPTED") {
    return res.status(403).json({
      message: "Your account is pending approval.",
    });
  }
  next();
};

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  // user
  protect,
  admin,
  deliveryOnly,
  allowRoles,
  // vendor
  protectVendor,
  acceptedVendorOnly,
};
