const mongoose = require("mongoose");

const usageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    destination: {
        type: mongoose.Schema.ObjectId,
        ref: "Destination",
    },
    manualDestination: {
    type: String,  // Manually entered destination
    },
    manualDestinationLocation: {
    type: String,  // Manually entered destination
    },
    membership: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    daysUsed: {
        type: Number,
        required: true,
        default: 0,
    },
    totalDaysAllowed: {
        type: Number,
        required: true,
    },
    daysLeft: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
});

module.exports = mongoose.model("Usage", usageSchema);
