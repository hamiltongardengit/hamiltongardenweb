const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    destinationId: {
        type: mongoose.Schema.ObjectId,
        ref: "Destination",
        required: true,
    },
    createdBy: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    approveFlag: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const destinationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter destination name'],
        trim: true,
    },
    location: {
        type: String,
        required: [true, 'Please enter destination location'],
    },
    description: {
        type: String,
        required: [true, 'Please enter destination description'],
    },
    images: [
        {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
        },
    ],
    category: {
        type: String,
        required: [true, 'Please enter destination category'],
        enum: {
            values: ['Domestic', 'International'],
            message: 'Category is either: Domestic or International'
        }
    },
    numOfReviews: {
        type: Number,
        default: 0,
    },
    reviews: [reviewSchema],
    ratings: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // Reference to the User who created this
    },
});

module.exports = mongoose.model('Destination', destinationSchema);
