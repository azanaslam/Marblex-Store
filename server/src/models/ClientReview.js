const mongoose = require("mongoose");

const clientReviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    quote: { type: String, required: true, trim: true, maxlength: 800 },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    email: { type: String, trim: true, lowercase: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    featured: { type: Boolean, default: false },
    source: {
      type: String,
      enum: ["website", "admin", "seed"],
      default: "website",
    },
  },
  { timestamps: true }
);

clientReviewSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("ClientReview", clientReviewSchema);
