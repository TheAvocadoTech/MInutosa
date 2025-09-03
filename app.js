const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// Import routes

const connectDB = require("./config/db");
const Auth = require("./routes/Auth.routes");

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting for auth (OTP, login, etc.)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 5,
//   message: "Too many OTP requests, please try again later",
// });
// app.use("/api/auth", limiter);

// Health check
app.get("/", (req, res) => {
  res.send("You are connected");
});

// Connect to MongoDB
connectDB();

// Route registrations
app.use("/api/auth", Auth);

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
