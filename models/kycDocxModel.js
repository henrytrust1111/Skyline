// transactionModel.js
const mongoose = require("mongoose");

const kycDocumentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title: {
    type: String,
  },
  documents: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const kycDocxModel = mongoose.model("KYC_Documents", kycDocumentSchema);

module.exports = kycDocxModel;
