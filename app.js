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
// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
//authentication routes
app.use("/api/auth", UserRoutes);
//banner routes
app.use("/api/ads", Banner);
//Category
app.use("/api/category", Category);

app.use("/api/subcategory", SubCategory);
app.use("/api/product", Products);
// Health check
app.get("/", (req, res) => {
  res.send("You are connected");
});

// Connect to MongoDB
connectDB();

// Utility: List all routes safely
const listRoutes = (app, baseUrl) => {
  if (!app._router || !app._router.stack) {
    console.warn("⚠️ No routes found (app._router.stack is undefined)");
    return;
  }

  console.log("📂 Available Routes:");
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Direct routes
      const method = Object.keys(middleware.route.methods)
        .join(", ")
        .toUpperCase();
      console.log(`${method} ${baseUrl}${middleware.route.path}`);
    } else if (middleware.name === "router" && middleware.handle.stack) {
      // Nested router middleware
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const method = Object.keys(handler.route.methods)
            .join(", ")
            .toUpperCase();
          console.log(`${method} ${baseUrl}${handler.route.path}`);
        }
      });
    }
  });
};

// Start server with Azure-safe PORT handling
const PORT = process.env.PORT;
if (!PORT) {
  console.error("❌ PORT not set. Azure App Service needs process.env.PORT.");
  process.exit(1);
}
const BASE_URL = `http://localhost:${PORT}`;

// ✅ Call listRoutes *before* starting server
listRoutes(app, BASE_URL);

app.listen(PORT, () => {
  console.log(`🚀 Server running at ${BASE_URL}`);
});
