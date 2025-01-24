const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chooseUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }, 
    email: {
        type: String, 
    }, 
    subject: {
        type: String, 
    }, 
    content: {
        type: String,
    },
    date: {
        type: String, 
    },
    time: {
        type: String,
    }, 
    sender: {
        type: String,
        enum: ['support', 'customerCare', 'admin'],
    }

}, {timeStamps: true});

const messageModel = mongoose.model('message', messageSchema);

module.exports = messageModel;
