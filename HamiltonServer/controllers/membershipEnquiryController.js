const MembershipEnquiry = require("../models/membershipEnquiryModel");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const sendEmail = require('../utils/nodemailer');

// Create Membership Enquiry
exports.createMembershipEnquiry = catchAsyncErrors(async (req, res, next) => {
    const { name, email, mobile, currentCity, age, message } = req.body;

    const enquiry = await MembershipEnquiry.create({
        name,
        email,
        mobile,
        currentCity,
        age,
        message,
    });

    // Prepare email details
    const emailTo = 'info@hamiltongardeninnsuites.com'; // Replace with your recipient email address
    const emailSubject = `Package Enquiry from ${name}`;
    const emailText = `
        A new package enquiry has been submitted:
        
        Name: ${name}
        Email: ${email}
        Mobile: ${mobile}
        Current City: ${currentCity}
        Age: ${age}
        Message: ${message || 'No additional message provided.'}
    `;

    // Send email
    await sendEmail(emailTo, emailSubject, emailText);

    res.status(201).json({
        success: true,
        message: 'Your membership enquiry has been submitted successfully!',
        data: enquiry,
    });
});

// Get All Membership Enquiries (Admin)
exports.getAllMembershipEnquiries = catchAsyncErrors(async (req, res) => {
    const resultPerPage = Number(req.body.pagesize) || 10;
    const currentPage = Number(req.body.current_page) || 1;
    const enquiryCount = await MembershipEnquiry.countDocuments();

    const apiFeatures = new ApiFeatures(MembershipEnquiry.find(), req.body)
        .search()
        .filter()
        .sort()
        .pagination(resultPerPage);

    const enquiries = await apiFeatures.query;

    const total_pages = Math.ceil(enquiryCount / resultPerPage);
    const first_page = 1;
    const last_page = total_pages;

    res.status(200).json({
        success: true,
        enquiries,
        pagination: {
            current_page: currentPage,
            first_page,
            last_page,
            per_page: resultPerPage,
            total: enquiryCount,
            total_pages,
        },
    });
});