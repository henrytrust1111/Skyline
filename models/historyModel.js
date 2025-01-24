// transactionModel.js
const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    amountTransferred: {
      type: Number,
    },
    accountTransferredTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    beneficiaryAccount: {
      type: Number,
    },
    transactionType: {
      type: String,
      enum: ["credit", "debit"],
    },
    bank: {
      type: String,
    },
    accountName: {
      type: String,
    },
    remark: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const historyModel = mongoose.model("History", historySchema);

module.exports = historyModel;
