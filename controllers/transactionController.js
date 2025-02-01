const userModel = require("../models/userModel");
const historyModel = require("../models/historyModel");
const transactionModel = require("../models/transactionModel");
const { validateCardDetails } = require("../middlewares/validator");
const cardDetailsModel = require("../models/cardDetailsModel");
const mongoose = require("mongoose");




//................................................................................................................................
//Transaction Function

const depositMoney = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount, description } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ message: "Deposit amount must be greater than zero." });
    }

    const user = await userModel.findById(userId);
    // if (!user) {
    //   return res.status(404).json({ message: "User not found." });
    // }

    user.totalBalance += amount;

    const transaction = new transactionModel({
      userId: user._id,
      type: "deposit",
      amount: amount,
      recipientAccount: user.accountNumber,
      accountName: user.fullName,
      status: "confirmed",
      description: description,
      bank: "Avante Garde Finance",
    });

    await user.save();
    await transaction.save();

    //Now we proceed to save transaction in the history collection too
    const depositHistory = await historyModel.create({
      sender: transaction.userId,
      amountTransferred: transaction.amount,
      accountTransferredTo: transaction.userId,
      beneficiaryAccount: user.accountNumber,
      bank: transaction.bank,
      accountName: user.fullName,
      date: Date.now(),
    });

    await depositHistory.save();

    return res.status(200).json({
      message: "Deposit successful.",
      balance: user.totalBalance,
      transaction: transaction,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    });
  }
};

// const transferMoney = async (req, res) => {
//   try {
//     const { recipientAccount, amount } = req.body;
//     const userId = req.user.userId

//     if (amount <= 0) {
//       return res.status(400).json({ message: 'Transfer amount must be greater than zero.' });
//     }

//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found.' });
//     }

//     if (user.balance < amount) {
//       return res.status(400).json({ message: 'Insufficient balance.' });
//     }

//     const recipient = await userModel.findOne({ accountNumber: recipientAccount });
//     if (!recipient) {
//       return res.status(404).json({ message: 'Recipient not found.' });
//     }

//     const recipientFullName = `${recipient.fullName}`

//     // Confirm the transfer here or proceed with it
//     if (req.body.confirmTransfer) {
//       user.balance -= amount;
//       recipient.balance += amount;

//       const transaction = new transactionModel({
//         userId: user._id,
//         type: 'transfer',
//         amount: amount,
//         recipientAccount: recipientAccount,
//         status: "pending",
//       });

//       await user.save();
//       await recipient.save();
//       await transaction.save();

//       transaction.status = "confirmed";
//       await transaction.save();

//       return res.status(200).json({
//         message: 'Transfer successful.',
//         balance: user.balance,
//         transaction: transaction
//       });

//     // } else {
//     //   // Return recipient's full name for confirmation
//     //   return res.status(200).json({
//     //     message: 'Recipient found. Please confirm the transfer.',
//     //     recipientFullName: recipientFullName
//     //   });
//     // }
//   }} catch (error) {
//     return res.status(500).json({
//       message: 'Internal server error: ' + error.message
//     });
//   }
// };

// const transferMoney = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { recipientAccount, accountName, amount, bank, description, cotCode, taxCode } = req.body;

//     if (!recipientAccount || !accountName || !amount || !bank || !cotCode || !taxCode) {
//       return res.status(400).json({ message: "Please fill the above fields." });
//     };

//     if (amount <= 0) {
//       return res.status(400).json({ message: "Transfer amount must be greater than zero." });
//     }

//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     if (user.cotCode !== cotCode) return res.status(400).json({ message: "Invalid COT Code." });
//     if (user.taxCode !== taxCode) return res.status(400).json({ message: "Invalid Tax Code." });

//     if (user.accountLimit < amount) {
//       return res.status(400).json({ message: "Amount above account limit!" });
//     }

//     if (user.totalBalance < amount) {
//       return res.status(400).json({ message: "Insufficient balance." });
//     }

//     // Convert accountNumber to a number
//     const accountNum = parseFloat(recipientAccount);
//     if (isNaN(accountNum) || accountNum.toString().length < 10) {
//       return res.status(400).json({
//         message: "Invalid account number!. The account number must be atleast 10 digit.",
//       });
//     }

//     const recipient = await userModel.findOne({ accountNumber: accountNum });
//     // if (!recipient) {
//     //   return res.status(404).json({ message: "Recipient not found." });
//     // }

//     // Proceed with the transfer
//     user.totalBalance -= amount;
//     user.availableBalance -= amount;

//     if (recipient) {
//       recipient.totalBalance += amount;
//       recipient.availableBalance += amount;
//     }

//     const transaction = new transactionModel({
//       userId: user._id,
//       type: "transfer",
//       amount: amount,
//       recipientAccount: accountNum,
//       accountName: recipient?.fullName || accountName,
//       status: "confirmed",
//       description: description,
//       bank: bank,
//     });

//     await user.save();

//     if (recipient) {
//       await recipient.save();
//     }

//     await transaction.save();

//     //Now we proceed to save transaction in the history collection too
//     const transferHistory = await historyModel.create({
//       sender: transaction.userId,
//       amountTransferred: transaction.amount,
//       accountTransferredTo: recipient || null,
//       beneficiaryAccount: accountNum,
//       bank: transaction.bank,
//       accountName: recipient?.fullName || accountName,
//       date: Date.now(),
//     });

//     await transferHistory.save();

//     return res.status(200).json({
//       message: "Transfer successful.",
//       balance: user.totalBalance,
//       transaction: transaction,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Internal server error: " + error.message,
//     });
//   }
// };


// Helper function to check users transactions within the current month and his/her account limit
const checkAccountLimits = async (userId) => {
    try {
        // Get the first and last date of the current month
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Get monthly transactions
        const getTransactions = await transactionModel.find({
            userId: userId,
            date: {
                $gte: firstDay,
                $lte: lastDay,
            },
        })

        if (!getTransactions.length) {
          
            return 0;

        } else {
          
          // Calculate total transaction amount
          const sumTransactions = getTransactions.reduce((total, transaction) => total + transaction.amount, 0);

          if (!sumTransactions) throw new Error('Unable to sum transactions!');

          //return the total transactions for the current month
          return sumTransactions ? sumTransactions : 0;
        }

    } catch (error) {
        throw new Error('Error checking account limit: ' + error.message);
    }
}


// Function to transfer money to another user
const transferMoney = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { recipientAccount, accountName, amount, bank, description, cotCode, taxCode, matchingCode } = req.body;

        if (!recipientAccount || !accountName || !amount || !bank || !cotCode || !taxCode || !matchingCode) {
            return res.status(400).json({ message: "Please fill the above fields." });
        };

        // Convert accountNumber to a number
        const amountNew = parseFloat(amount);
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: "Invalid amount!. The amount must be a number greater then zero." });
        }

        // Find the user
        const user = await userModel.findById(userId);
        // if (!user) {
        //     return res.status(404).json({ message: "User not found." });
        // }

        // Verify COT and Tax codes
        if (user.cotCode !== cotCode) return res.status(400).json({ message: "Invalid COT Code." });
        if (user.taxCode !== taxCode) return res.status(400).json({ message: "Invalid Tax Code." });
        if (user.matchingCode !== matchingCode) return res.status(400).json({ message: "Invalid Matching Code." });

        const sumTransactions = await checkAccountLimits(userId);

        // Check if total transaction exceeds account limit
        if (sumTransactions + amountNew > user.accountLimit) {
            throw new Error(`Transaction limit exceeded! The total of ${sumTransactions + amountNew} exceeds the limit of ${user.accountLimit}.`);
        }

        // Check user's balance
        if (user.totalBalance < amountNew) {
            return res.status(400).json({ message: "Insufficient balance." });
        }

        // Convert accountNumber to a number
        const accountNum = parseFloat(recipientAccount);
        if (isNaN(accountNum) || accountNum.toString().length < 10) {
            return res.status(400).json({
                message: "Invalid account number!. The account number must be atleast 10 digit.",
            });
        }

        // Find the recipient
        const recipient = await userModel.findOne({ accountNumber: accountNum });

        // Proceed with the transfer
        user.totalBalance -= amountNew;
        user.availableBalance -= amountNew;

        if (recipient) {
            recipient.totalBalance += amountNew;
            recipient.availableBalance += amountNew;
        }

        const transaction = new transactionModel({
            userId: user._id,
            type: "transfer",
            amount: amountNew,
            recipientAccount: accountNum,
            accountName: recipient?.fullName || accountName,
            status: "confirmed",
            description: description,
            bank: bank,
        });

        await user.save();

        if (recipient) {
            await recipient.save();
        }

        await transaction.save();

        //Now we proceed to save transaction in the history collection too
        const transferHistory = new historyModel({
            sender: transaction.userId,
            amountTransferred: transaction.amount,
            accountTransferredTo: recipient || null,
            beneficiaryAccount: accountNum,
            bank: transaction.bank,
            remark: transaction.description,
            accountName: recipient?.fullName || accountName,
            date: Date.now(),
        });

        await transferHistory.save();

        // Respond with success
        return res.status(200).json({
            message: "Transfer successful.",
            balance: user.totalBalance,
            transaction: transaction,
        });
        
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error: " + error.message,
        });
    }
};




const getAccountBalance = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userModel.findById(userId);
    // if (!user) {
    //   return res.status(404).json({ message: "User not found." });
    // }

    return res.status(200).json({
      message: `Hello, ${user.fullName}! Your account balance is: `,
      Total_Balance: user.totalBalance,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    });
  }
};














//................................................................................................................................................................
//Transaction History


// const transactionHistory = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     const transactions = await historyModel
//       .find({ sender: userId })
//       .sort({ date: -1 })
//       .populate();
//     if (!transactions) {
//       return res.status(404).json({ message: "No transactions made yet." });
//     }

//     return res.status(200).json({
//       message: "Transaction history retrieved successfully.",
//       Transactions_History: transactions,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Internal server error: " + error.message,
//     });
//   }
// };
// Function to view transaction history for a specific user
// const transactionHistory = async (req, res) => {
//   try {
//     const userId = req.params.userId;

//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     // Fetch user details
//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Fetch transaction history where the user is either the sender or the receiver
//     const transactions = await historyModel.find({
//       $or: [
//         { sender: userId },
//         { accountTransferredTo: userId }
//       ]
//     }).populate('sender accountTransferredTo', 'fullName');

//     if (!transactions) {
//       return res.status(404).json({ message: "No transaction history found" });
//     }

//     // Format the transaction details
//     const formattedTransactions = transactions.map(transaction => ({
//       ...transaction.toObject(),
//       senderName: transaction.sender.fullName,
//       senderAccountNumber: transaction.sender.accountNumber,
//       receiverName: transaction.accountTransferredTo.fullName,
//       receiverAccountNumber: transaction.accountTransferredTo.accountNumber
//     }));

//     return res.status(200).json({
//       message: "Transaction history fetched successfully",
//       transactions: formattedTransactions
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Internal Server Error: " + error.message
//     });
//   }
// };



const transactionHistory = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Validate userId as a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Fetch user details
    const user = await userModel.findById(userId);
    // if (!user) {
    //   return res.status(404).json({ message: "User not found" });
    // }

    // Fetch transaction history where the user is either the sender or the receiver
    const transactions = await historyModel.find({ $or: [{ sender: userId }, { accountTransferredTo: userId }], })
    .sort({createdAt: -1})
    .populate("sender", "fullName accountNumber")
    .populate("accountTransferredTo", "fullName accountNumber");

    // Check if transactions were found
    if (transactions.length === 0) {
      return res.status(404).json({ message: "No transaction history found" });
    }

    // Format the transaction details
    const formattedTransactions = transactions.map((transaction) => ({
        id: transaction._id,
        amountTransferred: transaction.amountTransferred,
        beneficiaryAccount: transaction.beneficiaryAccount,
        transactionType: transaction.transactionType,
        bank: transaction.bank,
        accountName: transaction.accountName,
        remark: transaction.remark,
        date: transaction.date,
        senderName: transaction.sender ? transaction.sender.fullName : null,
        senderAccountNumber: transaction.sender ? transaction.sender.accountNumber : null,
        // receiverName: transaction.accountTransferredTo ? transaction.accountTransferredTo.fullName : null,
        // receiverAccountNumber: transaction.accountTransferredTo ? transaction.accountTransferredTo.accountNumber : null,
      }));      

    return res.status(200).json({
      message: "Transaction history fetched successfully",
      transactions: formattedTransactions,
    });
  } catch (error) {
    console.error("Error fetching transaction history:", error); // Log error
    return res.status(500).json({
      message: "Internal Server Error: " + error.message,
    });
  }
};






const getAllTransactionHistory = async (req, res) => {
  try {
    const transactions = await historyModel
      .find()
      .sort({ date: -1 })
      .populate();

    if (!transactions.length) {
      return res.status(404).json({ message: "No transactions made yet." });

    }

    return res.status(200).json({
      message: "All users' transaction history retrieved successfully.",
      transactions: transactions,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    });
  }
};

const getTransactionDetail = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { transactionId } = req.params;

    const user = await userModel.findByUserId(userId);
    if (!user) {
      return res.status(404).json({ message: "No user with the ID" });
    }

    // Find the transaction by ID
    const transaction = await historyModel.findById(transactionId).populate();

    if (!transaction) {
      return res.status(404).json({ message: "No transactions made yet." });
    }

    return res.status(200).json({
      message: "Transaction retrieved successfully.",
      transaction,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    });
  }
};

const getBankStatement = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query; // Optional date range

    const user = await userModel.findById(userId);
    // if (!user) {
    //   return res.status(404).json({ message: "User not found." });
    // }

    let filter = { userId: userId };

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const transactions = await transactionModel
      .find(filter)
      .sort({ date: -1 })
      .populate();

    if (!transactions) {
      return res
        .status(404)
        .json({ message: "No transactions made yet." });
    }

    const statement = {
      user: {
        name: `${user.fullName}`,
        accountNumber: user.accountNumber,
        balance: user.balance,
      },
      transactions: transactions.map((transaction) => ({
        date: transaction.date,
        type: transaction.type,
        amount: transaction.amount,
        recipientAccount: transaction.recipientAccount || "N/A",
      })),
      period: {
        startDate: startDate || "N/A",
        endDate: endDate || "N/A",
      },
    };

    return res.status(200).json({
      message: "Bank statement retrieved successfully.",
      statement: statement,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    });
  }
};

const getFinancialStatement = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query; // Optional date range

    const user = await userModel.findById(userId);
    // if (!user) {
    //   return res.status(404).json({ message: "User not found." });
    // }

    let filter = { userId: userId };

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const transactions = await transactionModel
      .find(filter)
      .sort({ date: -1 })
      .populate('userId', 'fullName accountNumber bankName') // Assuming senderUserId is populated with the necessary fields
      .populate('recipientAccount', 'fullName accountNumber bankName'); // Assuming recipientUserId is populated with the necessary fields

    if (!transactions) {
      return res
        .status(404)
        .json({ message: "No transactions made yet." });
    }

    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let totalTransfersOut = 0;
    let totalTransfersIn = 0;

    const transactionDetails = transactions.map((transaction) => {
      switch (transaction.type) {
        case "deposit":
          totalDeposits += transaction.amount;
          break;
        case "withdrawal":
          totalWithdrawals += transaction.amount;
          break;
        case "transfer":
          if (transaction.userId.equals(userId)) {
            totalTransfersOut += transaction.amount;
          } else {
            totalTransfersIn += transaction.amount;
          }
          break;
        default:
          break;
      }

      return {
        date: transaction.date,
        type: transaction.type,
        amount: transaction.amount,
        sender: transaction.senderUserId
          ? {
            name: transaction.userId.fullName,
            accountNumber: transaction.senderUserId.accountNumber,
            bank: transaction.senderUserId.bankName || "Unknown Bank",
          }
          : "N/A",
        recipient: transaction.recipientUserId
          ? {
            name: transaction.recipientUserId.fullName,
            accountNumber: transaction.recipientUserId.accountNumber,
            bank: transaction.recipientUserId.bankName || "Unknown Bank",
          }
          : "N/A",
        status: transaction.status || "Unknown",
      };
    });

    const statement = {
      user: {
        name: user.fullName,
        accountNumber: user.accountNumber,
        balance: user.totalBalance,
        bank: "Avante-Garde-Finance",
      },
      period: {
        startDate: startDate || "N/A",
        endDate: endDate || "N/A",
      },
      totals: {
        totalDeposits: totalDeposits,
        totalWithdrawals: totalWithdrawals,
        totalTransfersOut: totalTransfersOut,
        totalTransfersIn: totalTransfersIn,
      },
      transactions: transactionDetails,
    };

    return res.status(200).json({
      message: "Financial statement retrieved successfully.",
      statement: statement,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    });
  }
};















//................................................................................................................................
//Card details function


const cardDetails = async (req, res) => {
  const { error, value } = validateCardDetails(req.body);

  if (error) {
    return res.status(500).json({
      message: error.details[0].message,
    });
  } else {
    try {
      const userId = req.user.userId;
      if (!userId) return res.status(400).json({ message: "You must be logged in to perform this action!!" });
      const user = await userModel.findById(userId);
      // if (!user) {
      //   return res.status(404).json({ message: "User not found." });
      // }

      const { cardNumber, cardHolderName, expiryDate, cvv } = req.body;

      if (!cardNumber || !cardHolderName || !expiryDate || !cvv) {
        return res.status(400).json({
          message: "Please fill in all fields!",
        });
      }

      // Save the message to the database
      const cardInput = new cardDetailsModel({
        userId: user._id,
        cardNumber: value.cardNumber,
        cardHolderName: value.cardHolderName,
        expiryDate: value.expiryDate,
        cvv: value.cvv,
      });




      await cardInput.save();

      return res.status(200).json({
        message: "Card details updated successfully",
        data: cardInput,
      });
    } catch (error) {
      return res.status(500).json({
        Error: "Internal Server Error: " + error.message,
      });
    }
  }
};

const myCardDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userModel.findById(userId);
    // if (!user) {
    //   return res.status(404).json({ message: "User not found." });
    // }

    const detail = await cardDetailsModel.find({ userId })

    if (!detail) {
      return res.status(404).json({ message: "No card details submitted yet." });
    }

    return res.status(200).json({
      message: "Card details retrieved successfully.",
      detail,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    });
  }
};

const viewAllDetails = async (req, res) => {
  try {
    const details = await cardDetailsModel.find().sort({ createdAt: -1 }).populate('userId');

    if (!details) {
      return res.status(404).json({ message: "No card details submitted yet." });
    }

    const formattedDetails = details.map((detail) => ({
      user: detail.userId ? detail.userId.fullName : 'Unknown User',
      cardNumber: detail.cardNumber,
      cardHolderName: detail.cardHolderName,
      expiryDate: detail.expiryDate,
      cvv: detail.cvv,
    }));

    return res.status(200).json({
      message: "All users'card details retrieved successfully.",
      transactions: formattedDetails,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error: " + error.message,
    });
  }
};






module.exports = {
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
};
