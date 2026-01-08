import nodemailer from 'nodemailer';
import config from './config.js';

const transporter = nodemailer.createTransport({
    host: 'smtpout.secureserver.net',
    port: 465,
    secure: true,
    auth: {
        user: config.email_user,
        pass: config.email_pass,
    },
});

export default transporter;
