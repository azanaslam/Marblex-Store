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
  whatsappNumber: process.env.WHATSAPP_NUMBER || "923481116611",
  adminEmail: process.env.ADMIN_EMAIL || "Marblexpak@gmail.com",
  adminPassword: process.env.ADMIN_PASSWORD || "admin123",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  stripeCurrency: (process.env.STRIPE_CURRENCY || "pkr").toLowerCase(),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
  // Manual Payment Gateway Accounts
  easypaisaTitle: process.env.EASYPAISA_TITLE || "MARBLEX CHEMICAL & RUBBER",
  easypaisaNumber: process.env.EASYPAISA_NUMBER || "0348-1116611",
  jazzcashTitle: process.env.JAZZCASH_TITLE || "MARBLEX CHEMICAL & RUBBER",
  jazzcashNumber: process.env.JAZZCASH_NUMBER || "0300-XXXXXXX",
  bankName: process.env.BANK_NAME || "Meezan Bank Limited",
  bankTitle: process.env.BANK_ACCOUNT_TITLE || "MARBLEX CHEMICAL & RUBBER INDUSTRY",
  bankAccount: process.env.BANK_ACCOUNT_NUMBER || "0101-XXXXXXXXXXXX",
  bankIban: process.env.BANK_IBAN || "PK00MEZN0000000000000000",
  bankBranch: process.env.BANK_BRANCH || "Ferozepur Road Branch, Lahore",
  // Email provider configuration
  brevoApiKey: process.env.BREVO_API_KEY || "",
  senderEmail: process.env.SENDER_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER || "Marblexpak@gmail.com",
  smtpUser: process.env.SMTP_USER || process.env.EMAIL_USER || "",
  smtpPass: process.env.SMTP_PASS || process.env.EMAIL_PASS || "",
};



