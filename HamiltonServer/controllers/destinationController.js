const Destination = require('../models/destinationModel');
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const mongoose = require('mongoose');
const { uploadImagesS3, deleteFilesFromS3, getFileUrls } = require('../services/fileUploadService');


// Get All Destinations
exports.getAllDestinations = catchAsyncErrors(async (req, res, next) => {
    const resultPerPage = Number(req.body.pagesize) || 10; // Number of items per page
    const currentPage = Number(req.body.current_page) || 1; // Current page
    const categoryFilter = req.body.category; // Category filter from request, if any
    const locationFilter = req.body.location; // Location filter from request, if any

    // Get all unique locations based on the category filter
    const locationQuery = {};
    if (categoryFilter && categoryFilter.trim() !== '') {
        locationQuery.category = categoryFilter;
    }

    const uniqueLocations = await Destination.distinct('location', locationQuery);

    // Prepare the base query for fetching destinations
    const queryConditions = {};

    // Apply filters
    if (categoryFilter === '') {
        delete req.body.category;
    }

    if (locationFilter === '') {
        delete req.body.location;
    }

    const baseQuery = Destination.find(queryConditions);

    // Apply search, filter, and pagination using ApiFeatures
    const apiFeatures = new ApiFeatures(baseQuery, req.body)
        .search()
        .filter()
        .sort()
        .pagination(resultPerPage);


    // Get paginated destinations
    const destinations = await apiFeatures.query;


    // Step 3: Aggregation pipeline to get counts
    const countAggregationPipeline = [
        {
            $match: queryConditions // Use the same conditions for aggregation
        },
        {
            $facet: {
                total: [
                    { $match: categoryFilter ? { category: categoryFilter } : {} },
                    { $match: locationFilter ? { location: locationFilter } : {} },
                    { $count: "count" }
                ],
                domesticCount: [
                    { $match: categoryFilter ? { category: categoryFilter, category: 'domestic' } : { category: 'domestic' } },
                    { $match: locationFilter ? { location: locationFilter } : {} },
                    { $count: "count" }
                ],
                internationalCount: [
                    { $match: categoryFilter ? { category: categoryFilter, category: 'international' } : { category: 'international' } },
                    { $match: locationFilter ? { location: locationFilter } : {} },
                    { $count: "count" }
                ],
                locationCounts: [
                    { $group: { _id: "$location" } },
                    { $project: { location: "$_id", _id: 0 } }
                ]
            }
        },
        {
            $project: {
                total: { $arrayElemAt: ['$total.count', 0] },
                domesticCount: { $arrayElemAt: ['$domesticCount.count', 0] },
                internationalCount: { $arrayElemAt: ['$internationalCount.count', 0] }
            }
        }
    ];

    // Perform aggregation to get counts
    const [aggregationResult] = await Destination.aggregate(countAggregationPipeline);


    // Default values to avoid undefined issues
    const total = aggregationResult.total || 0;
    const domesticCount = aggregationResult.domesticCount || 0;
    const internationalCount = aggregationResult.internationalCount || 0;

    const total_pages = Math.ceil(total / resultPerPage);

    res.status(200).json({
        success: true,
        destinations,
        locations: uniqueLocations, // Return all unique locations before filtering
        pagination: {
            filteredDestinationsCount: destinations.length,
            current_page: currentPage,
            first_page: 1,
            last_page: total_pages,
            per_page: resultPerPage,
            total: total,
            total_pages,
            domesticCount,
            internationalCount
        }
    });
});

// Get Destination Details
exports.getDestinationDetails = catchAsyncErrors(async (req, res, next) => {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
        return next(new ErrorHandler("Destination not found", 404));
    }

    res.status(200).json({
        success: true,
        destination,
    });
});

// Create New Destination
exports.createDestination = catchAsyncErrors(async (req, res, next) => {
    uploadImagesS3(req, res, async function (err) {
        if (err) {
            console.error('Upload Error:', err);
            return next(new ErrorHandler('Failed to upload images', 500));
        }

        try {
            const imageUrls = getFileUrls(req.files);
            const destination = await Destination.create({
                ...req.body,
                images: imageUrls
            });

            res.status(201).json({
                success: true,
                destination,
            });
        } catch (error) {
            console.error('Destination Creation Error:', error);
            return next(new ErrorHandler('Failed to create destination', 500));
        }
    });
});

// Update Destination with Image Handling
exports.updateDestination = catchAsyncErrors(async (req, res, next) => {
    let destination = await Destination.findById(req.params.id);

    if (!destination) {
        return next(new ErrorHandler("Destination not found", 404));
    }

    uploadImagesS3(req, res, async function (err) {
        if (err) {
            console.error('Upload Error:', err);
            return next(new ErrorHandler('Failed to upload images', 500));
        }

        try {
            // Handle new images
            if (req.files && req.files.length > 0) {
                const newImageUrls = getFileUrls(req.files);
                destination.images = [...destination.images, ...newImageUrls];
            }

            // Handle removed images
            if (req.body.removedImages) {
                const removedImages = JSON.parse(req.body.removedImages);
                const remainingImages = destination.images.filter(image => !removedImages.includes(image.public_id));
                await deleteFilesFromS3(removedImages.map(image => ({ Key: image })));

                destination.images = remainingImages;
            }

            destination = await Destination.findByIdAndUpdate(req.params.id, {
                images: destination.images,
                ...req.body
            }, {
                new: true,
                runValidators: true,
                useFindAndModify: false,
            });

            res.status(200).json({
                success: true,
                destination,
            });
        } catch (error) {
            console.error('Destination Update Error:', error);
            return next(new ErrorHandler('Failed to update destination', 500));
        }
    });
});

// Delete Destination with Image Handling
exports.deleteDestination = catchAsyncErrors(async (req, res, next) => {
    const destinationId = req.params.id;
    const destination = await Destination.findById(destinationId);

    if (!destination) {
        return next(new ErrorHandler("Destination not found", 404));
    }

    // Delete all images associated with the destination from S3
    if (destination.images && destination.images.length > 0) {
        await deleteFilesFromS3(destination.images.map(image => ({ Key: image.public_id })));
    }

    await Destination.findByIdAndDelete(destinationId);

    res.status(200).json({
        success: true,
        message: "Destination deleted successfully",
    });
});


// Create New Review or Update the review
exports.createOrUpdateReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment } = req.body;

    // Explicitly create an ObjectId instance using 'new' keyword
    const destinationId = new mongoose.Types.ObjectId(req.params.id);

    const review = {
        user: req.user._id,
        destinationId: destinationId, // Use the explicitly converted ObjectId
        createdBy: `${req.user.firstname} ${req.user.lastname}`,
        rating: Number(rating),
        comment,
        status: 'pending', // Set initial status to 'pending' for new reviews
    };

    const destination = await Destination.findById(destinationId);

    if (!destination) {
        return next(new ErrorHandler('Destination not found', 404));
    }

    const isReviewed = destination.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (isReviewed) {
        destination.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString()) {
                rev.rating = rating;
                rev.comment = comment;
                rev.status = 'pending'; // Reset status for updated reviews
            }
        });
    } else {
        destination.reviews.push(review);
        destination.numOfReviews = destination.reviews.length;
    }

    const numOfReviews = destination.reviews.filter(
        (rev) => rev.status === 'approved'
    ).length;

    destination.ratings =
        numOfReviews > 0
            ? destination.reviews
                .filter((rev) => rev.status === 'approved')
                .reduce((acc, item) => item.rating + acc, 0) / numOfReviews
            : 0;

    await destination.save({ validateBeforeSave: true });

    res.status(200).json({
        success: true,
        message: 'Review submitted',
    });
});

// Update Review status - Admin
exports.updateReviewStatus = catchAsyncErrors(async (req, res, next) => {
    const { reviewId, destinationId, status } = req.body;

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
        return next(new ErrorHandler('Invalid status', 400));
    }

    // Find the destination and the specific review
    const destination = await Destination.findById(destinationId);

    if (!destination) {
        return next(new ErrorHandler('Destination not found', 404));
    }

    const review = destination.reviews.id(reviewId);

    if (!review) {
        return next(new ErrorHandler('Review not found', 404));
    }

    // Update the review status
    review.status = status;

    // Recalculate ratings based only on approved reviews
    const approvedReviews = destination.reviews.filter(
        rev => rev.status === 'approved'
    );

    const numOfReviews = approvedReviews.length;

    destination.ratings =
        numOfReviews > 0
            ? approvedReviews.reduce((acc, item) => item.rating + acc, 0) /
            numOfReviews
            : 0;

    destination.numOfReviews = numOfReviews;

    await destination.save();

    res.status(200).json({
        success: true,
        message: `Review ${status} successfully`,
    });
});

// View Reviews by Status - Admin
exports.getReviewsByStatus = catchAsyncErrors(async (req, res, next) => {
    const { status, current_page, pagesize, keyword } = req.body;
    const resultPerPage = Number(pagesize) || 10;
    const currentPage = Number(current_page) || 1;

    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
        return next(new ErrorHandler('Invalid status', 400));
    }

    // Base query for destinations with reviews of specific status
    let baseQuery = Destination.find({ 'reviews.status': status });

    // Use ApiFeatures for search and filter
    const apiFeatures = new ApiFeatures(baseQuery, req.body).search();

    // Execute the query and select the required fields
    const destinations = await apiFeatures.query.select('name location reviews');

    // Flatten the array of reviews from multiple destinations and add destination details
    const reviews = destinations.reduce((acc, destination) => {
        const filteredReviews = destination.reviews
            .filter(rev => rev.status === status)
            .map(rev => ({
                ...rev.toObject(), // Convert review to plain object
                destinationName: destination.name,
                destinationLocation: destination.location
            }));
        return acc.concat(filteredReviews);
    }, []);

    // Pagination calculations
    const totalReviews = reviews.length;
    const total_pages = Math.ceil(totalReviews / resultPerPage);
    const paginatedReviews = reviews.slice((currentPage - 1) * resultPerPage, currentPage * resultPerPage);

    res.status(200).json({
        success: true,
        reviews: paginatedReviews,
        pagination: {
            current_page: currentPage,
            first_page: 1,
            last_page: total_pages,
            per_page: resultPerPage,
            total: reviews.length,
            total_pages,
            filteredReviewsCount: paginatedReviews.length
        }
    });
});

// Get All Reviews of a product
exports.getDestinationReviews = catchAsyncErrors(async (req, res, next) => {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
        return next(new ErrorHandler("Destination not found", 404));
    }

    res.status(200).json({
        success: true,
        reviews: destination.reviews,
    });
});

// Delete Review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const { destinationId, reviewId } = req.query;

    const destination = await Destination.findById(destinationId);

    if (!destination) {
        return next(new ErrorHandler("Destination not found", 404));
    }

    const reviewExists = destination.reviews.some(
        (rev) => rev._id.toString() === reviewId.toString()
    );

    if (!reviewExists) {
        return next(new ErrorHandler("Review not found", 404));
    }

    const reviews = destination.reviews.filter(
        (rev) => rev._id.toString() !== reviewId.toString()
    );

    const numOfReviews = reviews.length;

    const ratings = numOfReviews > 0
        ? reviews.reduce((acc, item) => acc + item.rating, 0) / numOfReviews
        : 0;

    await Destination.findByIdAndUpdate(
        destinationId,
        {
            reviews,
            ratings,
            numOfReviews,
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    res.status(200).json({
        success: true,
        message: 'Review Deleted Successfully',
    });
});

