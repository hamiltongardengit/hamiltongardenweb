const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");

const {
    getAllDestinations,
    getDestinationDetails,
    createDestination,
    updateDestination,
    deleteDestination,
    createOrUpdateReview,
    getDestinationReviews,
    deleteReview,
    getReviewsByStatus,
    updateReviewStatus
} = require('../controllers/destinationController');

// Destination routes
router.route('/destinations').post(getAllDestinations);

router.route('/admin/destinations')
    .post(isAuthenticatedUser, authorizedRoles('admin', 'employee'), createDestination);

router.route('/destinations/:id').get(getDestinationDetails);

router.route('/admin/destinations/:id')
    .put(isAuthenticatedUser, authorizedRoles('admin', 'employee'), updateDestination)
    .delete(isAuthenticatedUser, authorizedRoles('admin', 'employee'), deleteDestination);

// Review routes
router.route('/review/:id')
    .put(isAuthenticatedUser, createOrUpdateReview)
    .get(isAuthenticatedUser, getDestinationReviews);

router.route('/reviews')
    .delete(isAuthenticatedUser, deleteReview);

router.route('/admin/update-review-status')
    .put(isAuthenticatedUser, authorizedRoles('admin', 'employee'), updateReviewStatus);
router.route('/admin/get-reviews-by-status')
    .post(isAuthenticatedUser, authorizedRoles('admin', 'employee'), getReviewsByStatus);


module.exports = router;