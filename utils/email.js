const nodemailer = require("nodemailer");
require("dotenv").config();

async function sendMail(options) {
  try {
    // const transporter = nodemailer.createTransport({
    //     service: process.env.SERVICE,
    //     auth: {
    //         user: process.env.USER,
    //         pass: process.env.PASS,
    //     }
    // })
    const transporter = nodemailer.createTransport({
      host: process.env.SERVICE, // Use `host` instead of `service`
      port: process.env.PORT, // Use port 465 for SSL
      secure: true,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS
      }
    });
    const mailOption = {
      from: process.env.USER,
      to: options.email,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments 
    };

    await transporter.sendMail(mailOption);
    // console.log("Sending Email:", {from,to,subject});

    return {
      success: true,
      message: "Email sent successfully"
    };
  } catch (err) {
    console.error("Error sending mail:", err.message);
    return {
      success: false,
      message: "Error sending mail: " + err.message
    };
  }
}

module.exports = sendMail;
