const mongoose = require("mongoose");

const broadcastSchema = new mongoose.Schema(
  {
    message: { type: String, required: true, trim: true, maxlength: 8000 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Broadcast", broadcastSchema);
