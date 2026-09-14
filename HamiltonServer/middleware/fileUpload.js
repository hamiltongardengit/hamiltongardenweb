const { upload } = require('../services/fileUploadService');

const uploadMiddleware = (folder) => (req, res, next) => {
    const uploader = upload(folder);
    uploader(req, res, (err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'File upload failed', error: err });
        }
        next();
    });
};

module.exports = uploadMiddleware;
