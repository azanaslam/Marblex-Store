const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    extraImages: { type: [String], default: [] },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, default: "General", index: true },
    stock: { type: Number, default: 0, min: 0 },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// High-speed compound indexes for lightning fast queries
productSchema.index({ active: 1, createdAt: -1 });
productSchema.index({ category: 1, active: 1 });

module.exports = mongoose.model("Product", productSchema);
