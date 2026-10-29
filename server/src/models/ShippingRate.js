const mongoose = require("mongoose");

const shippingRateSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    charge: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    freeAbove: {
      type: Number,
      default: null, // e.g. 10000 PKR for free delivery
    },
    etaDays: {
      type: String,
      default: "2-4 Business Days",
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShippingRate", shippingRateSchema);
