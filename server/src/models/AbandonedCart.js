const mongoose = require("mongoose");

const abandonedCartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    name: { type: String, default: "" },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: { type: String, default: "" },
        price: { type: Number, default: 0 },
        quantity: { type: Number, default: 1 },
        imageUrl: { type: String, default: "" },
      },
    ],
    subtotal: { type: Number, default: 0 },
    reminderSent: { type: Boolean, default: false },
    recovered: { type: Boolean, default: false },
  },
  { timestamps: true }
);

abandonedCartSchema.index({ updatedAt: -1 });

module.exports = mongoose.model("AbandonedCart", abandonedCartSchema);

