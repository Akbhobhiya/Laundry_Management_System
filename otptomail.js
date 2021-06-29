// require('dotenv').config();

const nodemailer = require('nodemailer');
const log = console.log;

// Step 1
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '', // TODO: your gmail account for example test@test.com
        pass: '' // TODO: your gmail password
    }
});

// Step 2
let mailOptions = {
    from: '', // TODO: email sender for example test@test.com
    to: '', // TODO: email receiver for example test@test.com
    subject: 'NITKL Login OTP',
    text: '' // TODO: text you want to send
};

// Step 3
transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
        return log('Error occurs');
    }
    return log('Email sent!!!');
});
