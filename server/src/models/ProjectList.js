const mongoose = require("mongoose");

const projectListItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, default: 1, min: 1 },
    imageUrl: { type: String, default: "" },
    price: { type: Number, default: 0 },
  },
  { _id: true }
);

const projectListSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    siteLabel: { type: String, default: "", trim: true },
    items: { type: [projectListItemSchema], default: [] },
  },
  { timestamps: true }
);

projectListSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("ProjectList", projectListSchema);
