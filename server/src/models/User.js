const mongoose = require("mongoose");

const deliverySiteSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, default: "", trim: true },
    area: { type: String, default: "", trim: true },
    contactPhone: { type: String, default: "", trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

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
    ntn: { type: String, default: "", trim: true },
    strn: { type: String, default: "", trim: true },
    deliverySites: { type: [deliverySiteSchema], default: [] },
    gender: { type: String, enum: ["male", "female", "other", "prefer_not_to_say"], default: "prefer_not_to_say" },
    twoFactorCode: { type: String, default: null },
    twoFactorExpires: { type: Date, default: null },
    isEmailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
