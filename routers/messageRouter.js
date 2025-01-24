const express = require('express');

const router = express.Router();

const { sendMessage, viewMessage, viewAllMessage, viewUserMessages, deleteMessage, sendMessageCustmerCare, viewAdminMessagesUser, loanRequestCustmerCare, } = require('../controllers/messageController');

const { authenticate, Admin } = require('../middlewares/authentication');

//endpoint to send a user an Email/message
router.post('/message-user/:userId', Admin, sendMessage);

//endpoint to view a particular message
router.get('/get-message/:messageId', Admin, viewMessage);

//endpoint to view all messages in the database
router.get('/get-messages', Admin, viewAllMessage);

//endpoint to view a user messages
router.get('/get-user-message/:userId', Admin, viewUserMessages);

//endpoint to delete a particular message
router.delete('/delete-message/:messageId', Admin, deleteMessage);

//endpoint to send an Admin an Email/message (customerCare)
router.post('/message-admin/:userId', authenticate, sendMessageCustmerCare);

//endpoint to view all admin messages from a particular user
router.get('/get-admin-message/:userId', authenticate, viewAdminMessagesUser);

//endpoint to send an Admin a loan request Email/message (customerCare)
router.post('/loan-request/:userId', authenticate, loanRequestCustmerCare);



module.exports = router;
