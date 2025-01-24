// transactionModel.js
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["deposit", "transfer"],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  bank:{
      type: String,
  },
  date: {
    type: Date,
    default: Date.now
  },
  recipientAccount: {
    type: Number,
  },
  accountName:{
    type: String,
  },
  status: {
    type: String,
    enum: ["confirmed", "pending", "cancelled"],
    default: "pending",
  },
  description: {
    type: String,
  },
  cardNumber:{
    type: Number,
  },
   cardHolderName: {
    type: String,
   },
   expiryDate : {
    type: String,
   },
    cvv:{
      type: Number
    }
}, {timestamps: true});

const transactionModel = mongoose.model("Transaction", transactionSchema);
module.exports = transactionModel;
