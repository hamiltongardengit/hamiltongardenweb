const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    // const { token } = req.cookies;       // using cookie
    const token = req.headers.authorization;  
    
    if (!token) {
        return next(new ErrorHandler("Please Login to access this resource", 401));
    }

    // const decodedData = jwt.verify(token, process.env.JWT_SECRET);      // using cookie
    const decodedData = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);

    if (!req.user) {
        throw new ErrorHandler("User not found", 404);
    }

    next();
});

exports.authorizedRoles = (...roles) => {
    return (req, res, next) => {
        // const role = req.user.role;     // using cookie
        const role = req.headers['role'];
        if (!roles.includes(role)) {
            return next( new ErrorHandler(`Role: ${role} is not allowed to access this resource.`, 403));
        }
        next();
    }
}