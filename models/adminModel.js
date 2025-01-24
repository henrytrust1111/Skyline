const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
    }, 
    email: {
        type: String, 
    }, 
    password: {
        type: String, 
    }, 
    isVerified: {
        type: Boolean,
        default: true,
    },
    token: {
        type: String, 
    },
    isAdmin: {
        type: Boolean,
        default: true,
    }

}, {timeStamps: true});

const adminModel = mongoose.model('admin', adminSchema);

module.exports = adminModel;
