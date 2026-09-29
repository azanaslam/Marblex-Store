const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "user", "subowner"], default: "user" },
    isBlocked: { type: Boolean, default: false },
    /** New signups are false until admin approves in dashboard. Admins ignore this. */
    isAccessGranted: { type: Boolean, default: false },
    avatarUrl: { type: String, default: "" },
    phone: { type: String, default: "" },
    company: { type: String, default: "" },
    industryType: { type: String, default: "Waterproofing & Construction" },
    city: { type: String, default: "" },
    gender: { type: String, enum: ["male", "female", "other", "prefer_not_to_say"], default: "prefer_not_to_say" },
    twoFactorCode: { type: String, default: null },
    twoFactorExpires: { type: Date, default: null },
    isEmailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
