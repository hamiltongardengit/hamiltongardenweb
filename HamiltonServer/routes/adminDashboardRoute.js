const express = require("express");
const { getAdminDashboardData} = require("../controllers/adminDashboardController");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/admin/dashboard").get(isAuthenticatedUser, authorizedRoles("admin", 'employee'), getAdminDashboardData);

module.exports = router;
