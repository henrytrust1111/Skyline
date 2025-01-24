// transactionModel.js
const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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

const cardDetailsModel = mongoose.model("CardDetails", cardSchema);
module.exports = cardDetailsModel;
