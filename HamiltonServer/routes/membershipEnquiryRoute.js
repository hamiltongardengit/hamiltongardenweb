const express = require("express");
const {createMembershipEnquiry, getAllMembershipEnquiries} = require("../controllers/membershipEnquiryController");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");
const router = express.Router();

router.route("/submit-enquiry").post(createMembershipEnquiry);
router.route("/admin/get-all-enquiries").post(isAuthenticatedUser, authorizedRoles("admin", "employee", 'employee_view'), getAllMembershipEnquiries);

module.exports = router;