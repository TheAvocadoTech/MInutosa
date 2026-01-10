const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const app = express();

// Import routes
const connectDB = require("./config/db");
const UserRoutes = require("./routes/Users.routes");
const cookieParser = require("cookie-parser");
const Banner = require("./routes/Banner.routes");
const Category = require("./routes/category.routes");
const Products = require("./routes/product.routes");
const SubCategory = require("./routes/subCategory.routes");
const Cart = require("./routes/cart.routes");
// const Cart = require("./routes/cart.routes");

const vendor = require("./routes/vender.routes");
// const cookieParser = require("cookie-parser");

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
// app.use("/api/orders", require("./routes/order.routes"));
// app.use("/api/payment", require("./routes/PaymentRoutes"));

// Banner routes
app.use("/api/ads", Banner);

// Category routes
app.use("/api/category", Category);
app.use("/api/subcategory", SubCategory);

// // Product routes
app.use("/api/product", Products);
// //Vendor Routes
app.use("/api/vendor", vendor);

// Cart routes
app.use("/api/cart", Cart);

// Admin routes
// app.use("/api/admin", admin);

// Connect to MongoDB
connectDB();

// Utility: List all routes comprehensively
const listRoutes = (app) => {
  console.log("\n📂 ========== AVAILABLE ROUTES ==========\n");

  if (!app._router || !app._router.stack) {
    console.log("⚠️ No routes found\n");
    return;
  }

  const routes = [];

  const extractPath = (layer) => {
    if (layer.regexp && layer.regexp.source) {
      return layer.regexp.source
        .replace("^\\/", "/")
        .replace("\\/?(?=\\/|$)", "")
        .replace(/\\\//g, "/")
        .replace(/(\(\?:\)\?)/g, "")
        .replace(/\$$/, "");
    }
    return "";
  };

  app._router.stack.forEach((layer) => {
    // Direct routes
    if (layer.route) {
      const methods = Object.keys(layer.route.methods)
        .map((m) => m.toUpperCase())
        .join(", ");
      routes.push({
        method: methods,
        path: layer.route.path,
      });
    }

    // Router middleware
    if (layer.name === "router" && layer.handle?.stack) {
      const basePath = extractPath(layer);

      layer.handle.stack.forEach((handler) => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods)
            .map((m) => m.toUpperCase())
            .join(", ");
          routes.push({
            method: methods,
            path: `${basePath}${handler.route.path}`,
          });
        }
      });
    }
  });

  routes.sort((a, b) => a.path.localeCompare(b.path));

  routes.forEach((r, i) => {
    console.log(`${i + 1}. ${r.method.padEnd(8)} ${r.path}`);
  });

  console.log(`\n✅ Total Routes: ${routes.length}`);
  console.log("\n========================================\n");
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
