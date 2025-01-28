const userModel = require("../models/userModel");
const kycDocxModel = require('../models/kycDocxModel');
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const cloudinary = require("../middlewares/cloudinary");
const {
  validateUser,
  validateUserLogin,
  validateResetPassword,
  validateUserPersonalProfile,
} = require("../middlewares/validator");
// const sendEmail = require("../utils/email");
const sendMail = require("../utils/newEmail");
const { generateDynamicEmail } = require("../utils/emailText");
const verifyEmail = require('../utils/verifyTemplate');
const acctNumEmail = require('../utils/accountTemplate');
const forgotEmail = require('../utils/forgetPassEmail');
const { resetFunc } = require("../utils/forgot");
const resetHTML = require("../utils/resetSuccessful");
const verifiedHTML = require("../utils/verified");
const resetSuccessfulHTML = require("../utils/resetSuccessful");


const signUp = async (req, res) => {
  try {
    const { error } = validateUser(req.body);

    if (error) {
      return res.status(500).json({
        message: error.details[0].message,
      });
    } else {
      const toTitleCase = (inputText) => {
        return inputText
          .split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ");
      };
      const userData = {
        email: req.body.email.trim().toLowerCase(),
        password: req.body.password.trim(),
        retypePassword: req.body.retypePassword.trim(),
        fullName: req.body.fullName,
        username: req.body.username,
        phoneNumber: req.body.phoneNumber,
        maritalStatus: req.body.maritalStatus,
        address: req.body.address,
        accountType: req.body.accountType,
        occupation: req.body.occupation,
        dateOfBirth: req.body.dateOfBirth,
      };

      const emailExists = await userModel.findOne({
        email: userData.email.toLowerCase(),
      });
      if (emailExists) {
        return res.status(200).json({
          message: "Email already exists!",
        });
      }

      // if (userData.phoneNumber) {
      //   const checkTel = await userModel.findOne({ phoneNumber: userData.phoneNumber });
      //   if (checkTel) {
      //     return res.status(200).json({
      //       message: 'Phone number already exists!',
      //     });
      //   }
      // }

      const salt = bcrypt.genSaltSync(12);
      const hashpassword = bcrypt.hashSync(userData.password, salt);

      // Generate a unique account number with "31" prefix
      const generateUniqueAccountNumber = async () => {
        const generateAccountNumber = () => {
          const prefix = "31";
          const suffix = Math.floor(Math.random() * 100000000)
            .toString()
            .padStart(8, "0");
          return prefix + suffix;
        };

        let accountNumber;
        let isUnique = false;

        while (!isUnique) {
          accountNumber = generateAccountNumber();
          const existingAccount = await userModel.findOne({ accountNumber });
          if (!existingAccount) {
            isUnique = true;
          }
        }

        return accountNumber;
      };

      const accountNumber = await generateUniqueAccountNumber();

      const user = new userModel({
        email: userData.email.toLowerCase(),
        password: hashpassword,
        fullName: toTitleCase(userData.fullName),
        username: toTitleCase(userData.username),
        phoneNumber: "234" + userData.phoneNumber,
        //accountNumber: userData,
        accountNumber:accountNumber,
        phoneNumber: userData.phoneNumber,
        maritalStatus: userData.maritalStatus,
        address: userData.address,
        accountType: userData.accountType,
        occupation: userData.occupation,
        dateOfBirth: userData.dateOfBirth,
      });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const token = jwt.sign(
        {
          fullName: user.fullName,
          email: user.email,
          username: user.username,
        },
        process.env.SECRET,
        { expiresIn: "300s" }
      );
      user.token = token;
      const subject = "VERIFY YOUR EMAIL";

      const generateOTP = () => {
        const min = 100000;
        const max = 999999;
        return Math.floor(Math.random() * (max - min + 1)) + min;
      };

      const otp = generateOTP();

      user.otpCode = otp;
      const name = `${user.fullName}`;
      const html = verifyEmail(name, otp);

      const emailOptions = {
        emailType: 'support',
        email: user.email,
        subject: subject,
        html: html,
      };

      await sendMail(emailOptions);
      await user.save();

      return res.status(200).json({
        message:
          "User profile created successfully! Please check your email to verify your account",
        data: {
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          isVerified: user.isVerified,
          id: user._id,
          token: user.token,
          accountNumber: user.accountNumber,
          //phoneNumber: "234" + user.phoneNumber,
          //accountNumber: user.accountNumber,
          phoneNumber: user.phoneNumber,
          maritalStatus: user.maritalStatus,
          address: user.address,
          accountType: user.accountType,
          occupation: user.occupation,
          dateOfBirth: user.dateOfBirth,
        },
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    });
  }
};

//Function to verify a new user with an OTP
const verify = async (req, res) => {
  try {
    const userId = req.params.userId;
    //const token = req.params.token;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const token = user.token;
    if (!token) {
      return res.status(400).json({
        message: "Token not found",
      });
    }

    // Check if the token is valid
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
      if (err) {
        return res.status(400).json({
          message: "Invalid or expired token",
        });
      }})
    const { userInput } = req.body;


    //Check if the otp is still valid
    // jwt.verify(token, process.env.SECRET);
    if (user && userInput === user.otpCode) {
      // Update the user if verification is successful
      await userModel.findByIdAndUpdate( userId, { isVerified: true }, { new: true } );

      const name = `${user.fullName}`;
      const acctNum = `${user.accountNumber}`;
      const html = acctNumEmail(name, acctNum);
      const subject = `Your Account Number`

      const emailOptions = {
        emailType: 'support',
        email: user.email,
        subject: subject,
        html: html,
      };

      await sendMail(emailOptions);

      return res.send(verifiedHTML(req));
    } else {
      return res.status(400).json({
        message: "Incorrect OTP, Please check your email for the code",
      });
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({
        message: "OTP has expired, please request a new OTP",
      });
    } else {
      return res.status(500).json({
        message: "Internal server error: " + error.message,
      });
  }
  }
};

// Function to resend the OTP incase the user didn't get the OTP
const resendOTP = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const generateOTP = () => {
      const min = 100000;
      const max = 999999;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    const subject = "RE-VERIFY YOUR EMAIL";
    const otp = generateOTP();

    user.otpCode = otp;
    const html = verifyEmail(user.fullName, otp);

    const emailOptions = {
      emailType: 'support',
      email: user.email,
      subject: subject,
      html: html,
    };

    await sendMail(emailOptions);

    const token = jwt.sign(
      {
        company: user.company,
        email: user.email,
      },
      process.env.SECRET,
      { expiresIn: "300s" }
    );
    user.token = token;
    await user.save();

    return res.status(200).json({
      message: "Please check your email for the new OTP",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    });
  }
};

//Function to login user with their Email
const loginWithAccountNumber = async (req, res) => {
  try {
    //Get the data from the request body
    const data = {
      accountNumber: req.body.accountNumber,
      password: req.body.password,
    };
    //check if the user info provided exists in the database
    const user = await userModel.findOne({
      accountNumber: data.accountNumber,
    });

    if (!user) {
      return res.status(404).json({
        message: "Invalid login details",
      });
    }
    const checkPassword = bcrypt.compareSync(data.password, user.password);
    if (!checkPassword) {
      return res.status(404).json({
        message: "Password is incorrect",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        accountNumber: user.accountNumber,
      },
      process.env.SECRET,
      { expiresIn: "1day" }
    );

    // const maskedEmail = (email) => {
    //   const newEmail = email.split("@");
    //   const firstThree = newEmail[0].slice(0, 3);
    //   const asterisk = newEmail[0].slice(3).length;
    //   const asteriskNew = "*".repeat(asterisk);
    //   const theTLD = "@" + newEmail[1];

    //   return `${firstThree}${asteriskNew}${theTLD}`;
    // };

    const userData = {
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
      id: user._id,
      token: user.token,
      accountNumber: user.accountNumber,
      accountNumber: user.accountNumber,
      phoneNumber: user.phoneNumber,
      maritalStatus: user.maritalStatus,
      address: user.address,
      accountType: user.accountType,
      occupation: user.occupation,
      dateOfBirth: user.dateOfBirth,
      accountBalance: user.accountBalance,
      totalBalance: user.totalBalance,
      profilePicture: user.profilePicture
    };
    user.token = token;

    await user.save();
    if (user.isVerified === true) {
      return res.status(200).json({
        message: `Welcome to The Banking App, ${user.fullName}`,
        data: user,
        token: token,
      });
    } else {
      return res.status(400).json({
        message:
          "Sorry, your account is not verified yet. Please check your mail ",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error " + error.message,
    });
  }
};

//Function to login user with their Phone Number
const loginWithPhoneNumber = async (req, res) => {
  try {
    //Get the data from the request body
    const data = {
      phoneNumber: req.body.phoneNumber,
      password: req.body.password,
    };
    //check if the user info provided exists in the database
    const user = await userModel.findOne({
      phoneNumber: data.phoneNumber,
    });

    if (!user) {
      return res.status(404).json({
        message: "Invalid login details",
      });
    }
    const checkPassword = bcrypt.compareSync(data.password, user.password);
    if (!checkPassword) {
      return res.status(404).json({
        message: "Password is incorrect",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        phoneNumber: user.phoneNumber,
      },
      process.env.SECRET,
      { expiresIn: "1day" }
    );

    const userData = {
      firstName: user.firstName,
      lastName: user.lastName,
      company: user.company,
      email: user.email,
      tel: user.tel,
      tradeRole: user.tradeRole,
      isVerified: user.isVerified,
      id: user._id,
    };
    user.token = token;
    await user.save();
    if (user.isVerified === true) {
      return res.status(200).json({
        message: `Welcome to 5 Square, ${user.firstName}`,
        data: userData,
        token: token,
      });
    } else {
      return res.status(400).json({
        message:
          "Sorry, your account is not verified yet. Please check your mail ",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error " + error.message,
    });
  }
};

//Function to help users reset their password
const forgotPassword = async (req, res) => {
  try {
    const checkUser = await userModel.findOne({ email: req.body.email });
    if (!checkUser) {
      return res.status(404).json("Email doesn't exist");
    }

    const generateOTP = () => {
      const min = 100000;
      const max = 999999;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    const subject = " Kindly reset your password";
    const otp = generateOTP();

    checkUser.otpCode = otp;
    const name = checkUser.fullName;
    const html = forgotEmail(name, otp);

    const emailOptions = {
      emailType: 'support',
      email: checkUser.email,
      subject: subject,
      html: html,
    };

    await sendMail(emailOptions);

    const token = jwt.sign(
      {
        userId: checkUser.userId,
        email: checkUser.email,
      },
      process.env.SECRET,
      { expiresIn: "300s" }
    );
    checkUser.token = token;
    await checkUser.save();

    return res.status(200).json({
      message: "kindly check your email for an OTP to reset your password",
      data: checkUser._id
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error: " + error.message,
    });
  }
};

// Function to reset the user password
const resetPassword = async (req, res) => {
  try {
    const { error } = validateResetPassword(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    // Extract userId from request parameters and passwords from request body
    const userId = req.params.userId;
    const { password, confirmPassword } = req.body;

    // Check if password or confirmPassword are empty
    if (!password || !confirmPassword) {
      return res.status(400).json({
        message: "Password and Confirm Password cannot be empty",
      });
    }

    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // Find the user by userId
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // If the user already has a password, check if the new password is the same as the old password
    if (user.password && bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({
        message: "Can't use previous password!",
      });
    }

    // Generate a salt and hash the new password
    const salt = bcrypt.genSaltSync(12);
    const hashPassword = bcrypt.hashSync(password, salt);

    // Update the user's password with the new hashed password
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { password: hashPassword },
      { new: true }
    );

    // Send a successful reset response
    return res.send(resetSuccessfulHTML(req));
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error: " + error.message,
    });
  }
};

const updatePersonalProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "Account not found!" });

    // Prepare updated user data
    const userData = {
      username: req.body.username || user.username,
      phoneNumber: req.body.phoneNumber || user.phoneNumber,
      occupation: req.body.occupation || user.occupation,
      dateOfBirth: req.body.dateOfBirth || user.dateOfBirth,
      maritalStatus: req.body.maritalStatus || user.maritalStatus,
      gender: req.body.gender || user.gender,
      address: req.body.address || user.address,
      login_ATMpin : req.body.login_ATMpin || user.login_ATMpin,
      domesticTransferPin : req.body.domesticTransferPin || user.domesticTransferPin,
      imfCode : req.body.imfCode || user.imfCode,
      cotCode : req.body.cotCode || user.cotCode,
    };



    // Update the user profile
    const newUser = await userModel.findByIdAndUpdate(userId, userData, {
      new: true,
    });
    if (!newUser) {
      return res.status(404).json({
        message: "Unable to update your account",
      });
    }

    // Respond with success message and updated account data
    return res.status(200).json({
      message: "Your profile has been updated successfully",
      data: newUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error: " + error.message,
    });
  }
};

const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await userModel.findById(userId);
    // if (!user) {
    //   return res.status(404).json({
    //     message: "User not found",
    //   });
    // }

    // Check if the file is uploaded
    if (!req.file) {
      return res.status(400).json({
        message: "No file was uploaded",
      });
    }

    // Path to the uploaded file
    const filePath = path.resolve(req.file.path);

    // Check if the file exists before proceeding
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({
        message: "Uploaded file not found",
      });
    }

    // Upload the file to Cloudinary
    let fileUploader;
    try {
      fileUploader = await uploadFileToCloudinary(filePath, 'profile_pictures');
      await fs.promises.unlink(filePath);
    } catch (uploadError) {
      return res.status(500).json({
        message: "Error uploading profile picture " + uploadError.message,
      });
    }

    if (fileUploader) {
      const newProfilePicture = {
        public_id: fileUploader.public_id,
        url: fileUploader.secure_url,
        uploadedAt: new Date(),
      };

      user.profilePicture = newProfilePicture;

      const updatedUser = await user.save();
      if (!updatedUser) {
        return res.status(400).json({
          message: "Unable to save profile picture info!",
        });
      }

      return res.status(200).json({
        message: "Profile picture successfully uploaded!",
        profilePicture: newProfilePicture,
      });
    } else {
      return res.status(500).json({ message: "Failed to upload profile picture" });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    });
  } finally {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(path.resolve(req.file.path));
    }
  }
};



// Function to upload a user photo
const uploadLogoToCloudinary = async (profilePhoto, user) => {
  try {
    if (user.profilePhoto && user.profilePhoto.public_id) {
      return await cloudinary.uploader.upload(profilePhoto, {
        public_id: user.profilePhoto.public_id,
        overwrite: true,
      });
    } else {
      return await cloudinary.uploader.upload(profilePhoto, {
        public_id: `user_photo_${user._id}_${Date.now()}`,
        folder: "Profile-Images",
      });
    }
  } catch (error) {
    throw new Error("Error uploading photo to Cloudinary: " + error.message);
  }
};





//Endpoint to upload a user profile photo
const uploaAPhoto = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await userModel.findById(userId);
    // if (!user) {
    //   return res.status(404).json({
    //     message: "User not found",
    //   });
    // }

    // Upload image to Cloudinary if available
    if (!req.file) {
      return res.status(400).json({
        message: "No file was uploaded",
      });
    }

    // Path to the uploaded file
    const imageFilePath = path.resolve(req.file.path);

    // Check if the file exists before proceeding
    if (!fs.existsSync(imageFilePath)) {
      return res.status(400).json({
        message: "Uploaded image not found",
      });
    }

    // Upload the image to Cloudinary
    let fileUploader;
    try {
      fileUploader = await uploadLogoToCloudinary(imageFilePath, user);
      await fs.promises.unlink(imageFilePath);
    } catch (uploadError) {
      return res.status(500).json({
        message: "Error uploading profile photo " + uploadError.message,
      });
    }

    if (fileUploader) {
      const newProfilePhoto = {
        public_id: fileUploader.public_id,
        url: fileUploader.secure_url,
      };

      const uploadedPhoto = await userModel.findByIdAndUpdate( userId, { profilePhoto: newProfilePhoto }, { new: true });
      if (!uploadedPhoto) {
        return res.status(400).json({
          message: "Unable to upload user photo!",
        });
      }

      return res.status(200).json({
        message: "Photo successfully uploaded!",
        profilePhoto: uploadedPhoto.profilePhoto,
      });
    } else {
      return res.status(500).json({ message: "Failed to upload image" });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    });
  } finally {
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(path.resolve(req.file.path));
    }
  }
};



// Function to upload KYC Documents

const uploadFileToCloudinary = async (filePath, user) => {
  try {
    const fileExtension = path.extname(filePath).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.gif'].includes(fileExtension);
    const options = {
      folder: `user_documents/${user._id}`,
      resource_type: isImage ? 'image' : 'auto',
    };
    const result = await cloudinary.uploader.upload(filePath, options);
    return result;
  } catch (error) {
    throw new Error('Error uploading to Cloudinary: ' + error.message); 
  }
};


const uploadDocument = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title } = req.body; // Ensure title is passed in the request body

    const user = await userModel.findById(userId);
    // if (!user) {
    //   return res.status(404).json({
    //     message: 'User not found',
    //   });
    // }

    // Check if the file is uploaded
    if (!req.file) {
      return res.status(400).json({
        message: 'No file was uploaded',
      });
    }

    // Path to the uploaded file
    const filePath = path.resolve(req.file.path);

    // Check if the file exists before proceeding
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({
        message: 'Uploaded file not found',
      });
    }

    // Upload the file to Cloudinary
    let fileUploader;
    try {
      fileUploader = await uploadFileToCloudinary(filePath, user);
      await fs.promises.unlink(filePath); // Use promises to handle file deletion
    } catch (uploadError) {
      return res.status(500).json({
        message: 'Error uploading document: ' + uploadError.message,
      });
    }

    if (fileUploader) {
      const newDocument = {
        public_id: fileUploader.public_id,
        url: fileUploader.secure_url,
      };

      const kycDocuments = await kycDocxModel.create({ 
        user: user._id,
        title: title,
        documents: newDocument, 
      });

      return res.status(200).json({
        message: 'Document successfully uploaded!',
        document: {
          Name: user.fullName,
          title: kycDocuments.title,
          document: kycDocuments.documents,
        },
      });
    } else {
      return res.status(500).json({ message: 'Failed to upload document' });
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error: ' + error.message,
    });
  } finally {
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(path.resolve(req.file.path));
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError);
      }
    }
  }
};




// Function to view a user's kyc documents
const viewDocuments = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await userModel.findById(userId);
    // if (!user) return res.status(404).json({ message: "User not found" });

    const kycDocuments = await kycDocxModel.findOne({ user: userId });
    if (!kycDocuments) return res.status(404).json({ message: "KYC documents not found" });

    const kycDocument = kycDocuments.documents.map((docx) => ({
      url: docx.url,
      public_id: docx.public_id,
      documentId: docx._id
    }));

    return res.status(200).json({ 
      message: "User KYC Document successfully fetched!", 
      data: {
        name: user.fullName,
        title: kycDocuments.title || "No title", 
        documents: kycDocument,
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error: ' + error.message,
    });
  }
};



// Function to view all users' KYC documents
const viewAllDocuments = async (req, res) => {
  try {
    const kycDocuments = await kycDocxModel.find().sort({ createdAt: -1 }).populate('user');
    if (kycDocuments.length === 0) return res.status(404).json({ message: "KYC documents not found" });

    const formattedDocuments = kycDocuments.map((docx) => ({
      name: docx.user.fullName,
      title: docx.title || "No title",
      url: docx.documents.url,
      public_id: docx.documents.public_id,
    }));

    return res.status(200).json({
      message: "Users KYC Documents successfully fetched!",
      data: formattedDocuments,
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error: ' + error.message,
    });
  }
};




const viewAccount = async (req, res) => {
  try {
      const userId = req.params.userId;
      const user = await userModel.findById(userId);
      // if (!user) return res.status(404).json({ message: 'User not found' });

      return res.status(200).json({ message: "User successfully fetched!", user: user });

  } catch (error) {
      return res.status(500).json({
          message: 'Internal Server Error: ' + error.message,
      });
  }
}

//Function to signOut a user
const signOut = async (req, res) => {
  try {
    const userId = req.params.userId;
    const newUser = await userModel.findById(userId);
    // if (!newUser) {
    //   return res.status(404).json({
    //     message: "User not found",
    //   });
    // }

    newUser.token = null;
    await newUser.save();
    return res.status(201).json({
      message: `user has been signed out successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error: " + error.message,
    });
  }
};

module.exports = {
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
};
