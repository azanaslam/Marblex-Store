const mongoose = require("mongoose");

const ticketMessageSchema = new mongoose.Schema(
  {
    sender: { type: String, enum: ["user", "admin"], required: true },
    body: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const supportTicketSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, unique: true, sparse: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["order", "product", "delivery", "billing", "technical", "other"],
      default: "other",
    },
    status: {
      type: String,
      enum: ["open", "waiting", "closed"],
      default: "open",
      index: true,
    },
    priority: {
      type: String,
      enum: ["normal", "high"],
      default: "normal",
    },
    messages: { type: [ticketMessageSchema], default: [] },
  },
  { timestamps: true }
);

supportTicketSchema.index({ userId: 1, createdAt: -1 });

supportTicketSchema.pre("save", function (next) {
  if (!this.ticketNumber) {
    const year = new Date().getFullYear();
    const rand = Math.floor(100000 + Math.random() * 900000);
    this.ticketNumber = `TKT-${year}-${rand}`;
  }
  next();
});

module.exports = mongoose.model("SupportTicket", supportTicketSchema);
