const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, "Please enter your firstname."],
        maxlength: [20, "Firstname cannot exceed 20 characters."],
        minlength: [2, "Firstname should have more than 2 characters."],
    },
    lastname: {
        type: String,
        required: [true, "Please enter your lastname."],
        maxlength: [30, "Lastname cannot exceed 30 characters."],
        minlength: [2, "Lastname should have more than 2 characters."],
    },
    email: {
        type: String,
        required: [true, "Please enter your Email."],
        unique: true,
        validate: [validator.isEmail, "Please enter a valid Email"]
    },
    contactNumber: {
        type: String,
        required: [true, 'Contact number is required.'],
    },
    password: {
        type: String,
        required: [true, "Please enter your password."],
        minlength: [8, "Password should have more than 8 characters."],
        select: false,
    },
    address: {
        type: String,
        required: [true, "Please enter your address."],
        maxlength: [100, "Address cannot exceed 100 characters."],
        minlength: [2, "Address should have more than 2 characters."],
    },
    city: {
        type: String,
        required: [true, "Please enter your city."],
    },
    state: {
        type: String,
    },
    zip: {
        type: Number,
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    role: {
        type: [String],
        enum: {
            values: ['user', 'admin', 'employee', 'employee view'],
            message: 'Role must be either User, Admin, or Employee.'
        },
        default: ['user']
    },
    roles: {
        type: [String],
        enum: ['user', 'admin', 'employee', 'employee_view', "tbo_admin", "temp_admin", "super_admin"],
        default: ['user']
    },
    usages: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "Usage",  // Reference to the Usage model
        },
    ],
    agreement: {
        public_id: {
            type: String,
            required: false,
        },
        url: {
            type: String,
            required: false,
        },
        uploadedAt: {
            type: Date,
            default: Date.now,
        }
    },
    birthdate: {
        type: Date,
        required: true,
    },
    anniversaryDate: {
        type: Date,
    },
    // Employee Specific Fields
    dateOfJoining: {
        type: Date,
    },
    status: {
        type: String,
        enum: ["Active", "Inactive", "Terminated", "On-Leave"],
        default: "Active",
      },
    employmentType: {
        type: String,
        enum: ["Salary", "Commission"],
        default: "Salary",
    },
    designation: {
        type: String,
        maxlength: [50, "Designation cannot exceed 50 characters."],
    },
    department: {
        type: String,
        maxlength: [50, "Department cannot exceed 50 characters."],
    },
    salaryStructure: {
        type: Number, // monthly salary (if applicable)
        default: 0,
    },
    commissionRate: {
        type: Number, // percentage (if applicable)
        default: 0,
    },
    linkedCustomers: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "User", // link customers to this employee
        }
    ],
    // Customer Specific Fields
    assignedEmployee: {
        type: mongoose.Schema.ObjectId,
        ref: "User", // which employee is assigned
    },    
    membershipExpiryDate: {
        type: Date, // for membership reminder system
    },
    visaApplications: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "VisaApplication", // separate collection for visa applications
        }
    ],
    agreementAccepted: {
        type: Boolean,
        default: false,
    },
    agreementAcceptedAt: {
        type: Date,
    },    
    otp: String,
    otpExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // Reference to the User who created this user
        // required: true
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

// Password Hash before saving it
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// JWT Token
userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Compare Password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generating Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
    // Generating Token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hashing and adding resetPasswordToken to userSchema
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
};
userSchema.index({ birthdate: 1, anniversaryDate: 1 });

module.exports = mongoose.model("User", userSchema);