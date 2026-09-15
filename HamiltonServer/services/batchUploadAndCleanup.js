const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const puppeteer = require('puppeteer');

const {
    S3Client,
    PutObjectCommand,
} = require('@aws-sdk/client-s3');

const Invoice = require('../models/invoiceModel');
const FormattingUtils = require('../utils/formattingUtils');

// --------------------------------------------------
// AWS S3 Client
// --------------------------------------------------

const s3 = new S3Client({
    region: process.env.AWS_REGION,
});

// --------------------------------------------------
// Process all invoices
// --------------------------------------------------

const processAllInvoices = async () => {
    console.log('Starting invoice batch processing...');

    // Get invoices that don't have a PDF yet
    const invoices = await Invoice.find({
        $or: [
            { pdfDetails: { $exists: false } },
            { 'pdfDetails.public_id': { $exists: false } },
            { 'pdfDetails.public_id': null },
            { 'pdfDetails.public_id': '' },
        ],
    });

    console.log(`Found ${invoices.length} invoices to process.`);

    if (invoices.length === 0) {
        return {
            processed: 0,
            message: 'No invoices require processing.',
        };
    }

    const invoicesDirectory = path.join(__dirname, '../invoices');

    // Make sure local invoice directory exists
    if (!fs.existsSync(invoicesDirectory)) {
        fs.mkdirSync(invoicesDirectory, { recursive: true });
    }

    let processed = 0;
    let failed = 0;

    for (const invoice of invoices) {
        let pdfPath = null;

        try {
            console.log(
                `Processing invoice ${invoice.invoiceNumber}...`
            );

            // --------------------------------------------------
            // Render invoice HTML
            // --------------------------------------------------

            const templatePath = path.join(
                __dirname,
                '../views/invoice.ejs'
            );

            const logoPath = path.join(
                __dirname,
                '../assets/logo.png'
            );

            const logoBase64 = fs
                .readFileSync(logoPath)
                .toString('base64');

            const logoData = `data:image/png;base64,${logoBase64}`;

            const utils = new FormattingUtils();

            const formattedDate =
                utils.formatDateWithDay(invoice.invoiceDate);

            const templateData = {
                invoice,
                logoPath: logoData,
                formattedDate,
            };

            const htmlContent = await ejs.renderFile(
                templatePath,
                templateData
            );

            // --------------------------------------------------
            // Generate PDF
            // --------------------------------------------------

            pdfPath = path.join(
                invoicesDirectory,
                `${invoice.invoiceNumber}.pdf`
            );

            const browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                ],
            });

            try {
                const page = await browser.newPage();

                await page.setContent(htmlContent, {
                    waitUntil: 'networkidle0',
                });

                await page.pdf({
                    path: pdfPath,
                    format: 'A4',
                    timeout: 120000,
                });
            } finally {
                await browser.close();
            }

            console.log(
                `PDF generated: ${pdfPath}`
            );

            // --------------------------------------------------
            // Upload PDF to S3
            // --------------------------------------------------

            const pdfKey =
                `invoices/${invoice.invoiceNumber}.pdf`;

            const pdfBuffer = fs.readFileSync(pdfPath);

            await s3.send(
                new PutObjectCommand({
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: pdfKey,
                    Body: pdfBuffer,
                    ContentType: 'application/pdf',
                })
            );

            console.log(
                `PDF uploaded to S3: ${pdfKey}`
            );

            // --------------------------------------------------
            // Update invoice database
            // --------------------------------------------------

            invoice.pdfDetails = {
                url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${pdfKey}`,
                public_id: pdfKey,
                uploadedAt: Date.now(),
            };

            await invoice.save();

            processed++;

            // --------------------------------------------------
            // Remove temporary local PDF
            // --------------------------------------------------

            if (fs.existsSync(pdfPath)) {
                fs.unlinkSync(pdfPath);
            }

            console.log(
                `Invoice ${invoice.invoiceNumber} processed successfully.`
            );

        } catch (error) {
            failed++;

            console.error(
                `Failed to process invoice ${invoice.invoiceNumber}:`,
                error.message
            );

            // Clean up local PDF if something failed
            if (pdfPath && fs.existsSync(pdfPath)) {
                try {
                    fs.unlinkSync(pdfPath);
                } catch (cleanupError) {
                    console.error(
                        'PDF cleanup failed:',
                        cleanupError.message
                    );
                }
            }
        }
    }

    console.log(
        `Invoice batch completed. Processed: ${processed}, Failed: ${failed}`
    );

    return {
        processed,
        failed,
        total: invoices.length,
    };
};

module.exports = {
    processAllInvoices,
};