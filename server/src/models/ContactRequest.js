const mongoose = require("mongoose");

const ContactRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  subject: { type: String },
  message: { type: String, required: true },
  reply: { type: String },
  repliedAt: { type: Date },
  status: { type: String, default: "pending" }, // pending, responded, closed
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ContactRequest", ContactRequestSchema);
