const adminModel = require("../models/adminModel");
const userModel = require("../models/userModel");
const transactionModel = require("../models/transactionModel");
const historyModel = require("../models/historyModel");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//Function to sign up an admin
exports.signUpNew = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    const emailExist = await adminModel.findOne({ email });
    if (emailExist) {
      return res.status(404).json({
        error: "User already exists",
      });
    }

    if (confirmPassword !== password) {
      return res.status(400).json({
        error: "Password mismatch",
      });
    }

    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(password, salt);
    // Register the admin
    const newUser = await adminModel.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hash,
    });

    const token = jwt.sign(
      {
        userId: newUser._id,
        username: newUser.username,
      },
      process.env.SECRET,
      { expiresIn: "6000s" }
    );

    return res.status(200).json({
      message: `Hello, ${newUser.username}! You have successfully signed up as an admin`,
      data: newUser,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      Error: "Internal Server Error: " + error.message,
    });
  }
};

//Function to login an admin
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const checkAdmin = await adminModel.findOne({
      username: username.toLowerCase(),
    });
    if (!checkAdmin) {
      return res.status(404).json({
        error: "Admin not found",
      });
    }


    const checkPassword = bcrypt.compareSync(password, checkAdmin.password);
    if (!checkPassword) {
      return res.status(404).json({
        message: "Password is incorrect",
      });
    }

    const token = jwt.sign(
      {
        userId: checkAdmin._id,
        isAdmin: checkAdmin.isAdmin,
      },
      process.env.SECRET,
      { expiresIn: "1day" }
    );

    checkAdmin.token = token;

    await checkAdmin.save();
    if (checkAdmin.isVerified === true) {
      return res.status(200).json({
        message: `Welcome ${checkAdmin.username}! Login successsful`,
        data: checkAdmin,
        // token: token
      });
    } else {
      return res.status(400).json({
        message:
          "Sorry, your account is not verified yet. Please check your mail ",
      });
    }
  } catch (error) {
    return res.status(500).json({
      Error: "Internal Server Error: " + error.message,
    });
  }
};

//Function to signOut a user
exports.signOut = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const admin = await adminModel.findById({ _id: adminId });
    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    admin.token = null;
    await admin.save();
    return res.status(201).json({
      message: `Admin has been signed out successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error: " + error.message,
    });
  }
};

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Functions to handle the Client accounts

// Function to create a new account
exports.createAccount = async (req, res) => {
  try {
    const userData = {
      fullName: req.body.fullName,
      username: req.body.username,
      password: req.body.password,
      retype_password: req.body.retype_password,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,
      occupation: req.body.occupation,
      dateOfBirth: req.body.dateOfBirth,
      maritalStatus: req.body.maritalStatus,
      gender: req.body.gender,
      address: req.body.address,
      accountType: req.body.accountType,
      registrationDate: req.body.registrationDate,
      totalBalance: req.body.totalBalance,
      availableBalance: req.body.availableBalance,
      accountNumber: req.body.accountNumber,
      accountCurrency: req.body.accountCurrency,
      accountLimit: req.body.accountLimit,
      cotCode: req.body.cotCode,
      taxCode: req.body.taxCode,
      matchingCode: req.body.matchingCode,
    };

    if (!userData)
      return res.status(400).json({ message: "Please fill all the fields below." });

    const emailExist = await userModel.findOne({ email: userData.email });
    if (emailExist)
      return res.status(404).json({ message: "Email already exists" });

    const usernameExist = await userModel.findOne({
      username: userData.username,
    });
    if (usernameExist)
      return res.status(404).json({ message: "Username already exists" });

    const phoneNumberExist = await userModel.findOne({
      phoneNumber: userData.phoneNumber,
    });
    if (phoneNumberExist)
      return res.status(404).json({ message: "Phone Number already exists" });

    const accountNumberExist = await userModel.findOne({
      accountNumber: userData.accountNumber,
    });
    if (accountNumberExist)
      return res.status(404).json({ message: "Account Number already exists" });

    if (userData.retype_password !== userData.password)
      return res.status(400).json({ message: "Passwords do not match" });

    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(userData.password, salt);

    // Create user account
    const user = await userModel.create({
      fullName: userData.fullName.toLowerCase(),
      username: userData.username,
      password: hash,
      revealPass: userData.password,
      phoneNumber: userData.phoneNumber,
      email: userData.email.toLowerCase(),
      occupation: userData.occupation.toLowerCase(),
      dateOfBirth: userData.dateOfBirth,
      maritalStatus: userData.maritalStatus,
      gender: userData.gender,
      address: userData.address,
      accountType: userData.accountType,
      registrationDate: userData.registrationDate,
      totalBalance: userData.totalBalance,
      availableBalance: userData.availableBalance,
      accountNumber: userData.accountNumber,
      accountCurrency: userData.accountCurrency,
      accountLimit: userData.accountLimit,
      cotCode: userData.cotCode,
      taxCode: userData.taxCode,
      matchingCode: userData.matchingCode,
      isVerified: true,
    });

    if (!user)
      return res.status(400).json({ message: "Unable to create client account" });

    return res.status(200).json({
      message: `Hello, ${user.fullName}. Your account has been successfully created.`,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error: " + error.message,
    });
  }
};

//Function to update user account
exports.updateAccount = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await userModel.findById(userId);
    // if (!user) return res.status(404).json({ message: "User not found!" });

    // Check if a new password is provided
    let hash = user.password; // Default to existing password

    if (req.body.password) {
      const newPassword = req.body.password;
      const salt = bcrypt.genSaltSync(12);
      hash = bcrypt.hashSync(newPassword, salt);
    }
    
    // Prepare updated user data
    const userData = {
      fullName: req.body.fullName || user.fullName,
      username: req.body.username || user.username,
      password: hash,
      phoneNumber: req.body.phoneNumber || user.phoneNumber,
      email: req.body.email || user.email,
      occupation: req.body.occupation || user.occupation,
      dateOfBirth: req.body.dateOfBirth || user.dateOfBirth,
      maritalStatus: req.body.maritalStatus || user.maritalStatus,
      gender: req.body.gender || user.gender,
      address: req.body.address || user.address,
      accountType: req.body.accountType || user.accountType,
      registrationDate: req.body.registrationDate || user.registrationDate,
      totalBalance: req.body.totalBalance || user.totalBalance,
      availableBalance: req.body.availableBalance || user.availableBalance,
      accountNumber: req.body.accountNumber || user.accountNumber,
      accountCurrency: req.body.accountCurrency || user.accountCurrency,
      accountLimit: req.body.accountLimit || user.accountLimit,
      cotCode: req.body.cotCode || user.cotCode,
      taxCode: req.body.taxCode || user.taxCode,
      matchingCode: req.body.matchingCode || user.matchingCode,
    };

    // Update the user profile
    const newUser = await userModel.findByIdAndUpdate(userId, userData, { new: true });
    if (!newUser) {
      return res.status(404).json({
        message: "Unable to update the user's account",
      });
    }    

    newUser.revealPass = userData.password || user.revealPass;
    await newUser.save();

    // Respond with success message and updated account data
    return res.status(200).json({
      message: "User account has been updated successfully",
      data: newUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error: " + error.message,
    });
  }
};

//Function to delete user account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await userModel.findById(userId);
    // if (!user) return res.status(404).json({ message: "User not found!" });

    // delete the user profile
    const newUser = await userModel.findByIdAndDelete(userId);
    if (!newUser) {
      return res.status(404).json({
        message: "Unable to delete the user's account",
      });
    }

    // Respond with success message of upon deletion
    return res.status(200).json({
      message: "User account has been deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error: " + error.message,
    });
  }
};

// Function to change the status of the account
exports.changeStatus = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await userModel.findById(userId);
    // if (!user) return res.status(404).json({ message: "User not found!" });

    const statusData = {
      accountStatus: req.body.accountStatus || user.accountStatus,
    };
    if (!statusData)
      return res.status(404).json({ message: "Please select the account status!" });

    // Update the user account status
    const newUser = await userModel.findByIdAndUpdate(userId, statusData, {
      new: true,
    });
    if (!newUser) {
      return res.status(404).json({
        message: "Unable to update the user's account status",
      });
    }

    // Respond with success message and updated account data
    return res.status(200).json({
      message: "User account status has been updated successfully",
      data: newUser.accountStatus,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error: " + error.message,
    });
  }
};

// Function to Credit a user's account

// exports.creditAccount = async (req, res) => {
//     try {
//         const userId = req.params.userId;
//         const user = await userModel.findById(userId);
//         if (!user) return res.status(404).json({ message: "User not found!" });

//         const transactionData = {
//             chooseAccount: req.body.chooseAccount,
//             from: req.body.from,
//             amount: req.body.amount,
//             description: req.body.description,
//             date: req.body.date,
//             time: req.body.time
//         }

//         if (!transactionData.chooseAccount || !transactionData.from || !transactionData.amount) {
//             return res.status(400).json({ message: "Please provide all required transaction details!" });
//         }

//         const fromAccount = await userModel.findOne({accountNumber: transactionData.from});
//         if (!fromAccount) return res.status(400).json({ message: "User account not found!" });

//         if (transactionData.amount <= 0) return res.status(400).json({ message: "Amount can't be less than or equal to zero" });

//         if (fromAccount.totalBalance < transactionData.amount) return res.status(400).json({ message: "Insuffient funds in account!" });

//         user.totalBalance += transactionData.amount;
//         fromAccount.totalBalance -= transactionData.amount;

//         await user.save();
//         await fromAccount.save();

//         const credit = new transactionModel({
//             userId: transactionData.chooseAccount,
//             recipientAccount: transactionData.from,
//             amount: transactionData.amount,
//             description: transactionData.description,
//             date: transactionData.date,
//             time: transactionData.time,
//             type: "transfer"
//         });

//         await credit.save();

//         const creditHistory = await historyModel.create({
//             sender: fromAccount,
//             amountTransferred: credit.amount,
//             accountTransferredTo: credit.userId,
//             transactionType: "credit",
//             bank: "Avante-Garde-Finance",
//             accountName: user.fullName,
//             date: credit.date,
//         })

//         return res.status(200).json({ message: "Account credited successfully!", credit });

//     } catch (error) {
//         return res.status(500).json({
//             message: 'Internal Server Error: ' + error.message,
//         });
//     }
// }

exports.creditAccount = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await userModel.findById(userId);
    // if (!user) return res.status(404).json({ message: "User not found!" });
    const { chooseAccount, from, amount, bank, description, date, time } = req.body;

    // Validate the required fields
    if (!chooseAccount || !from || !amount) {
      return res.status(400).json({ message: "Please provide all required transaction details!" });
    }


    // Convert amount to a number
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        message: "Invalid amount. It must be a number greater than zero.",
      });
    }

    // Find the "from" account
    const fromAccount = await userModel.findOne({ accountNumber: from });
    if (!fromAccount)
      return res.status(404).json({ message: "Sender account not found!" });

    // Find the "chooseAccount" (recipient) account
    const toAccount = await userModel.findOne({ accountNumber: chooseAccount });
    if (!toAccount)
      return res.status(404).json({ message: "Recipient account not found!" });

        if (amountNum <= 0) return res.status(400).json({ message: "Amount can't be less than or equal to zero" });

        if (fromAccount.totalBalance < amountNum) return res.status(400).json({ message: "Insuffient funds in account!" });

        toAccount.totalBalance += amountNum;
        toAccount.availableBalance += amountNum;


        fromAccount.totalBalance -= amountNum;
        fromAccount.availableBalance -= amountNum;

    // Save the updated account balances
    await fromAccount.save();
    await toAccount.save();

        const credit = new transactionModel({
            userId: fromAccount._id,
            recipientAccount: toAccount.accountNumber,
            bank: toAccount.bank,
            amount: amountNum,
            description: description,
            date: date,
            time: time,
            status: "confirmed",
            type: "transfer"
        });

    await credit.save();

    // Create the credit history record
    const creditHistory = new historyModel({
      sender: fromAccount._id,
      amountTransferred: amountNum,
      accountTransferredTo: toAccount._id,
      transactionType: "credit",
      bank: bank,
      accountName: toAccount.fullName,
      date: date,
      remark: description,
    });

    await creditHistory.save();

    return res.status(200).json({ message: "Account credited successfully!", creditHistory });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error: " + error.message,
    });
  }
};

exports.debitAccount = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await userModel.findById(userId);
    // if (!user) return res.status(404).json({ message: "User not found!" });

    const transactionData = {
      chooseAccount: req.body.chooseAccount,
      to: req.body.to,
      amount: req.body.amount,
      bank: req.body.bank,
      description: req.body.description,
      date: req.body.date,
      time: req.body.time,
    };

    if (!transactionData.chooseAccount || !transactionData.to || !transactionData.amount) { 
        return res.status(400).json({ message: "Please provide all required transaction details!" });
    }

    // Convert amount to a number
    const amountNum = parseFloat(transactionData.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        message: "Invalid amount. It must be a number greater than zero.",
      });
    }

    const recipientAccount = await userModel.findOne({ accountNumber: transactionData.to });
    if (!recipientAccount)
      return res.status(404).json({ message: "Recipient account not found!" });

    if (user.totalBalance < amountNum)
      return res.status(400).json({ message: "Insufficient funds in account!" });

        user.totalBalance -= amountNum;
        user.availableBalance -= amountNum;

        recipientAccount.totalBalance += amountNum;
        recipientAccount.availableBalance += amountNum;

    await user.save();
    await recipientAccount.save();

        const debit = new transactionModel({
            userId: transactionData.chooseAccount,
            type: "transfer",
            amount: amountNum,
            description: transactionData.description,
            date: transactionData.date,
            recipientAccount: recipientAccount._id,
            bank: transactionData.bank,

        });

    await debit.save();

    const debitHistory = await historyModel.create({
      sender: userId,
      amountTransferred: amountNum,
      accountTransferredTo: recipientAccount._id,
      transactionType: "debit",
      bank: transactionData.bank,
      accountName: recipientAccount.fullName,
      date: transactionData.date,
    });

    return res.status(200).json({ message: "Account debited successfully!", debitHistory });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error: " + error.message,
    });
  }
};


exports.viewOneUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await userModel.findById(userId);
    // if (!user) return res.status(404).json({ message: "User not found" });

    return res
      .status(200)
      .json({ message: "User successfully fetched!", user: user });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error: " + error.message,
    });
  }
};



exports.viewAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().sort({ createdAt: -1 });
    if (!users) return res.status(404).json({ message: "Users not found" });

    return res
      .status(200)
      .json({ message: "Users successfully fetched!", data: users });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error: " + error.message,
    });
  }
};





//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------




//Function for the transactions history
exports.addHistory = async (req, res) => {
  try {
    const { sender, amountTransferred, accountTransferredTo, transactionType, bank, accountName, remark, date, } = req.body;
    if ( !sender || !amountTransferred || !accountTransferredTo || !transactionType || !bank || !accountName || !remark || !date ) {
      return res.status(400).json({ message: "Please fill the above fields!" });
    }

    // Fetch sender details
    const senderDetails = await userModel.findById(sender);
    if (!senderDetails) {
      return res.status(404).json({ message: "Sender not found" });
    }

    // Fetch receiver details
    const receiverDetails = await userModel.findById(accountTransferredTo);
    if (!receiverDetails) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    const history = new historyModel({
      sender,
      amountTransferred,
      accountTransferredTo,
      transactionType,
      bank,
      accountName,
      remark,
      date,
    });

    if (!history) {
      return res.status(400).json({ message: "Unable to add history!" });
    }

    await history.save();

    const historyWithNames = {
      ...history.toObject(),
      senderName: senderDetails.fullName,
      receiverName: receiverDetails.fullName,
    };

    return res.status(200).json({
      message: "History successfully added!",
      history: historyWithNames,
      //   senderName: senderDetails.fullName,
      //   receiverName: receiverDetails.fullName,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error: " + error.message,
    });
  }
};


exports.viewHistorys = async (req, res) => {
  try {
    const historyId = req.params.historyId;
    const history = await historyModel
      .findById(historyId)
      .populate("sender", "fullName")
      .populate("accountTransferredTo", "fullName");

    if (!history) return res.status(404).json({ message: "History not found" });

    const historyWithNames = {
      ...history.toObject(),
      senderName: history.sender.fullName,
      receiverName: history.accountTransferredTo.fullName,
      remark: history.remark,
      transactionType: history.transactionType,
    };

    return res
      .status(200)
      .json({
        message: "History successfully fetched!",
        history: historyWithNames,
      });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error: " + error.message,
    });
  }
};

exports.viewHistory = async (req, res) => {
  try {
    const historyId = req.params.historyId;
    const history = await historyModel
      .findById(historyId)
      .populate("sender", "fullName")
      .populate("accountTransferredTo", "fullName");

    if (!history) return res.status(404).json({ message: "History not found" });

    const historyDetails = {
      senderName: history.sender.fullName,
      receiverName: history.accountTransferredTo.fullName,
      amountTransferred: history.amountTransferred,
      remark: history.remark,
      transactionType: history.transactionType,
      bank: history.bank,
      date: history.date,
    };

    return res
      .status(200)
      .json({
        message: "History successfully fetched!",
        history: historyDetails,
      });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error: " + error.message,
    });
  }
};


exports.viewAllHistory = async (req, res) => {
    try {
      const histories = await historyModel
        .find()
        .sort({ createdAt: -1 })
        .populate("sender", "fullName")
        .populate("accountTransferredTo", "fullName");
  
      if (!histories.length) return res.status(404).json({ message: "No history found" });
  
      const historyDetails = histories.map(history => ({
        senderName: history.sender?.fullName || 'N/A',
        receiverName: history.accountTransferredTo?.fullName || 'N/A',
        amountTransferred: history.amountTransferred,
        remark: history.remark,
        transactionType: history.transactionType,
        bank: history.bank,
        date: history.date,
        _id: history._id,
      }));
    

      return res
        .status(200)
        .json({
          message: "History successfully fetched!",
          history: historyDetails,
        });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error: " + error.message,
      });
    }
  };
  


//Function to edit a particular transaction history
exports.updateHistory = async (req, res) => {
  try {
    const historyId = req.params.historyId;
    const history = await historyModel.findById(historyId);
    if (!history) return res.status(404).json({ message: "History not found" });

    const historyData = {
      sender: req.body.sender || history.sender,
      amountTransferred:
        req.body.amountTransferred || history.amountTransferred,
      accountTransferredTo:
        req.body.accountTransferredTo || history.accountTransferredTo,
      transactionType: req.body.transactionType || history.transactionType,
      bank: req.body.bank || history.bank,
      accountName: req.body.accountName || history.accountName,
      remark: req.body.remark || history.remark,
      date: req.body.date || history.date,
    };

    const updateHistory = await historyModel.findByIdAndUpdate(
      historyId,
      historyData,
      { new: true }
    );
    if (!updateHistory)
      return res.status(400).json({ message: "Unable to update history" });

    return res
      .status(200)
      .json({ message: "History successfully updated!", history: history });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error: " + error.message,
    });
  }
};

//Function to delete a particular transaction history
exports.deleteHistory = async (req, res) => {
  try {
    const historyId = req.params.historyId;
    const history = await historyModel.findById(historyId);
    if (!history) return res.status(404).json({ message: "History not found" });

    const updateHistory = await historyModel.findByIdAndDelete(historyId);
    if (!updateHistory)
      return res.status(400).json({ message: "Unable to update history" });

    return res.status(200).json({ message: "History successfully deleted!" });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error: " + error.message,
    });
  }
};
