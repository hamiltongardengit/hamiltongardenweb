// Config
const dotenv = require("dotenv");
// dotenv.config({ path: "./config/config.env" });
const envFile = `./config/config.${process.env.NODE_ENV || 'dev'}.env`;
dotenv.config({ path: envFile });
const app = require('./app');
const connectDatabase = require("./config/database");

// Handling Uncaught Exception  (like a varibale is not declared but used in the code i.e., console.log(youtube))
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Uncaught Exception`);
    server.close(() => {
        process.exit(1);
    });
})

// Connecting to Database 
connectDatabase();


app.listen(process.env.PORT, () => {
    console.log(`Server is working on http://localhost:${process.env.PORT}`);
})


// Unhandled Promise Rejection
process.on("unhandledRejection", err => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to the Unhandled Promise Rejection`);

    server.close(() => {
        process.exit(1);
    });
}) 