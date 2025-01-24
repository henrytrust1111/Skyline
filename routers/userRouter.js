const express = require("express");

const userRouter = express.Router();

const {
  signUp,
  verify,
  resendOTP,
  loginWithAccountNumber,
  loginWithPhoneNumber,
  forgotPassword,
  resetPassword,
  updatePersonalProfile,
  uploadProfilePicture,
  uploaAPhoto,
  uploadDocument,
  viewDocuments,
  viewAllDocuments,
  viewAccount,
  signOut,
} = require("../controllers/userController");

const { upload } = require("../middlewares/multer");
const { uploads } = require("../middlewares/multerConfig");
const { authenticate } = require("../middlewares/authentication");
const { accountStatus } = require('../middlewares/checkStatus');

//endpoint to register a new user
userRouter.post("/sign-up", signUp);

//endpoint to login with email
userRouter.post("/loginA", accountStatus, loginWithAccountNumber);

//endpoint to login with phone number
userRouter.post("/loginP", accountStatus, loginWithPhoneNumber);

//endpoint to verify a registered user
userRouter.post("/verify/:userId", verify);

//endpoint to resend new OTP to the user email address
userRouter.get("/resend-otp/:userId", resendOTP);

//endpoint to reset user Password
userRouter.post("/reset-user/:userId", resetPassword);

//endpoint for forgot password
userRouter.post("/forgot", forgotPassword);

//endpoint for personal information update
userRouter.put("/update-personal-profile", authenticate, updatePersonalProfile);

//endpoint to view a user
userRouter.get('/view-me/:userId', authenticate, viewAccount);


//endpoint to sign out a user
userRouter.post("/signout/:userId", authenticate, signOut);

//endpoint to upload a profile photo
userRouter.post("/upload-profilephoto", upload.single("profilePhoto"), authenticate,  uploadProfilePicture);


//endpoint to update a profile photo
userRouter.put("/profilephoto", upload.single("profilePhoto"), authenticate, uploaAPhoto);


//endpoint to upload documnt
userRouter.post('/upload-document', uploads.single('documents'), authenticate, uploadDocument);

//endpoint to view all users documents 
userRouter.get('/view-documents/:userId', authenticate, viewDocuments);

//endpoint to view all users documents
userRouter.get('/view-all-documents', authenticate, viewAllDocuments);


module.exports = userRouter; 
