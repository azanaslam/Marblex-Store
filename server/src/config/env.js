const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/marblex",
  jwtSecret: process.env.JWT_SECRET || "change_this_secret",
  whatsappNumber: process.env.WHATSAPP_NUMBER || "923000000000",
  adminEmail: process.env.ADMIN_EMAIL || "admin@marblex.com",
  adminPassword: process.env.ADMIN_PASSWORD || "admin123",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
};
