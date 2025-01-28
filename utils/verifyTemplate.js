const verifyEmail = (name, otp) => {

    return `



<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #FBFAFF;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid lightgrey;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            color: #ff4500;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            cursor: pointer;
        }
        .header a {
            text-decoration: none;
            color: #ff4500;
        }
        .header img {
            max-width: 100px;
        }
        .content {
            text-align: center;
        }
        .content h1 {
            color: #333;
        }
        .content p {
            color: #555;
        }
        .otp {
            font-size: 24px;
            font-weight: bold;
            margin: 20px 0;
        }
        .content a {
            text-decoration: none;
            color: #ffffff;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #ff4500;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            color: #888;
        }
        .footer a {
            color: #ff4500;
            text-decoration: none;
            margin: 0 10px;
        }
        .social-icons img {
            width: 24px;
            margin: 0 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
        <a href="https://skyline-savings.com/" >
            <h3>Skyline Saving Finance</h3>
        </a>
        </div>
        <div class="content">
            <h1>Please verify your email</h1>
            <p>Welcome On Board, ${name},</p>
            <p>Below is your One Time Password (OTP) to verify your account.</p>
            <div class="otp">${otp}</div>
            <a href="https://skyline-savings.com/#/otp" class="button">Click here to verify your account</a>
            <p>This email expires in 5 minutes.</p>
        </div>
        <div class="footer">
            <p>Contact Us | FAQ | About Us | Support</p>
            <div class="social-icons">
                <a href="https://twitter.com"><img src="https://res.cloudinary.com/dx6qmw7w9/image/upload/v1705725720/twitter-icon_fdawvi.png" alt="Twitter"></a>
                <a href="https://facebook.com"><img src="https://res.cloudinary.com/dx6qmw7w9/image/upload/v1705725721/350974_facebook_logo_icon_zoxrpw.png" alt="Facebook"></a>
                <a href="https://instagram.com"><img src="https://res.cloudinary.com/dx6qmw7w9/image/upload/v1705725721/Instagram-PNGinstagram-icon-png_yf4g2j.png" alt="Instagram"></a>
                <a href="https://pinterest.com"><img src="https://res.cloudinary.com/dx6qmw7w9/image/upload/v1705725720/pinterest-round-logo_lsfeqy.png" alt="Pinterest"></a>
            </div>
            <p>© Copyright ${new Date().getFullYear()}. All rights reserved. skyline Savings Finance.</p>
        </div>
    </div>
</body>
</html>


`
}


module.exports = verifyEmail