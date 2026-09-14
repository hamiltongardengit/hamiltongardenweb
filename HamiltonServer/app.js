const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const cors = require('cors');


const errorMiddleware = require("./middleware/error");

// Define the allowed origins
const allowedOrigins = [
];

// CORS Options
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error(`CORS Error: Origin ${origin} not allowed.`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};

// Enable CORS middleware globally
app.use(cors(corsOptions));

// Explicitly handle preflight requests
app.options('*', cors(corsOptions));



app.use(express.json());
app.use(cookieParser());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

//Route Imports
const user = require("./routes/userRoute");
const destination = require("./routes/destinationRoute");
const contact = require("./routes/contactRoute");
const invoice = require("./routes/invoiceRoute");
const membershipEnquiry = require("./routes/membershipEnquiryRoute");
const membershipBooking = require("./routes/membershipBookingRoute");

app.use("/api/v1", user);
app.use("/api/v1", destination);
app.use("/api/v1", contact);
app.use("/api/v1", invoice);
app.use("/api/v1", membershipEnquiry);
app.use("/api/v1", membershipBooking);

// Middleware for Errors (putting below bcuz it's not working above, and that above not working this below)
app.use(errorMiddleware);


module.exports = app;
