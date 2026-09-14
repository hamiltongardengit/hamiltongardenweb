const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoicePDF = (invoice, filePath) => {
    createInvoice(invoice, filePath)
    const doc = new PDFDocument({ margin: 50 });

    // Pipe the PDF into a write stream
    doc.pipe(fs.createWriteStream(filePath));

    // Add Background Image with low opacity
    const bgImagePath = path.join(__dirname, '../assets/bg-logo.jpg'); // Adjust path as necessary
    doc.image(bgImagePath, -20, 10, {
        fit: [doc.page.width, doc.page.height], // Scale the image to fit the page
        align: 'center',
        valign: 'center',
        opacity: 0.1 // Set low opacity for the background image
    });

    // Add Logo
    const logoPath = path.join(__dirname, '../assets/logo.png'); // Adjust path as necessary
    const logoWidth = 75;
    const logoYPosition = 15; // Adjust this value to position the logo higher or lower

    // Move cursor to desired position for logo
    doc.y = logoYPosition;

    doc.image(logoPath, { width: logoWidth, align: 'center' });
    doc.x = 470
    doc.image(logoPath, { width: logoWidth, align: 'right' });

    doc.x = 50
    doc.y = 40;
    // Add Title
    doc.font('Helvetica-Bold').fontSize(20).text('HAMILTON GARDEN INN & SUITES', { align: 'center' });
    doc.font('Helvetica-Bold').fontSize(20).text('Invoice Details', { align: 'center' });

    doc.moveDown(5);

    // Add Invoice Details
    // Add From and To Sections
    const leftColumnX = 50; // X coordinate for the left-aligned text
    const rightColumnX = 300; // X coordinate for the right-aligned text

    doc.font('Helvetica-Bold').fontSize(12);
    doc.text(`Invoice No.: HGIS/${invoice.invoiceNumber}`, leftColumnX, 145);
    doc.text(`Invoice Date: ${invoice.invoiceDate.toDateString()}`, rightColumnX, 145);

    // "From" Section (Left-aligned)
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text(`From:`, leftColumnX, 170);
    doc.font('Helvetica')
    doc.text(`HAMILTONGARDEN INN & SUITES`, leftColumnX, 190);
    doc.text(`THIRD FLOOR, 269, RAMA HOUSE - 269,`, leftColumnX, 210);
    doc.text(`Goyal Gift Selection, Masjid Moth Village,`, leftColumnX, 230);
    doc.text(`New Delhi, South Delhi, Delhi, 110049`, leftColumnX, 250);
    doc.text(`GSTIN NO. : 07AAJCG2167N1Z6`, leftColumnX, 270);
    doc.moveDown(2);

    // "To" Section (Right-aligned)
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text(`To:`, rightColumnX, 170);
    doc.font('Helvetica')
    // doc.text(`Name: ${invoice.customer.name}`, rightColumnX, 190);
    // doc.text(`Email: ${invoice.customer.email}`, rightColumnX, 210);
    // doc.text(`Mobile: ${invoice.customer.contactNumber}`, rightColumnX, 230);
    // doc.text(`Membership No.: ${invoice.customer.membershipNumber}`, rightColumnX, 250);
    // doc.text(`Address: ${invoice.customer.address}`, rightColumnX, 270);
    doc.text(`${invoice.customer.name}`, rightColumnX, 190);
    doc.text(`${invoice.customer.email}`, rightColumnX, 210);
    doc.text(`${invoice.customer.contactNumber}`, rightColumnX, 230);
    doc.text(`Membership No.: HGIS/${invoice.customer.membershipNumber}`, rightColumnX, 250);
    doc.text(`${invoice.customer.address}`, rightColumnX, 270);
    doc.moveDown(2);


    // Add Table Header
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text(`Items:`, leftColumnX, 310);
    doc.font('Helvetica')
    doc.moveDown();
    doc.fontSize(12);

    const tableTop = doc.y;
    const itemMargin = 5;
    const itemHeight = 30;

    // Define table columns
    const columns = {
        service: { width: 200 },
        quantity: { width: 50 },
        price: { width: 70 },
        tax: { width: 70 },
        subtotal: { width: 70 }
    };

    // Header Row
    doc.font('Helvetica-Bold')
        .text('Service', 50, tableTop)
        .text('Quantity', 240, tableTop)
        .text('Price', 300, tableTop)
        .text(`Tax(${invoice.taxRate}%)`, 380, tableTop) // Use dynamic tax rate
        .text('Subtotal', 450, tableTop);

    // Draw horizontal line
    doc.moveTo(40, tableTop + itemHeight - itemMargin)
        .lineTo(560, tableTop + itemHeight - itemMargin)
        .stroke();

    // Reset font to normal
    doc.font('Helvetica');

    // Add Item Rows
    invoice.items.forEach((item, index) => {
        const y = tableTop + (index + 1) * itemHeight;

        doc.text(item.service, 50, y, { width: columns.service.width })
            .text(item.quantity.toString(), 240, y)
            .text(formatNumberWithCommas(item.price.toFixed(2)), 300, y)
            .text(item.taxAmount.toFixed(2), 380, y)
            .text(formatNumberWithCommas(item.subtotal.toFixed(2)), 450, y);

        // Draw horizontal line for each row
        if (index < invoice.items.length - 1) {
            doc.moveTo(40, y + itemHeight + index - 5)
                .lineTo(560, y + itemHeight + index - 5)
                .stroke();
        }
    });

    // Add Totals and Additional Info
    const totalsYPosition = tableTop + (invoice.items.length + 2) * itemHeight + 10;
    const totals = [
        { label: 'Subtotal:', value: formatNumberWithCommas(invoice.subtotal.toFixed(2)) },
        { label: ('Taxes' + `(${ invoice.taxRate }%):`), value: formatNumberWithCommas(invoice.totalTaxAmount.toFixed(2)) },
        { label: 'Discounts:', value: formatNumberWithCommas(invoice.discountAmount.toFixed(2)) },
        { label: 'Total Amount:', value: formatNumberWithCommas(invoice.totalAmount.toFixed(2)) },
        { label: 'Paid Amount:', value: formatNumberWithCommas(invoice.paidAmount.toFixed(2)) },
        { label: 'Payment Status:', value: invoice.paymentStatus }
    ];

    doc.moveDown().font('Helvetica-Bold').fontSize(12);

    // Define column widths
    const labelWidth = 200;
    const valueWidth = 150;
    const padding = 5;

    // Add totals with aligned columns
    totals.forEach((item, index) => {
        const y = totalsYPosition + (index * 23);
        doc.text(item.label, 50, totalsYPosition + (index * 25), { width: labelWidth, align: 'right' })
            .text(item.value, 50 + labelWidth, totalsYPosition + (index * 25), { width: valueWidth, align: 'right' });
        doc.moveDown(2)
        if (index < totals.length - 1) {
            doc.moveTo(125, y + 15 + padding)
                .lineTo(450, y + 15 + padding)
                .stroke();
        }
        doc.moveTo(287, totalsYPosition - 10)
            .lineTo(287, totalsYPosition + 140)
            .stroke();
    });

    // Draw border around the totals section
    const totalsHeight = (totals.length + (invoice.notes ? 1 : 0)) * 20 + 10;
    doc.rect(125, totalsYPosition - 10, 175 + valueWidth, totalsHeight)
        .stroke();


    doc.moveDown(5).fontSize(12);

    // Draw the final border for the entire document
    doc.rect(40, tableTop - 10, 520, (invoice.items.length + 1) * itemHeight)
        .stroke();

    // Notes Section
    // Calculate Y position for the Notes section
    const pageHeight = doc.page.height;
    const bottomMargin = 70; // Adjust this as needed
    const notesYPosition = pageHeight - bottomMargin;


    doc.font('Helvetica')
    // if (invoice.notes) {
    //     doc.text(`Notes: ${invoice.notes}`, 50, notesYPosition);
    // }
    // doc.fillColor('#FF5733');
    doc.moveTo(40, notesYPosition - 60)
        .lineTo(560, notesYPosition - 60)
        .stroke();
    doc.text(`Payment is due within 30 days from date of invoice. Late payment is subject to fees of 5% per month.`, 50, notesYPosition - 55, { align: 'center'});
    doc.moveTo(40, notesYPosition - 25)
        .lineTo(560, notesYPosition - 25)
        .stroke();
    doc.text(`Thanks for choosing Hamilton Garden Inn & Suites | hamiltongardeninnsuites@gmail.com`, 50, notesYPosition);

    doc.end();
};

// const generateInvoicePDF = (invoice, filePath) => {
//     createInvoice(invoice, filePath)
// }
// function createInvoice(invoice, path) {
//     let doc = new PDFDocument({ size: "A4", margin: 50 });

//     generateHeader(doc);
//     generateCustomerInformation(doc, invoice);
//     generateInvoiceTable(doc, invoice);
//     generateFooter(doc);

//     doc.end();
//     doc.pipe(fs.createWriteStream(path));
// }

// function generateHeader(doc) {
//     const logoPath = path.join(__dirname, '../assets/logo.png');
//     doc
//         .image(logoPath, 40, 15, { width: 75 })
//         .fillColor("#444444")
//         .fontSize(20)
//         .font("Helvetica-Bold")
//         .text("Hamilton Garden", 115, 45)
//         .fontSize(12)
//         .text("Inn & Suites", 117, 65)
//         .font("Helvetica")
//         .fontSize(10)
//         .text("HAMILTONGARDEN INN & SUITES", 200, 45, { align: "right" })
//         .text("THIRD FLOOR, 269, RAMA HOUSE - 269", 200, 60, { align: "right" })
//         .text("Goyal Gift Selection, Masjid Moth Village", 200, 75, { align: "right" })
//         .text("New Delhi, South Delhi, Delhi, 110049", 200, 90, { align: "right" })
//         .text("GSTIN NO. : 07AAJCG2167N1Z6", 200, 105, { align: "right" })
//         .moveDown();
// }

// function generateCustomerInformation(doc, invoice) {
//     doc
//         .fillColor("#444444")
//         .font("Helvetica-Bold")
//         .fontSize(20)
//         .text("Invoice", 50, 160);

//     generateHr(doc, 185);

//     const customerInformationTop = 200;

//     doc
//         .fontSize(10)
//         .font("Helvetica")
//         .text("Invoice Number:", 50, customerInformationTop)
//         .font("Helvetica-Bold")
//         .text(invoice.invoice_nr, 150, customerInformationTop)
//         .font("Helvetica")
//         .text("Invoice Date:", 50, customerInformationTop + 15)
//         .text(formatDate(new Date()), 150, customerInformationTop + 15)
//         .text("Balance Due:", 50, customerInformationTop + 30)
//         .text(
//             formatCurrency(invoice.subtotal - invoice.paid),
//             150,
//             customerInformationTop + 30
//         )

//         .font("Helvetica-Bold")
//         .text(invoice.in, 300, customerInformationTop)
//         .font("Helvetica")
//         .text(invoice.address, 300, customerInformationTop + 15)
//         // .text(
//         //     invoice.shipping.city +
//         //     ", " +
//         //     invoice.shipping.state +
//         //     ", " +
//         //     invoice.shipping.country,
//         //     300,
//         //     customerInformationTop + 30
//         // )k
//         .moveDown();

//     generateHr(doc, 252);
// }

// function generateInvoiceTable(doc, invoice) {
//     let i;
//     const invoiceTableTop = 330;

//     doc.font("Helvetica-Bold");
//     generateTableRow(
//         doc,
//         invoiceTableTop,
//         "Item",
//         "Description",
//         "Unit Cost",
//         "Quantity",
//         "Line Total"
//     );
//     generateHr(doc, invoiceTableTop + 20);
//     doc.font("Helvetica");

//     for (i = 0; i < invoice.items.length; i++) {
//         const item = invoice.items[i];
//         const position = invoiceTableTop + (i + 1) * 30;
//         generateTableRow(
//             doc,
//             position,
//             item.item,
//             item.description,
//             formatCurrency(item.amount / item.quantity),
//             item.quantity,
//             formatCurrency(item.amount)
//         );

//         generateHr(doc, position + 20);
//     }

//     const subtotalPosition = invoiceTableTop + (i + 1) * 30;
//     generateTableRow(
//         doc,
//         subtotalPosition,
//         "",
//         "",
//         "Subtotal",
//         "",
//         formatCurrency(invoice.subtotal)
//     );

//     const paidToDatePosition = subtotalPosition + 20;
//     generateTableRow(
//         doc,
//         paidToDatePosition,
//         "",
//         "",
//         "Paid To Date",
//         "",
//         formatCurrency(invoice.paid)
//     );

//     const duePosition = paidToDatePosition + 25;
//     doc.font("Helvetica-Bold");
//     generateTableRow(
//         doc,
//         duePosition,
//         "",
//         "",
//         "Balance Due",
//         "",
//         formatCurrency(invoice.subtotal - invoice.paid)
//     );
//     doc.font("Helvetica");
// }

// function generateFooter(doc) {
//     doc
//         .fontSize(10)
//         .text(
//             "Payment is due within 15 days. Thank you for your business.",
//             50,
//             780,
//             { align: "center", width: 500 }
//         );
// }

// function generateTableRow(
//     doc,
//     y,
//     item,
//     description,
//     unitCost,
//     quantity,
//     lineTotal
// ) {
//     doc
//         .fontSize(10)
//         .text(item, 50, y)
//         .text(description, 150, y)
//         .text(unitCost, 280, y, { width: 90, align: "right" })
//         .text(quantity, 370, y, { width: 90, align: "right" })
//         .text(lineTotal, 0, y, { align: "right" });
// }

// function generateHr(doc, y) {
//     doc
//         .strokeColor("#aaaaaa")
//         .lineWidth(1)
//         .moveTo(50, y)
//         .lineTo(550, y)
//         .stroke();
// }

// function formatCurrency(cents) {
//     return "Rs " + (cents / 100).toFixed(2);
// }

// function formatDate(date) {
//     const day = date.getDate();
//     const month = date.getMonth() + 1;
//     const year = date.getFullYear();

//     return year + "/" + month + "/" + day;
// }

// Helper function to format numbers with commas
const formatNumberWithCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

module.exports = generateInvoicePDF;