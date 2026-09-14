const express = require("express");
const { createMembershipBooking, getAllMembershipBuyList } = require("../controllers/membershipBookingController");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");
const router = express.Router();

router.route("/submit-membership-booking").post(createMembershipBooking);
router.route("/admin/get-all-membership-booking").post(isAuthenticatedUser, authorizedRoles("admin", "employee"), getAllMembershipBuyList);

module.exports = router;