const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    nameUr: { type: String, default: "", trim: true },
    imageUrl: { type: String, required: true, trim: true },
    extraImages: { type: [String], default: [] },
    description: { type: String, default: "" },
    descriptionUr: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    dealerPrice: { type: Number, default: 0, min: 0 }, // Phase 4: Explicit Dealer Price Override
    category: { type: String, default: "General", index: true },
    categoryUr: { type: String, default: "", trim: true },
    stock: { type: Number, default: 0, min: 0 },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true, index: true },
    variants: [
      {
        sku: { type: String, trim: true },
        label: { type: String, trim: true },
        price: { type: Number, min: 0 },
        dealerPrice: { type: Number, default: 0, min: 0 },
        stock: { type: Number, min: 0 },
        image: { type: String, default: "" },
        bulkTiers: [
          {
            minQty: { type: Number, min: 1 },
            price: { type: Number, min: 0 },
          },
        ],
      },
    ],
    bulkTiers: [
      {
        minQty: { type: Number, min: 1 },
        price: { type: Number, min: 0 },
      },
    ],
    // Phase 3: Coverage calculation & applications finder
    coverage: {
      unit: { type: String, enum: ["sqm", "sqft", "lm"], default: "sqft" },
      perUnit: { type: Number, default: 0 }, // consumption per sqm/sqft or lm (e.g. 0.25 kg/sqft)
      coats: { type: Number, default: 2 },
      wastagePercent: { type: Number, default: 10 },
      packSizes: { type: [Number], default: [] }, // available pack weights/volumes in ascending order e.g. [5, 20]
    },
    applications: {
      type: [String],
      default: [],
      index: true, // e.g. ["roof", "basement", "water-tank", "floor", "joint", "bathroom"]
    },
  },
  { timestamps: true }
);

// High-speed compound indexes for lightning fast queries
productSchema.index({ active: 1, createdAt: -1 });
productSchema.index({ category: 1, active: 1 });
productSchema.index({ applications: 1, active: 1 });
productSchema.index({ featured: 1, active: 1 });
productSchema.index({
  name: "text",
  nameUr: "text",
  description: "text",
  category: "text",
});

module.exports = mongoose.model("Product", productSchema);
