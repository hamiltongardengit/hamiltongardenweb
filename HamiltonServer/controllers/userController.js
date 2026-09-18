const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const ApiFeatures = require("../utils/apiFeatures");
const sendEmail = require("../utils/nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const Usage = require('../models/userUsage');
const Destination = require('../models/destinationModel');
const { deleteFilesFromS3, uploadPdfS3 } = require('../services/fileUploadService');

// Register User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { firstname, lastname, email, contactNumber, password, role, address, city, state, zip, birthdate, anniversaryDate } =
        req.body;

    const createdBy = req.user ? req.user._id : null;

    const user = await User.create({
        firstname,
        lastname,
        email,
        contactNumber,
        password,
        role,
        address,
        city,
        state,
        zip,
        birthdate,
        anniversaryDate,
        avatar: {
            public_id: "avatar sample id",
            url: "avatar sample url",
        },
        createdBy,
    });

    sendToken(user, 201, res);
});

// Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Please Enter Email & Password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid Email or Password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid Email or Password", 401));
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000; // 5 minutes expiry
    await user.save({ validateBeforeSave: false });

    await sendEmail(
        user.email,
        "Login OTP",
        `Your Login OTP for Hamilton Garden Inn & Suites is: ${otp}`
    );

    res.status(200).json({
        success: true,
        message: "OTP sent successfully. Please verify to continue.",
        otp,
        userId: user._id,
    });
});

// Login Step 2: Verify OTP
exports.verifyOtp = catchAsyncErrors(async (req, res, next) => {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
        return next(new ErrorHandler("User ID and OTP required", 400));
    }

    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    if (!user.otp || user.otp !== otp || user.otpExpire < Date.now()) {
        return next(new ErrorHandler("Invalid or expired OTP", 400));
    }

    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save({ validateBeforeSave: false });

    // send JWT Token
    sendToken(user, 200, res);
});

// Logout user
exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Logged Out Successfully.",
    });
});

// Get All Users (Admin)
exports.getAllUsers = catchAsyncErrors(async (req, res) => {
    const resultPerPage = Number(req.body.pagesize) || 10; // Number of items per page
    const currentPage = Number(req.body.current_page) || 1; // Current page
    const countQuery = User.find({ 
        $and: [
            {
                $or: [
                    { role: { $in: ["user"] } },
                    { roles: { $in: ["user"] } }
                ]
            },
            {
                $or: [
                    { roles: { $exists: false } },
                    { roles: { $not: { $in: ["admin", "employee", "employee_view", "tbo_admin"] } } }
                ]
            }
        ]
    });
    
    const countFeatures = new ApiFeatures(countQuery, req.body).search().filter();
    const userCount = await countFeatures.query.countDocuments();

    const apiFeatures = new ApiFeatures(User.find({ 
        $and: [
            {
                $or: [
                    { role: { $in: ["user"] } },
                    { roles: { $in: ["user"] } }
                ]
            },
            {
                $or: [
                    { roles: { $exists: false } },
                    { roles: { $not: { $in: ["admin", "employee", "employee_view", "tbo_admin"] } } }
                ]
            }
        ]
    }), req.body)
        .search()
        .filter()
        .sort()
        .pagination(resultPerPage);

    const users = await apiFeatures.query;

    const total_pages = Math.ceil(userCount / resultPerPage); // Total pages calculation
    const first_page = 1; // First page is always 1
    const last_page = total_pages; // Last page equals total pages

    res.status(200).json({
        success: true,
        users,
        pagination: {
            current_page: currentPage,
            first_page,
            last_page,
            per_page: resultPerPage,
            total: userCount,
            total_pages
        }
    });
});

// Get User Detail
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    });
});

// Update User Password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect.", 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not match.", 400));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res);
});

// update User Profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    // Extract fields to update
    let { password, ...updateFields } = req.body;

    // Clean empty strings
    Object.keys(updateFields).forEach(key => {
        if (updateFields[key] === '') {
            delete updateFields[key];
        }
    });

    // Check if a new password is provided
    if (password) {
        // Hash the new password before updating
        updateFields.password = await bcrypt.hash(password, 10);
    }

    // Update user profile without affecting the password field if it's not included in the request
    const user = await User.findByIdAndUpdate(
        req.params.id,
        updateFields,
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    if (!user) {
        return next(new ErrorHandler("User Not Found.", 404));
    }

    res.status(200).json({
        success: true,
        user
    });
});

// Update User Role (Admin)
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
    const { role, roles } = req.body;
    const newUserData = {};
    
    if (role) newUserData.role = role;
    if (roles) newUserData.roles = roles;

    let user = await User.findById(req.params.id);

    if (!user) {
        return res.status(500).json({
            success: false,
            message: "User Not Found.",
        });
    }
    user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        useFindAndModify: false,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        user,
    });
});

// Delete User  (Admin)
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        return next(new ErrorHandler("User Not Found.", 404));
    }

    res.status(200).json({
        success: true,
        message: "User is Deleted Successfully.",
    });
});

// Forget Password
exports.forgetPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Get ResetPassword Token
    const resetToken = user.getResetPasswordToken();

    // Save user without validating schema fields
    await user.save({ validateBeforeSave: false });

    // Create password reset URL
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/auth/password/reset/${resetToken}`;


    const html = `
        <div style="text-align: center; width: 100vw; padding: 20px; background-color: #f4f4f4; font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <div style="padding: 20px; background-color: #4CAF50; color: white;">
                <h3 style="margin: 0;">${process.env.COMPANY_NAME} - Password Reset</h1>
            </div>
            <div style="padding: 20px;">
                <p style="font-size: 16px;">Hi ${user.firstname},</p>
                <p style="font-size: 16px;">We received a request to reset your password for your <strong>${process.env.COMPANY_NAME}</strong> account.</p>
                <p style="font-size: 16px;">Please click the button below to reset your password:</p>
                <a href="${resetPasswordUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">Reset Password</a>
                <p style="font-size: 16px; margin-top: 20px;">If you did not request this email, please ignore it.</p>
                <p style="font-size: 16px;">Best regards,</p>
                <p style="font-size: 16px;"><strong>${process.env.COMPANY_NAME}</strong> Team</p>
            </div>
            <div style="padding: 20px; background-color: #f4f4f4; color: #777; font-size: 14px;">
                <p style="margin: 0;">© ${new Date().getFullYear()} ${process.env.COMPANY_NAME}. All rights reserved.</p>
            </div>
            </div>
        </div>
    `;


    try {
        await sendEmail(user.email, 'Password Recovery', text = '', html);

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });
    } catch (error) {
        // In case email fails to send, remove the reset token and expiration
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler("Email could not be sent", 500));
    }
});

// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    // Create hashed token from the token in the URL
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }, // Token should not be expired
    });

    if (!user) {
        return next(
            new ErrorHandler(
                "Reset Password Token is invalid or has expired",
                400
            )
        );
    }

    // Check if password and confirm password match
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Passwords do not match", 400));
    }

    // Set new password and remove reset token and expiration
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // Save the updated user data
    await user.save();

    // Send a new JWT token to log the user in automatically after password reset
    sendToken(user, 200, res);
});


// Add New Usage Record
exports.addUsage = catchAsyncErrors(async (req, res, next) => {
    const { userId, destinationId, manualDestination, manualDestinationLocation, membership, startDate, endDate, totalDaysAllowed, daysUsed, daysLeft } = req.body;

    // Find the user to add usage record
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found."
        });
    }

    const createdBy = req.user ? req.user._id : null;

    // Calculate days used and days left
    const start = new Date(startDate);
    const end = new Date(endDate);
    // const daysUsed = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    // const daysLeft = totalDaysAllowed - daysUsed;

    // Create usage record
    const usage = await Usage.create({
        user: userId,
        destination: destinationId !== "Other" ? destinationId : null,  // Use destination if not "Other"
        manualDestination: destinationId === "Other" ? manualDestination : null,  // Store manual destination if "Other"
        manualDestinationLocation: destinationId === "Other" ? manualDestinationLocation : null,  // Store manual destination location if "Other"
        membership,
        startDate: start,
        endDate: end,
        daysUsed,
        totalDaysAllowed,
        daysLeft,
        createdBy,
    });

    // Push to user's usages array
    user.usages.push(usage._id);
    await user.save();

    res.status(201).json({
        success: true,
        message: "Usage record added successfully.",
        usage
    });
});

// Get All Usage Records for a User
exports.getUserUsage = catchAsyncErrors(async (req, res, next) => {
    const userId = req.body.userId;
    const resultPerPage = Number(req.body.pagesize) || 10; // Number of items per page
    const currentPage = Number(req.body.current_page) || 1; // Current page

    // Find the user by ID
    const user = await User.findById(userId).populate({
        path: 'usages',
        populate: {
            path: 'destination', // Populating destination inside each usage
            // model: 'Destination' // Reference to Destination model
            select: 'name location _id'   // Only select 'name', 'location' and '_id' fields
        }
    });

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found."
        });
    }

    // Sort the usages array by the 'createdAt' field in descending order
    const sortedUsages = user.usages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Total count of usage records
    const usageCount = sortedUsages.length;

    // Calculate total days used for each usage object
    const totalDaysUsed = sortedUsages.reduce((acc, usage) => acc + (usage.daysUsed || 0), 0);

    // Find the latest usage record
    const latestUsage = sortedUsages.length > 0 ? sortedUsages[0] : null;

    // Extract daysLeft and totalDaysAllowed from the latest record
    const latestDaysLeft = latestUsage ? latestUsage.daysLeft : 0;
    const latestTotalDaysAllowed = latestUsage ? latestUsage.totalDaysAllowed : 0;

    // Slice the sorted usages array for pagination
    const paginatedUsages = sortedUsages.slice(
        (currentPage - 1) * resultPerPage,
        currentPage * resultPerPage
    );

    // Prepare the paginated usages data, checking for manualDestination
    const usageRecords = paginatedUsages.map(usage => ({
        ...usage._doc,
        destinationName: usage.manualDestination || (usage.destination ? usage.destination.name : null), // Show manual destination if available
        destinationLocation: usage.manualDestinationLocation || (usage.destination ? usage.destination.location : null),  // Use manual destination location
    }));

    // Total pages calculation
    const total_pages = Math.ceil(usageCount / resultPerPage);

    // Fetch all destinations from the database
    const allDestinations = await Destination.find({}, 'name location _id');

    res.status(200).json({
        success: true,
        usageRecords,
        destinations: allDestinations,
        totalDaysUsed: totalDaysUsed || 0,
        latestDaysLeft: latestDaysLeft || 0,
        latestTotalDaysAllowed: latestTotalDaysAllowed || 0,
        pagination: {
            current_page: currentPage,
            per_page: resultPerPage,
            total: usageCount,
            total_pages
        }
    });
});

// Update Usage Record
exports.updateUsage = catchAsyncErrors(async (req, res, next) => {
    const userId = req.params.id;
    const { usageId, destinationId, manualDestination, manualDestinationLocation, startDate, endDate, totalDaysAllowed, daysUsed, daysLeft } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found."
        });
    }

    const usage = user.usages.find(usage => usage._id.toString() === usageId);
    if (!usage) {
        return res.status(404).json({
            success: false,
            message: "Usage record not found."
        });
    }

    await Usage.findByIdAndUpdate(usageId, {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        destination: destinationId !== "Other" ? destinationId : null,  // Use destination if not "Other"
        manualDestination: destinationId === "Other" ? manualDestination : null,  // Store manual destination if "Other"
        manualDestinationLocation: destinationId === "Other" ? manualDestinationLocation : null,  // Store manual destination if "Other"
        totalDaysAllowed,
        daysUsed,
        daysLeft
    }, { new: true });


    res.status(200).json({
        success: true,
        message: "Usage record updated successfully.",
        usage
    });
});

// Delete Usage Record
exports.deleteUsage = catchAsyncErrors(async (req, res, next) => {
    const { userId, usageId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found."
        });
    }

    // Check if the usage record exists
    const usageIndex = user.usages.findIndex(usage => usage._id.toString() === usageId);
    if (usageIndex === -1) {
        return res.status(404).json({
            success: false,
            message: "Usage record not found."
        });
    }

    user.usages.splice(usageIndex, 1);
    await user.save();

    res.status(200).json({
        success: true,
        message: "Usage record deleted successfully."
    });
});

// Upload Agreement
exports.uploadAgreement = catchAsyncErrors(async (req, res, next) => {
    uploadPdfS3(req, res, async function (err) {
        if (err) {
            console.error('Upload Error:', err);
            return next(new ErrorHandler('Failed to upload agreement', 500));
        }

        try {
            const user = await User.findById(req.body.userId);
            if (!user) {
                return next(new ErrorHandler('User not found', 404));
            }

            // Store the agreement details
            user.agreement = {
                public_id: req.file.key,
                url: req.file.location,
                uploadedAt: Date.now()
            };

            await user.save();

            res.status(200).json({
                success: true,
                message: 'Agreement uploaded successfully',
                agreement: user.agreement
            });
        } catch (error) {
            console.error('User Agreement Upload Error:', error);
            return next(new ErrorHandler('Failed to upload agreement', 500));
        }
    });
});

// Function to delete an agreement
exports.deleteAgreement = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.userId);
    if (!user || !user.agreement || !user.agreement.public_id) {
        return next(new ErrorHandler('Agreement not found for this user', 404));
    }

    try {
        await deleteFilesFromS3([{ Key: user.agreement.public_id }]);

        // Remove agreement details from user document
        user.agreement.public_id = undefined;
        user.agreement.url = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Agreement deleted successfully',
        });
    } catch (error) {
        console.error('Agreement Deletion Error:', error);
        return next(new ErrorHandler('Failed to delete agreement', 500));
    }
});

// Function to accept agreement
exports.acceptAgreement = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.userId);
    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }
    user.agreementAccepted = true;
    user.agreementAcceptedAt = Date.now();
    await user.save();
    res.status(200).json({
        success: true,
        message: 'Agreement accepted successfully',
    });
});

// Create Employee (Admin only)
exports.createEmployee = catchAsyncErrors(async (req, res, next) => {
    const {
        firstname, lastname, email, contactNumber, password,
        address, city, state, zip, birthdate, anniversaryDate,
        employmentType, designation, department, salaryStructure, commissionRate, role
    } = req.body;

    const createdBy = req.user ? req.user._id : null;

    const employee = await User.create({
        firstname,
        lastname,
        email,
        contactNumber,
        password,
        role: role || "employee", // default employee
        address,
        city,
        state,
        zip,
        birthdate,
        anniversaryDate,
        employmentType,
        designation,
        department,
        salaryStructure,
        commissionRate,
        createdBy,
        avatar: {
            public_id: "avatar sample id",
            url: "avatar sample url",
        }
    });

    res.status(201).json({
        success: true,
        employee
    });
});
// Get All Employees (Admin)
exports.getAllEmployees = catchAsyncErrors(async (req, res, next) => {
    const resultPerPage = Number(req.body.pagesize) || 10;
    const currentPage = Number(req.body.current_page) || 1;

    const countQuery = User.find({ 
        $and: [
            {
                $or: [
                    { role: { $in: ["employee", "employee_view"] } },
                    { roles: { $in: ["employee", "employee_view", "tbo_admin"] } }
                ]
            },
            {
                $or: [
                    { roles: { $exists: false } },
                    { roles: { $not: { $in: ["user"] } } }
                ]
            }
        ]
    });
    
    const countFeatures = new ApiFeatures(countQuery, req.body).search().filter();
    const employeeCount = await countFeatures.query.countDocuments();

    const apiFeatures = new ApiFeatures(
        User.find({ 
            $and: [
                {
                    $or: [
                        { role: { $in: ["employee", "employee_view"] } },
                        { roles: { $in: ["employee", "employee_view", "tbo_admin"] } }
                    ]
                },
                {
                    $or: [
                        { roles: { $exists: false } },
                        { roles: { $not: { $in: ["user"] } } }
                    ]
                }
            ]
        })
            .select("-password -resetPasswordToken -resetPasswordExpire -usages")
            .populate("linkedCustomers", "firstname lastname email contactNumber"),
        req.body
    )
        .search()
        .filter()
        .sort()
        .pagination(resultPerPage);

    const employees = await apiFeatures.query;

    const total_pages = Math.ceil(employeeCount / resultPerPage);

    res.status(200).json({
        success: true,
        employees,
        pagination: {
            current_page: currentPage,
            per_page: resultPerPage,
            total: employeeCount,
            total_pages
        }
    });
});
// Update Employee (Admin)
exports.updateEmployee = catchAsyncErrors(async (req, res, next) => {
    const employee = await User.findById(req.params.id);

    if (!employee || !employee.roles?.some(r => ["employee", "employee_view", "tbo_admin"].includes(r))) {
        return next(new ErrorHandler("Employee not found", 404));
    }

    const updateFields = { ...req.body };

    const updatedEmployee = await User.findByIdAndUpdate(
        req.params.id,
        updateFields,
        { new: true, runValidators: true, useFindAndModify: false }
    );

    res.status(200).json({
        success: true,
        employee: updatedEmployee
    });
});
// Delete Employee (Admin)
exports.deleteEmployee = catchAsyncErrors(async (req, res, next) => {
    const employee = await User.findById(req.params.id);

    if (!employee || !["employee", "employee_view", "tbo_admin"].includes(employee.role)) {
        return next(new ErrorHandler("Employee not found", 404));
    }

    await employee.deleteOne();

    res.status(200).json({
        success: true,
        message: "Employee deleted successfully"
    });
});
// Assign Customers to Employee (Admin)
exports.assignCustomersToEmployee = catchAsyncErrors(async (req, res, next) => {
    const { employeeId, customerIds } = req.body;

    const employee = await User.findById(employeeId);
    if (!employee || !["employee"].includes(employee.role)) {
        return next(new ErrorHandler("Employee not found", 404));
    }

    // Add customer references to employee
    employee.linkedCustomers = customerIds;
    await employee.save();

    // Update assignedEmployee field for each customer
    await User.updateMany(
        { _id: { $in: customerIds } },
        { assignedEmployee: employeeId }
    );

    res.status(200).json({
        success: true,
        message: "Customers assigned to employee successfully",
        employee
    });
});




