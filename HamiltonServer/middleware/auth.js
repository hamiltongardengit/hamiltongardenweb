const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { permissions } = require("./permissions");


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

exports.authorizedRoles = (...allowedRoles) => {
    return (req, res, next) => {
        const userRoles = req.user.roles || [];

        // Check if user has any matching role
        const hasRole = userRoles.some(role => allowedRoles.includes(role));

        if (!hasRole) {
            return next(new ErrorHandler("Access denied", 403));
        }

        next();
    };
};

exports.checkPermission = (action) => {
    return (req, res, next) => {
        const userRoles = (req.user.roles || []).map(r => r.toLowerCase()); // normalize to lowercase

        let allowedActions = [];
        userRoles.forEach(role => {
            if (permissions[role]) {
                allowedActions = [...allowedActions, ...permissions[role].api];
            }
        });

        if (allowedActions.includes("*")) return next();

        if (!allowedActions.includes(action)) {
            return next(new ErrorHandler(`You do not have permission for ${action}`, 403));
        }

        next();
    };
};

