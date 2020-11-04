// require('dotenv').config();

const nodemailer = require('nodemailer');
const log = console.log;

// Step 1
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'kumarsekumar12345@gmail.com', // TODO: your gmail account
        pass: 'kumarsekumar' // TODO: your gmail password
    }
});

// Step 2
let mailOptions = {
    from: 'kumarsekumar12345@gmail.com', // TODO: email sender
    to: 'akbhobhiya2000@gmail.com', // TODO: email receiver
    subject: 'NITKL Login OTP',
    text: 'Your otp is :: 123456'
};

// Step 3
transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
        return log('Error occurs');
    }
    return log('Email sent!!!');
});
