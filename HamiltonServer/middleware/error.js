const errorHandler = require("../utils/errorhandler");

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error.";


    // Wrong MongoDb ID Error (Cast Errors)
    if (err.name === "CastError") {
        const message = `Resource Not Found. Invalid: ${err.path}`;
        err = new errorHandler(message, 404);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered. Please use a unique ${Object.keys(err.keyValue)}.`;
        err = new errorHandler(message, 409);
    }

    // Wrong JWT error
    if (err.name === "JsonWebTokenError") {
        const message = `Json Web Token is invalid, Try again `;
        err = new errorHandler(message, 401);
    }

    // JWT EXPIRE error
    if (err.name === "TokenExpiredError") {
        const message = `Json Web Token is Expired, Try again `;
        err = new errorHandler(message, 401);
    }

    // Forbidden Error
    if (err.name === "ForbiddenError") {
        const message = `You do not have permission to perform this action.`;
        err = new errorHandler(message, 403); // 403 - Forbidden
    }

    // Rate Limiting Error (If applicable)
    if (err.name === "RateLimitError") {
        const message = `Too many requests, please try again later.`;
        err = new errorHandler(message, 429); // 429 - Too Many Requests
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        // errorStack: err.stack
    })
}