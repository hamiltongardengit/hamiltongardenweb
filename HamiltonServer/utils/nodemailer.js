const nodemailer = require('nodemailer');

// Create a transporter object with your email service
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify SMTP configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP Configuration Error:', error);
    } else {
        console.log('SMTP Server is ready to take our messages');
    }
});

// Send email function
const sendEmail = async (to, subject, text,html) => {
    const mailOptions = {
        from: process.env.EMAIL_USER, // Replace with your email address
        to,
        subject,
        text,
        html: html,  // Send HTML content
    };
    

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = sendEmail;
