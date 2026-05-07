const mongoose = require("mongoose");

const reviewCommentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true },
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        emoji: { type: String, required: true, trim: true },
      },
    ],
  },
  { timestamps: true }
);

const productReviewSubmissionSchema = new mongoose.Schema(
  {
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    category: { type: String, default: "General", trim: true },
    status: {
      type: String,
      enum: ["pending", "looking", "edit", "published", "rejected"],
      default: "pending",
    },
    publishedProduct: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
    comments: [reviewCommentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductReviewSubmission", productReviewSubmissionSchema);
