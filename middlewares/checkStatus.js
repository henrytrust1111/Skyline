const userModel = require('../models/userModel');




exports.accountStatus = async (req, res, next) => {
    const accountNumber = req.body.accountNumber;
    const phoneNumber = req.body.phoneNumber;

    let user = await userModel.findOne({ accountNumber: accountNumber });
    if (!user) {
        user = await userModel.findOne({ phoneNumber: phoneNumber });
    }
    // if (!user) return res.status(404).json({ message: 'User not found' });

    const accountStatus = user?.accountStatus;

    if (accountStatus === 'active') {
        next(); // allow the request to proceed
    } else if (accountStatus === 'inactive') {
        if (req.url === '/loginA') {
            setTimeout(() => {
               res.status(403).json({ message: "Account Dormant/inactive, you won't be able to make transfers." });
            }, 2500);
            next(); // allow login
        } else if (req.url === '/transfer') {
            return res.status(403).json({ message: 'Transfers are not allowed for Dormant/inactive accounts' });
        } else {
            next(); // allow access to other dashboard pages
        }
    } else if (accountStatus === 'disabled') {
        return res.status(403).json({ message: 'Account has been disabled due to security reasons, we detected a different IP address and location.' });
    } else if (accountStatus === 'closed') {
        return res.status(404).json({ message: 'Account no longer exists.' });
    } else {
        return res.status(500).json({ message: 'Unknown account status' });
    }
};
