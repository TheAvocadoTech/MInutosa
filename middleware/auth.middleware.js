// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader =
      req.headers.authorization ||
      req.cookies?.authorization ||
      req.headers["x-access-token"];

    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized: Token missing" });
    }

    // support "Bearer <token>" or token passed directly in header/cookie
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");

    // support both payload shapes: { userId } or { id }
    const userId = decoded.userId || decoded.id || decoded._id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid token payload" });
    }

    // fetch user, exclude password + otp
    const user = await User.findById(userId).select("-password -__v");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    // TokenExpiredError vs others
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired. Please login again." });
    }
    console.error("Auth Middleware Error:", error);
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid or expired token" });
  }
};

// role-based admin check
const requireAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const role = (req.user.role || "").toString().toLowerCase();
    if (role !== "admin" && role !== "superadmin") {
      return res.status(403).json({ message: "Access Denied: Admin only" });
    }
    next();
  } catch (err) {
    console.error("requireAdmin error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { authMiddleware, requireAdmin };
