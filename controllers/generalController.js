const nodemailer = require('nodemailer');
const crypto = require('crypto');

exports.generateUniqueCode = (length = 5) => {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
};

exports.sendEmail = ({ to, subject, htmlContent }) => {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: 'webdevcoursework79@gmail.com',
                pass: 'zlgs dddm ypkf syjp'
            }
        });
        const mailDetails = {
            from: 'webdevcoursework79@gmail.com',
            to: to,
            subject: subject,
            html: htmlContent
        };
        transporter.sendMail(mailDetails, (err, info) => {
            if (err) {
                console.log('An error occurred...', err);
                reject(err);
            } else {
                console.log('Email Sent: Success');
                resolve(info);
            }
        });
    });
};
