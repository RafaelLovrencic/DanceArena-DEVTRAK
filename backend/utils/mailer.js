var nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendEmail({ to, subject, html }) {
    console.log(`Sending mail to: ${to}`);
    return transporter.sendMail({
        from: `"DEVTRAK App" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    });
}

module.exports = { sendEmail, transporter };