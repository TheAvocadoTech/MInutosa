require("dotenv").config();
const Razorpay = require("razorpay");

// Validate required environment variables
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error(
    "RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required in environment variables"
  );
}

// Initialize Razorpay instance
const Razorpay = require("razorpay");

module.exports = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});
// Export the configured instance
module.exports = razorpay;
