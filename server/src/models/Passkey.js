const mongoose = require("mongoose");

const passkeySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    credentialId: { type: String, required: true, unique: true },
    publicKey: { type: Buffer, required: true },
    counter: { type: Number, required: true, default: 0 },
    deviceType: { type: String, default: "singleDevice" },
    backedUp: { type: Boolean, default: false },
    transports: { type: [String], default: [] },
    friendlyName: { type: String, default: "Biometric Passkey" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Passkey", passkeySchema);
