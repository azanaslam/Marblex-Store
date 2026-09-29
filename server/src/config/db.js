const mongoose = require("mongoose");
const dns = require("dns");
const { mongoUri } = require("./env");

const connectDatabase = async () => {
  try {
    // Fix Windows/ISP SRV lookup issues for MongoDB Atlas
    if (mongoUri.startsWith("mongodb+srv://")) {
      try {
        dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
      } catch (dnsErr) {
        console.warn("DNS server set warning:", dnsErr.message);
      }
    }
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};

module.exports = { connectDatabase };

