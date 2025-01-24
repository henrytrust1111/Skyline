const express = require('express');
const {
    depositMoney,
    transferMoney,
    transactionHistory,
    getAllTransactionHistory,
    getAccountBalance,
    getBankStatement,
    getFinancialStatement,
    getTransactionDetail,
    cardDetails,
    myCardDetails,
    viewAllDetails
  }= require('../controllers/transactionController');
const transactionRouter = express.Router();
const { authenticate, Admin } = require('../middlewares/authentication')

//Endpoint to deposit money
transactionRouter.post('/deposit', authenticate, depositMoney);

//Endpoint to transfer money
transactionRouter.post('/transfer', authenticate, transferMoney);

//Endpoint to upload card details
transactionRouter.post('/card-details', authenticate, cardDetails);

//Endpoint to get card details
transactionRouter.get('/card-details/:userId', authenticate, myCardDetails);

//Endpoint for admin to get all card details
transactionRouter.get('/all-card-details', Admin, viewAllDetails);


//Endpoint to get Transaction history 
transactionRouter.get('/transaction-history/:userId', authenticate, transactionHistory);

//Endpoint to get Transaction details of a transaction
transactionRouter.get('/transaction-details/:transactionId', authenticate, getTransactionDetail);

//Endpoint to get all Transaction history
transactionRouter.get('/all-transaction-history', Admin, getAllTransactionHistory);

//Endpoint to get account balance
transactionRouter.get('/account-balance/:userId', authenticate, getAccountBalance);

//Endpoint to get bank statement
transactionRouter.get('/bank-statement/:userId', authenticate, getBankStatement);

//Endpoint to get financial  statement
transactionRouter.get('/financial-statement/:userId', authenticate, getFinancialStatement)

module.exports = transactionRouter;