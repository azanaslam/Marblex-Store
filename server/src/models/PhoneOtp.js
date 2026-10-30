const mongoose = require("mongoose");

const phoneOtpSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
    resendAvailableAt: { type: Date, required: true },
    purpose: { type: String, enum: ["login", "cod_verify", "phone_link"], default: "login" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PhoneOtp", phoneOtpSchema);
