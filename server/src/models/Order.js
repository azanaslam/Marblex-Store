const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: "", trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    variantSku: { type: String, default: "", trim: true },
    variantLabel: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    guestEmail: {
      type: String,
      default: "",
      trim: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    areaSize: {
      type: String,
      default: "",
      trim: true,
    },
    deliveryDate: {
      type: String,
      default: "",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    channel: {
      type: String,
      enum: ["website", "whatsapp"],
      default: "website",
      index: true,
    },
    orderSource: {
      type: String,
      enum: ["website", "whatsapp"],
      default: "website",
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    couponCode: {
      type: String,
      default: "",
      uppercase: true,
      trim: true,
    },
    total: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "stripe", "easypaisa", "jazzcash", "bank_transfer", "on_account"],
      default: "cod",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "pending_verification", "paid", "failed"],
      default: "pending",
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "on the way", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    transactionReference: {
      type: String,
      default: "",
      trim: true,
    },
    paymentScreenshotUrl: {
      type: String,
      default: "",
      trim: true,
    },
    dispatchNote: {
      type: String,
      default: "",
      trim: true,
    },
    courierName: {
      type: String,
      default: "",
      trim: true,
    },
    trackingRef: {
      type: String,
      default: "",
      trim: true,
    },
    // Phase 4: B2B Quote link & Dealer on-account
    quoteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quote",
      default: null,
      index: true,
    },
    isDealerOrder: {
      type: Boolean,
      default: false,
    },
    stripeSessionId: {
      type: String,
      default: "",
      index: true,
    },
    stripePaymentIntentId: {
      type: String,
      default: "",
    },
    stockDeducted: {
      type: Boolean,
      default: false,
      index: true,
    },
    stockRestored: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// High-speed compound indexes for customer lookups and admin dashboards
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ city: 1, createdAt: -1 });
orderSchema.index({ paymentMethod: 1, createdAt: -1 });
orderSchema.index({ channel: 1, paymentStatus: 1, createdAt: -1 });
orderSchema.index({ userId: 1, createdAt: -1 });

// Helper to format order number if not present
orderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    const year = new Date().getFullYear();
    const randomHex = Math.floor(100000 + Math.random() * 900000);
    this.orderNumber = `ORD-${year}-${randomHex}`;
  }
  if (!this.orderSource && this.channel) {
    this.orderSource = this.channel;
  }
  if (!this.channel && this.orderSource) {
    this.channel = this.orderSource;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
