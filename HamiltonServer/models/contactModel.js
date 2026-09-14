// models/Contact.js
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    },
    subject: {
        type: String,
        required: [true, "Please enter a subject"],
    },
    message: {
        type: String,
        required: [true, "Please enter a message"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Contact', contactSchema);