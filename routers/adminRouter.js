const express = require('express');

const router = express.Router();

const { signUpNew, login, signOut, createAccount, updateAccount, viewOneUser, viewAllUsers, deleteAccount, changeStatus, creditAccount, debitAccount, addHistory, viewHistory, viewAllHistory, updateHistory, deleteHistory,  } = require('../controllers/adminController');

const { authenticate, Admin } = require('../middlewares/authentication');

//endpoint to signUp an Admin 
router.post('/admin-signup', signUpNew);

//endpoint to login an Admin
router.post('/admin-login', login);

//endpoint to logout an Admin
router.post('/admin-logout', Admin, signOut);

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------



//endpoint to create an account
router.post('/admin-create', Admin, createAccount);

//endpoin to update an existing account
router.put('/admin-update/:userId', Admin, updateAccount);

//endpoint to delete an account
router.delete('/admin-delete/:userId', Admin, deleteAccount);

//endpoint to change an account status
router.put('/admin-status/:userId', Admin, changeStatus);

//endpoint to view a user
router.get('/admin-view-one-user/:userId', Admin, viewOneUser);

//endpoint to view all users
router.get('/view-all-users', Admin, viewAllUsers);

//endpoint to credit a user's account 
router.post('/credit/:userId', Admin, creditAccount);

//endpoint to debit a user's account 
router.post('/debit/:userId', Admin, debitAccount);

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------



//endpoint to add transaction history
router.post('/transaction-history', Admin, addHistory);

//endpoint to view a particular transaction history
router.get('/view-history/:historyId', Admin, viewHistory);

//endpoint to view a particular transaction history
router.get('/view-all-history', Admin, viewAllHistory);

//endpoint to update a particular transaction history
router.put('/update-hstory/:historyId', Admin, updateHistory);

//endpoint to delete a particular transaction history
router.delete('/delete-history/:historyId', Admin, deleteHistory);

module.exports = router;