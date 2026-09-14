const MembershipBooking = require("../models/membershipBookingModel");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const sendEmail = require('../utils/nodemailer');

// Create Membership Booking
exports.createMembershipBooking = catchAsyncErrors(async (req, res, next) => {
    const { name, email, mobile, address, currentCity, age, membership, message } = req.body;

    const booking = await MembershipBooking.create({
        name,
        email,
        mobile,
        address,
        currentCity,
        age,
        membership,
        message,
    });

    // Prepare email details
    const emailTo = 'info@hamiltongardeninnsuites.com'; // Replace with your recipient email address
    const emailSubject = `Package Booking from ${name}`;
    const emailText = `
        A new package booking form has been submitted:
        
        Name: ${name}
        Email: ${email}
        Mobile: ${mobile}
        Address: ${address}
        Current City: ${currentCity}
        Age: ${age}
        Package: ${membership}
        Message: ${message || 'No additional message provided.'}
    `;

    // Send email
    await sendEmail(emailTo, emailSubject, emailText);

    res.status(201).json({
        success: true,
        message: 'Your membership booking has been submitted successfully!',
        data: booking,
    });
});

// Get All Membership Enquiries (Admin)
exports.getAllMembershipBuyList = catchAsyncErrors(async (req, res) => {
    const resultPerPage = Number(req.body.pagesize) || 10;
    const currentPage = Number(req.body.current_page) || 1;
    const bookingCount = await MembershipBooking.countDocuments();

    const apiFeatures = new ApiFeatures(MembershipBooking.find(), req.body)
        .search()
        .filter()
        .sort()
        .pagination(resultPerPage);

    const bookings = await apiFeatures.query;

    const total_pages = Math.ceil(bookingCount / resultPerPage);
    const first_page = 1;
    const last_page = total_pages;

    res.status(200).json({
        success: true,
        bookings,
        pagination: {
            current_page: currentPage,
            first_page,
            last_page,
            per_page: resultPerPage,
            total: bookingCount,
            total_pages,
        },
    });
});