const multer = require('multer');
const multerS3 = require('multer-s3');
const {
  S3Client,
  DeleteObjectsCommand,
} = require('@aws-sdk/client-s3');

// --------------------------------------------------
// AWS S3 Client
// --------------------------------------------------
// On EC2, credentials should come from the EC2 IAM Role.
// Do NOT hard-code AWS access keys here.
const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

// --------------------------------------------------
// Common file name generator
// --------------------------------------------------
const generateKey = (folder, originalName) => {
  const safeFileName = originalName
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '');

  return `${folder}/${Date.now()}-${safeFileName}`;
};

// --------------------------------------------------
// File filter
// --------------------------------------------------
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

// --------------------------------------------------
// Generic upload
// Used by middleware/fileUpload.js
// --------------------------------------------------
const upload = (folder = 'uploads') => {
  const uploadMiddleware = multer({
    storage: multerS3({
      s3,
      bucket: process.env.S3_BUCKET_NAME,
      contentType: multerS3.AUTO_CONTENT_TYPE,

      key: (req, file, cb) => {
        cb(null, generateKey(folder, file.originalname));
      },
    }),

    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB
    },

    fileFilter,
  });

  return uploadMiddleware.single('file');
};

// --------------------------------------------------
// Upload destination images
// Frontend sends field name: "images"
// Multiple files
// --------------------------------------------------
const uploadImagesS3 = (req, res, callback) => {
  const uploadMiddleware = multer({
    storage: multerS3({
      s3,
      bucket: process.env.S3_BUCKET_NAME,
      contentType: multerS3.AUTO_CONTENT_TYPE,

      key: (req, file, cb) => {
        cb(null, generateKey('destinations', file.originalname));
      },
    }),

    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB per file
      files: 20,
    },

    fileFilter,
  }).array('images', 20);

  uploadMiddleware(req, res, callback);
};

// --------------------------------------------------
// Upload agreement PDF
// Frontend sends field name: "document"
// Single file
// --------------------------------------------------
const uploadPdfS3 = (req, res, callback) => {
  const uploadMiddleware = multer({
    storage: multerS3({
      s3,
      bucket: process.env.S3_BUCKET_NAME,
      contentType: multerS3.AUTO_CONTENT_TYPE,

      key: (req, file, cb) => {
        cb(null, generateKey('agreements', file.originalname));
      },
    }),

    limits: {
      fileSize: 10 * 1024 * 1024,
    },

    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed for agreements'), false);
      }
    },
  }).single('document');

  uploadMiddleware(req, res, callback);
};

// --------------------------------------------------
// Convert uploaded S3 files to DB-friendly objects
// --------------------------------------------------
const getFileUrls = (files = []) => {
  return files.map((file) => ({
    public_id: file.key,
    url: file.location,
  }));
};

// --------------------------------------------------
// Delete files from S3
// Expected input:
// [{ Key: 'destinations/example.jpg' }]
// --------------------------------------------------
const deleteFilesFromS3 = async (files = []) => {
  if (!files || files.length === 0) {
    return;
  }

  const validFiles = files.filter(
    (file) => file && file.Key
  );

  if (validFiles.length === 0) {
    return;
  }

  const command = new DeleteObjectsCommand({
    Bucket: process.env.S3_BUCKET_NAME,

    Delete: {
      Objects: validFiles,
      Quiet: true,
    },
  });

  return await s3.send(command);
};

// --------------------------------------------------
// Exports
// --------------------------------------------------
module.exports = {
  upload,
  uploadImagesS3,
  uploadPdfS3,
  getFileUrls,
  deleteFilesFromS3,
};