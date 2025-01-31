const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
    },
    username: {
        type: String,
    },
    email: {
        type: String,
    },
    otpCode:{
        type: String,
        trim: true,
    },
    password: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
    occupation: {
        type: String,
    },
    maritalStatus: {
        type: String,
        enum : ["single", "married", "divorced"],
        lowercase: true,
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
    }, 
    address: {
        type: String,
    },
    registrationDate: {
        type: Date,
        default: Date.now(), 
    },
    accountNumber: {
        type: Number,
    },
    totalBalance: {
        type: Number,
        default: 0
    },
    availableBalance: {
        type: Number,
        default: 0
    },
    accountCurrency: {
        type: String,
    },
    cotCode: {
        type: String,
    }, 
    taxCode: {
        type: String,
    },
    matchingCode: {
        type: String,
    },
    imfCode: {
        type: String,
    }, 
    login_ATMpin: {
        type: String,
    },
    domesticTransferPin: {
        type: String,
    },
    accountStatus: {
        type: String,
        enum: ['active', 'inactive', 'disabled','closed'],
        default: 'inactive',
    }, 
    isActive: {
        type: Boolean,
        default: false,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    accountType : {
        type: String,
        enum:["savings", "current"],
        lowercase: true,
    },
    accountLimit: {
        type: Number,
        default: 300000
    },
    balance:{
        type: Number,
        default:0
    },
    token:{
        type: String,
    },
    dateOfBirth:{
        type: Date,
    },
    username:{
        type: String
    },
    profilePhoto: {
        public_id: {
            type: String,
         
        },
        url:{
            type: String,
            default: "https://cdn3.iconfinder.com/data/icons/leto-user-group/64/__user_person_profile-1024.png"
        },
    },
    revealPass: {
        type: String,
    },
}, {timestamps: true})

const userModel = mongoose.model("User", userSchema)
module.exports = userModel