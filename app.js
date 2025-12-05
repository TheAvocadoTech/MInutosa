const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const app = express();

// Import routes
const connectDB = require("./config/db");
const UserRoutes = require("./routes/Users.routes");
const Banner = require("./routes/Banner.routes");
const Category = require("./routes/category.routes");
const Products = require("./routes/product.routes");
const SubCategory = require("./routes/subCategory.routes");
const Cart = require("./routes/cart.routes");
const admin = require("./routes/admin.route");
const vendor = require("./routes/vender.routes");
const cookieParser = require("cookie-parser");

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.get("/", (req, res) => {
  res.send("You are connected to Minutos server");
});

// Authentication routes
app.use("/api/auth", UserRoutes);
//
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/payment", require("./routes/PaymentRoutes"));

// Banner routes
app.use("/api/ads", Banner);

// Category routes
app.use("/api/category", Category);
app.use("/api/subcategory", SubCategory);

// Product routes
app.use("/api/product", Products);
//Vendor Routes
app.use("/api/vendor", vendor);

// Cart routes
app.use("/api/cart", Cart);

// Admin routes
app.use("/api/admin", admin);

// Connect to MongoDB
connectDB();

// Utility: List all routes comprehensively
const listRoutes = (app) => {
  console.log("\n📂 ========== AVAILABLE ROUTES ==========\n");

  // Check if router exists
  if (!app._router || !app._router.stack) {
    console.log("⚠️  No routes found (router not initialized)\n");
    return;
  }

  const routes = [];

  // Function to extract base path from regex
  const getPathFromRegex = (regexp) => {
    const regexpStr = regexp.toString();

    // Match patterns like /^\/api\/auth\/?(?=\/|$)/i
    let match = regexpStr.match(/^\/\^\\\/(.+?)\\/);
    if (match) {
      return "/" + match[1].replace(/\\\//g, "/");
    }

    // Match simpler patterns
    match = regexpStr.match(/^\/\^(.+?)\$/);
    if (match) {
      return match[1].replace(/\\\//g, "/");
    }

    return "";
  };

  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Direct routes on the app
      const methods = Object.keys(middleware.route.methods)
        .map((m) => m.toUpperCase())
        .join(", ");
      routes.push({
        method: methods,
        path: middleware.route.path,
      });
    } else if (
      middleware.name === "router" &&
      middleware.handle &&
      middleware.handle.stack
    ) {
      // Get the base path for this router
      const basePath = getPathFromRegex(middleware.regexp);

      // Iterate through all routes in this router
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods)
            .map((m) => m.toUpperCase())
            .join(", ");

          const routePath = handler.route.path;
          const fullPath = basePath + routePath;

          routes.push({
            method: methods,
            path: fullPath,
          });
        }
      });
    }
  });

  // Sort routes by path for better readability
  routes.sort((a, b) => a.path.localeCompare(b.path));

  // Display routes in a formatted table
  if (routes.length === 0) {
    console.log("⚠️  No routes found");
  } else {
    routes.forEach((route, index) => {
      console.log(`${index + 1}. ${route.method.padEnd(7)} ${route.path}`);
    });
    console.log(`\n✅ Total Routes: ${routes.length}\n`);
  }

  console.log("========================================\n");
};

// Start server with Azure-safe PORT handling
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);

  // ✅ Call listRoutes with a slight delay to ensure router is fully initialized
  setTimeout(() => {
    listRoutes(app);
  }, 100);
});
