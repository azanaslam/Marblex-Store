const mongoose = require("mongoose");

const portalDocumentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["tds", "sds", "manual", "brochure", "certificate", "other"],
      default: "brochure",
      index: true,
    },
    description: { type: String, default: "", trim: true },
    fileUrl: { type: String, required: true, trim: true },
    coverUrl: { type: String, default: "", trim: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PortalDocument", portalDocumentSchema);
