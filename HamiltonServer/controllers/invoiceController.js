const Invoice = require('../models/invoiceModel');
const path = require('path');
const fs = require('fs');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const ApiFeatures = require("../utils/apiFeatures");
const FormattingUtils = require('../utils/formattingUtils');
const { deleteFilesFromS3 } = require('../services/fileUploadService');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { processAllInvoices } = require('../services/batchUploadAndCleanup');
const sendEmail = require("../utils/nodemailer");

// Create Invoice
exports.createInvoice = catchAsyncErrors(async (req, res, next) => {
    const invoice = new Invoice(req.body);
    await invoice.save();

    try {
        // Generate and upload PDF
        let pdfKey = `invoices/${invoice.invoiceNumber}.pdf`;
        generateAndUploadPDF(invoice);
        invoice.pdfDetails = {
            url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${pdfKey}`,
            public_id: pdfKey,
            uploadedAt: Date.now(),
        };
        
        await invoice.save();
        res.status(201).json({ success: true, invoice });
    } catch (error) {
        console.error('Error in creating invoice:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


// Get all Invoices
exports.getInvoices = catchAsyncErrors(async (req, res) => {
    const resultPerPage = Number(req.body.pagesize) || 10; // Number of items per page
    const currentPage = Number(req.body.current_page) || 1; // Current page
    const invoiceCount = await Invoice.countDocuments(); // Total number of documents

    const apiFeatures = new ApiFeatures(Invoice.find(), req.body)
        .search()
        .filter()
        .sort()
        .pagination(resultPerPage);

    const invoices = await apiFeatures.query;

    const total_pages = Math.ceil(invoiceCount / resultPerPage); // Total pages calculation
    const first_page = 1; // First page is always 1
    const last_page = total_pages; // Last page equals total pages

    res.status(200).json({
        success: true,
        invoices,
        pagination: {
            current_page: currentPage,
            first_page,
            last_page,
            per_page: resultPerPage,
            total: invoiceCount,
            total_pages
        }
    });
});

// Get Invoice by ID
exports.getInvoiceById = catchAsyncErrors(async (req, res, next) => {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    res.status(200).json({ success: true, invoice });
});

// Update Invoice
exports.updateInvoice = catchAsyncErrors(async (req, res, next) => {
    // Find the invoice by ID
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Save the old PDF key for deletion
    const oldPdfKey = invoice.pdfDetails ? invoice.pdfDetails.public_id : null;

    // Update invoice fields with new data from request
    Object.assign(invoice, req.body);

    // Generate and upload the new PDF
    const pdfKey = `invoices/${invoice.invoiceNumber}.pdf`;
    try {
        generateAndUploadPDF(invoice);

        // Check if the pdfKey is returned correctly
        if (!pdfKey) {
            return next(new Error('PDF generation failed'));
        }

        // Delete the old PDF from S3 if it exists
        if (oldPdfKey) {
            await deleteFilesFromS3([{ Key: oldPdfKey }]);
        }

        // Update the invoice with the new PDF details
        invoice.pdfDetails = {
            url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${pdfKey}`,
            public_id: pdfKey,
            uploadedAt: Date.now(),
        };

        // Save the updated invoice with new PDF details
        await invoice.save();

        res.status(200).json({ success: true, invoice });
    } catch (error) {
        console.error('Error in updating invoice:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Delete Invoice
exports.deleteInvoice = catchAsyncErrors(async (req, res, next) => {
    // Find the invoice by ID
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    // Save the old PDF key for deletion
    const oldPdfKey = invoice.pdfDetails ? invoice.pdfDetails.public_id : null;

    //and delete the PDF from S3
    if (oldPdfKey) {
        try {
            await deleteFilesFromS3([{ Key: oldPdfKey }]);
        } catch (err) {
            console.error(`Error deleting old PDF from S3: ${err.message}`);
        }
    }

    // Remove pdfDetails from the invoice
    invoice.pdfDetails = null;

    // Save the updated invoice document
    await invoice.save();

    // Delete the invoice document
    await Invoice.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, message: 'Invoice deleted successfully' });
});

// Simplified version for debugging
const generateAndUploadPDF = async (invoice) => {
    console.log('Generating PDF for invoice:', invoice.invoiceNumber);
    const pdfPath = path.join(__dirname, '../invoices', `${invoice.invoiceNumber}.pdf`);

    try {
        // Render HTML template using EJS
        const templatePath = path.join(__dirname, '../views/invoice.ejs');
        const logoBase64 = fs.readFileSync(path.join(__dirname, '../assets/logo.png')).toString('base64');
        const logoPath = `data:image/png;base64,${logoBase64}`;
        const utils = new FormattingUtils();
        const formattedDate = utils.formatDateWithDay(invoice.invoiceDate);

        const templateData = {
            invoice,
            logoPath,
            formattedDate,
        };
        const htmlContent = await ejs.renderFile(templatePath, templateData);

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        // Create a new page
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        try {
            await page.pdf({ path: pdfPath, format: 'A4', timeout: 120000 });
            console.log('PDF generated successfully at:', pdfPath);
        } catch (pdfError) {
            console.error('Error during PDF generation:', pdfError.message);
            throw new Error('PDF generation failed');
        }

        await browser.close();
        return pdfPath;

    } catch (error) {
        console.error('Error during PDF generation:', error.message);
        throw new Error('PDF generation failed');
    }
};

const CSVExportUtils = require('../utils/csvExportUtils');
const moment = require('moment'); // For date formatting

// Export Invoices to CSV (All Invoices or invoiceId-Specific)
exports.exportInvoicesToCSV = catchAsyncErrors(async (req, res, next) => {
    try {
        // Extract the userId query parameter
        const { invoiceId } = req.query;

        // Filter invoices if invoiceId is provided
        let query = {};
        if (invoiceId) {
            query['_id'] = invoiceId; // Filter by invoiceId (assuming customer has a invoiceId field)
        }

        // Fetch invoices based on the query (all or filtered by invoiceId)
        const invoices = await Invoice.find(query);

        // Define the CSV fields to export
        const fields = [
            { label: 'Invoice Number', value: 'invoiceNumber' },
            { label: 'Customer Name', value: 'customer.name' },
            { label: 'Customer Email', value: 'customer.email' },
            {
                label: 'Invoice Date',
                value: (row) => moment(row.invoiceDate).format('DD-MMM-YYYY') // Format the date
            },
            { label: 'Subtotal', value: 'subtotal' },
            { label: 'Tax Rate', value: 'taxRate' },
            { label: 'Total Tax Amount', value: 'totalTaxAmount' },
            { label: 'Discount Amount', value: 'discountAmount' },
            { label: 'Total Amount', value: 'totalAmount' },
            { label: 'Payment Status', value: 'paymentStatus' },
        ];

        // Export the invoices to CSV
        CSVExportUtils.exportToCSV(invoices, fields, 'invoices.csv', res);
    } catch (error) {
        console.error('Error exporting invoices:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Send Membership Expiry Reminders
exports.sendExpiryReminders = catchAsyncErrors(async (req, res, next) => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    // Find memberships expiring within next 7 days
    const expiringMemberships = await Invoice.find({
        "membership.expiryDate": { $gte: today, $lte: nextWeek },
        "membership.renewalStatus": "Active"
    });

    for (const invoice of expiringMemberships) {
        const { email, name } = invoice.customer;

        await sendEmail({
            email,
            subject: "Membership Expiry Reminder",
            message: `Hi ${name}, your membership (No. ${invoice.membershipNumber}) is expiring on ${invoice.membership.expiryDate.toDateString()}. Please renew on time to continue enjoying benefits.`,
        });

        invoice.membership.remindersSent.push({
            reminderDate: today,
            type: "Email",
        });

        await invoice.save({ validateBeforeSave: false });
    }

    res.status(200).json({
        success: true,
        count: expiringMemberships.length,
        message: "Reminders sent successfully",
    });
});

// Get Expiring Memberships (date-wise, latest first)
exports.getAllInvoicesByLatestExpiry = catchAsyncErrors(async (req, res, next) => {
    const resultPerPage = Number(req.body.pagesize) || 10; // Items per page
    const currentPage = Number(req.body.current_page) || 1; // Current page

    // Filter invoices with expiryDate present
    const filter = { "membership.expiryDate": { $exists: true } };

    // Count total filtered invoices
    const invoiceCount = await Invoice.countDocuments(filter);

    // Query invoices, sorted by expiryDate (latest first)
    const apiFeatures = new ApiFeatures(
        Invoice.find(filter)
            .sort({ "membership.expiryDate": 1 }) // Descending
            .select("membership membershipNumber customer invoiceNumber invoiceType"),
        req.body
    ).search()
    .filter()
    .pagination(resultPerPage);

    const invoices = await apiFeatures.query;

    const total_pages = Math.ceil(invoiceCount / resultPerPage);

    res.status(200).json({
        success: true,
        invoices,
        pagination: {
            current_page: currentPage,
            first_page: 1,
            last_page: total_pages,
            per_page: resultPerPage,
            total: invoiceCount,
            total_pages
        }
    });
});


