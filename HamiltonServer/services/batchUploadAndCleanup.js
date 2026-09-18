const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { promisify } = require('util');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const delay = promisify(setTimeout);

const uploadPdfToS3 = (pdfPath, key, invoiceNumber) => {
    return new Promise((resolve, reject) => {
        const fileStream = fs.createReadStream(pdfPath);
        fileStream.on('error', (error) => {
            reject(new Error(`Failed to read file: ${error.message}`));
        });

        fileStream.on('open', () => {
            console.log('File stream opened successfully.');
        });

        const uploadParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            Body: fileStream,
            ContentType: 'application/pdf',
            ContentDisposition: `attachment; filename="INV-#${invoiceNumber}.pdf"`,
        };

        s3Client.send(new PutObjectCommand(uploadParams))
            .then(() => {
                resolve(key);
            })
            .catch((err) => {
                if (err.$metadata && err.$metadata.httpStatusCode) {
                }
                reject(new Error(`Failed to upload PDF to S3: ${err.message}`));
            });
    });
};

const processAllInvoices = async () => {
    const invoicesDir = path.join(__dirname, '../invoices');
    const files = fs.readdirSync(invoicesDir);

    const pdfFiles = files.filter(file => file.endsWith('.pdf'));

    for (const file of pdfFiles) {
        const pdfPath = path.join(invoicesDir, file);
        const invoiceNumber = path.basename(file, '.pdf');

        try {
            await uploadPdfToS3(pdfPath, `invoices/${file}`, invoiceNumber);
            fs.unlinkSync(pdfPath);
        } catch (error) {
            console.error('Failed to process invoice:', invoiceNumber, error);
        }

        await delay(1000);
    }
};

module.exports = {
    processAllInvoices
};