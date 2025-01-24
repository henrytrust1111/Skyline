const adminModel = require('../models/adminModel');
const userModel = require('../models/userModel');
const transactionModel = require('../models/transactionModel');
const historyModel = require('../models/historyModel');
const messageModel = require('../models/messageModel');
require("dotenv").config();
const sendMail = require("../utils/newEmail");



// Function to send a User a Message and also an Email
exports.sendMessage = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await userModel.findById(userId);
        // if (!user) return res.status(404).json({ message: "User not found!"});

        const messageData = {
            sender: req.body.sender,
            email: req.body.email,
            subject: req.body.subject,
            content: req.body.content,
        }

        if (!messageData) return res.status(400).json({ message: "Please fill all the fields above." });

        const emailOptions = {
            emailType: messageData.sender,
            email: user.email,
            subject: messageData.subject,
            text: messageData.content,
          };

          await sendMail(emailOptions);

        const message = new messageModel({
            chooseUser: user,
            email: emailOptions.email,
            subject: emailOptions.subject,
            content: emailOptions.text, 
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            sender: emailOptions.emailType,
        })

        await message.save();

        return res.status(200).json({ message: `Message successfully sent to user email: ${emailOptions.email}`,  data: message });

    } catch (error) {
        return res.status(500).json({
            Error: "Internal Server Error: " + error.message,
        });
    }
}


// Function to view a particular message
exports.viewMessage = async (req, res) => {
    try {
        const messageId = req.params.messageId;
        if (!messageId) return res.status(400).json({ message: "Please provide the the messageId!" });

        const message = await messageModel.findById(messageId);
        if (!message) return res.status(404).json({ message: "Message not found!" });

        return res.status(200).json({ message: "Message successfully fetched!", data: message });

    } catch (error) {
        return res.status(500).json({
            Error: "Internal Server Error: " + error.message,
        });
    }
}


//Function to view all users messages
exports.viewAllMessage = async (req, res) => {
    try {

        const message = await messageModel.find().populate('chooseUser');
        if (!message) return res.status(404).json({ message: "Message not found!" });

        return res.status(200).json({ message: "Messages successfully fetched!", data: message });

    } catch (error) {
        return res.status(500).json({
            Error: "Internal Server Error: " + error.message,
        });
    }
}



// Function to view all messages for a particular user
exports.viewUserMessages = async (req, res) => {
    try {
        const userId = req.params.messageId;
        if (!userId) return res.status(400).json({ message: "Please provide the the userId!" });

        const user = await userModel.findById(userId).populate('chooseUser'); 
        // if (!user) return res.status(400).json({ message: "user not found!" });

        const message = await messageModel.find({chooseUser: userId});
        if (!message) return res.status(404).json({ message: "Message not found!" });

        return res.status(200).json({ message: "Messages successfully fetched!", data: message });

    } catch (error) {
        return res.status(500).json({
            Error: "Internal Server Error: " + error.message,
        });
    }
}



// Function to delete a particular message
exports.deleteMessage = async (req, res) => {
    try {
        const messageId = req.params.messageId;
        if (!messageId) return res.status(400).json({ message: "Please provide the the messageId!" });

        const message = await messageModel.findById(messageId);
        if (!message) return res.status(404).json({ message: "Message not found!" });

        const deleteMessage = await messageModel.findByIdAndDelete(messageId);
        if (!deleteMessage) return res.status(400).json({ message: "Uable to delete message!" });

        return res.status(200).json({ message: "Message successfully deleted!" });

    } catch (error) {
        return res.status(500).json({
            Error: "Internal Server Error: " + error.message,
        });
    }
}


// Function to send an Admin a Message and also an Email
exports.sendMessageCustmerCare = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await userModel.findById(userId);
        // if (!user) return res.status(404).json({ message: "User not found!"});

        const messageData = {
            name: req.body.name,
            email: req.body.email,
            message: req.body.message,
        }

        if (!messageData) return res.status(400).json({ message: "Please fill all the fields above." });

        const emailOptions = {
            emailType: 'customerCare',
            email: process.env.CUSTOMER_CARE_EMAIL_USER,
            subject: 'Message to the Customer Care',
            text: "Name:  " + messageData.name + " \n" + "Email:  " + messageData.email + " \n\n" + messageData.message,
          };

          await sendMail(emailOptions);

        const message = new messageModel({
            chooseUser: user,
            email: emailOptions.email,
            subject: emailOptions.subject,
            content: emailOptions.text, 
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            sender: emailOptions.emailType,
        })

        const messages = {
            chooseUser: message.chooseUser.fullName,
            email: message.email,
            subject: message.subject,
            name: messageData.name,
            User_Email: messageData.email,
            message: message.content, 
            date: message.date,
            time: message.time,
            sender: message.sender,
        }

        await message.save();

        return res.status(200).json({ message: `Message successfully sent to Admin email: ${emailOptions.email}`,  data: messages });

    } catch (error) {
        return res.status(500).json({
            Error: "Internal Server Error: " + error.message,
        });
    }
}


// Function to view all messages to customerCare for a particular user
exports.viewAdminMessagesUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) return res.status(400).json({ message: "Please provide the the userId!" });

        const user = await userModel.findById(userId); 
        // if (!user) return res.status(400).json({ message: "user not found!" });

        const message = await messageModel.find({chooseUser: userId}).populate('chooseUser');
        if (!message) return res.status(404).json({ message: "Message not found!" });

        const messages = message.map((msg) => ({
            chooseUser: msg.chooseUser.fullName,
            email: msg.email,
            subject: msg.subject,
            name: msg.chooseUser.fullName,
            User_Email: msg.chooseUser.email,
            message: msg.content, 
            date: msg.date,
            time: msg.time,
            sender: msg.sender,
        }))

        return res.status(200).json({ message: "Messages successfully fetched!", data: messages });

    } catch (error) {
        return res.status(500).json({
            Error: "Internal Server Error: " + error.message,
        });
    }
}



// Function to send an Admin a Loan Request Message and also an Email
exports.loanRequestCustmerCare = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await userModel.findById(userId);
        // if (!user) return res.status(404).json({ message: "User not found!" });

        const { loanType, amount, loanReason } = req.body;

        // if (!loanType || !amount || !loanReason) {
        //     return res.status(400).json({ message: "Please fill all the fields above." });
        // }

        const emailOptions = {
            emailType: 'customerCare',
            email: process.env.CUSTOMER_CARE_EMAIL_USER,
            subject: loanType,
            text: `User: ${user.fullName} \nLoan Amount: ${amount} \n\nLoan Reason: ${loanReason}`,
        };

        await sendMail(emailOptions);

        const message = new messageModel({
            chooseUser: user,
            email: user.email,
            subject: emailOptions.subject,
            content: emailOptions.text,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            sender: emailOptions.emailType,
        });

        await message.save();

        const messages = {
            chooseUser: message.chooseUser.fullName,
            email: message.email,
            subject: message.subject,
            name: user.fullName,
            message: message.content,
            date: message.date,
            time: message.time,
            sender: message.sender,
        };

        return res.status(200).json({ message: `Message successfully sent to Admin email: ${emailOptions.email}`, data: messages });
    } catch (error) {
        return res.status(500).json({
            Error: "Internal Server Error: " + error.message,
        });
    }
};
