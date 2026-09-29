const dotenv = require("dotenv");
const path = require("path");

// Load .env from various possible locations
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, ".env") });
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
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
  // Email provider configuration
  brevoApiKey: process.env.BREVO_API_KEY || "",
  senderEmail: process.env.SENDER_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER || "Marblexpak@gmail.com",
  smtpUser: process.env.SMTP_USER || process.env.EMAIL_USER || "",
  smtpPass: process.env.SMTP_PASS || process.env.EMAIL_PASS || "",
};


