const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendMail(options) {
    try {
        const transporter = nodemailer.createTransport({
            service: process.env.SERVICE,
            auth: {
                user: process.env.USER, 
                pass: process.env.PASS,
            }
        })
            const mailOption = {
              from: process.env.USER,
              to: options.email,
              subject: options.subject,
              text: options.text,
              html: options.html,
              attachments: options.attachments // Attachments array
            };
        
            await transporter.sendMail(mailOption);   
            return {
                success: true,
                message: 'Email sent successfully',
            }
    } catch (err) {
        console.error('Error sending mail:', err.message);
        return {
            success: false,
            message: 'Error sending mail: ' + err.message,
        };
    }
}

module.exports = sendMail;