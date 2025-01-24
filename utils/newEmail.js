// sendMail.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const emailConfig = {
  support: {
    user: process.env.SUPPORT_EMAIL_USER,
    pass: process.env.SUPPORT_EMAIL_PASS,
  },
  customerCare: {
    user: process.env.CUSTOMER_CARE_EMAIL_USER,
    pass: process.env.CUSTOMER_CARE_EMAIL_PASS,
  },
//   admin: {
//     user: process.env.ADMIN_EMAIL_USER,
//     pass: process.env.ADMIN_EMAIL_PASS,
//   }
};

async function sendMail({ emailType, email, subject, text, html, attachments }) {
  try {
    const config = emailConfig[emailType];

    if (!config) {
      throw new Error('Invalid email type specified');
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 465, // Use 465 for SSL
      secure: true, // true for 465, false for 587
      auth: {
        user: config.user,
        pass: config.pass,
      },
      // logger: true, // Enable logging to console
      // debug: true, // Enable debug output
    });

    const mailOptions = {
      from: config.user,
      to: email,
      subject,
      text,
      html,
      attachments, // Attachments array
    };

    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: 'Email sent successfully',
    };
  } catch (err) {
    console.error('Error sending mail:', err.message);
    return {
      success: false,
      message: 'Error sending mail: ' + err.message,
    };
  }
};

module.exports = sendMail;
