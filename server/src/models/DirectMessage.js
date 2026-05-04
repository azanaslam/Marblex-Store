const mongoose = require("mongoose");

const directMessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true, maxlength: 8000 },
    /** User → admin message: false until admin opens thread */
    seenByAdmin: { type: Boolean, default: true },
    /** Admin → user message: false until user opens Support chat */
    seenByUser: { type: Boolean, default: true },
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        emoji: { type: String, required: true, trim: true, maxlength: 32 },
      },
    ],
  },
  { timestamps: true }
);

directMessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });

module.exports = mongoose.model("DirectMessage", directMessageSchema);
