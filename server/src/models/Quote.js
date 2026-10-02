const mongoose = require("mongoose");

const quoteItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, default: "pcs", trim: true },
    notes: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const quoteSchema = new mongoose.Schema(
  {
    quoteNumber: { type: String, unique: true, sparse: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    company: { type: String, default: "", trim: true },
    contactName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, default: "", trim: true },
    siteAddress: { type: String, default: "", trim: true },
    projectName: { type: String, default: "", trim: true },
    items: { type: [quoteItemSchema], default: [] },
    message: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["submitted", "reviewing", "quoted", "accepted", "rejected", "converted"],
      default: "submitted",
      index: true,
    },
    quotedAmount: { type: Number, default: null },
    adminNotes: { type: String, default: "", trim: true },
    quotedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

quoteSchema.index({ userId: 1, createdAt: -1 });

quoteSchema.pre("save", function (next) {
  if (!this.quoteNumber) {
    const year = new Date().getFullYear();
    const rand = Math.floor(100000 + Math.random() * 900000);
    this.quoteNumber = `RFQ-${year}-${rand}`;
  }
  next();
});

module.exports = mongoose.model("Quote", quoteSchema);
