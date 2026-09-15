const mongoose = require("mongoose");

const connectDatabase = () => {
    mongoose.set("strictQuery", false);

    mongoose
        .connect(process.env.MONGO_URI)
        .then((data) => {
            console.log(`MongoDb connected with server: ${data.connection.host}`);
        })
        .catch((err) => {
            console.log("MongoDB connection error:", err);
        });
};

module.exports = connectDatabase;