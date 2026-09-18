const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client, DeleteObjectsCommand } = require('@aws-sdk/client-s3');
const ErrorHandler = require('../utils/errorhandler');

const s3Client = new S3Client({ region: process.env.AWS_REGION });

const uploadImagesS3 = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.S3_BUCKET_NAME,
    key: function (req, file, cb) {
      cb(null, `destinations/${Date.now().toString()}_${file.originalname}`);
    }
  }),
}).array('images', 10);

const uploadPdfS3 = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, `user_docs/${Date.now().toString()}_${file.originalname}`);
    }
  }),
}).single('document');

const deleteFilesFromS3 = async (fileKeys) => {
  const deleteParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Delete: {
      Objects: fileKeys.map(file => ({ Key: file.Key })),
    }
  };

  try {
    const data = await s3Client.send(new DeleteObjectsCommand(deleteParams));

  } catch (error) {
    console.error('Error deleting files from S3:', error);
    throw new ErrorHandler('Failed to delete files from S3', 500);
  }
};

const getFileUrls = (files) => {
  return files.map(file => ({
    public_id: file.key,
    url: file.location,
  }));
};

module.exports = {
  uploadImagesS3,
  uploadPdfS3,
  deleteFilesFromS3,
  getFileUrls,
};