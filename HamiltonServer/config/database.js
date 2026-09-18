const mongoose = require("mongoose");

const connectDatabase = () => {
    mongoose.set("strictQuery", false);
    mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`).then((data) => {
        console.log(`MongoDb connected with server: ${data.connection.host} `);
    }).catch((err) => {
        console.log(err);
    });
}

module.exports = connectDatabase
