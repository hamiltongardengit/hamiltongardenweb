const mongoose = require("mongoose");
const validator = require("validator");

const membershipEnquirySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name."],
        maxlength: [50, "Name cannot exceed 50 characters."],
        minlength: [2, "Name should have more than 2 characters."],
    },
    mobile: {
        type: String,
        required: [true, "Please enter your mobile number."],
        validate: {
            validator: function (v) {
                return /^[6-9]\d{9}$/.test(v); // Validates Indian mobile numbers
            },
            message: "Please enter a valid mobile number.",
        },
    },
    email: {
        type: String,
        required: [true, "Please enter your email."],
        validate: [validator.isEmail, "Please enter a valid Email"],
    },
    currentCity: {
        type: String,
        required: [true, "Please enter your current city."],
        maxlength: [50, "City name cannot exceed 50 characters."],
    },
    age: {
        type: Number,
        required: [true, "Please enter your age."],
        min: [18, "Age must be at least 18 years."],
    },
    message: {
        type: String,
        maxlength: [500, "Message cannot exceed 500 characters."],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("MembershipEnquiry", membershipEnquirySchema);