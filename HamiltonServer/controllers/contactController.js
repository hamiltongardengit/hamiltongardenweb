const Contact = require('../models/contactModel');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const sendEmail = require('../utils/nodemailer');

// Create a new contact message
exports.createContactMessage = catchAsyncErrors(async (req, res, next) => {
    const { name, email, subject, message } = req.body;

    // Create a new contact message
    const contactMessage = await Contact.create({ name, email, subject, message });

    // Prepare email details
    const emailTo = 'info@hamiltongardeninnsuites.com'; // Replace with your recipient email address
    const emailSubject = `Contact Form Submission: ${subject}`;
    const emailText = `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`;

    // Send email
    await sendEmail(emailTo, emailSubject, emailText);

    res.status(201).json({
        success: true,
        message: 'Your message has been sent successfully!',
        contactMessage
    });
});

// Retrieve all contact messages (for admin view)
exports.getAllContactMessages = catchAsyncErrors(async (req, res, next) => {
    const contactMessages = await Contact.find();

    res.status(200).json({
        success: true,
        contactMessages
    });
});