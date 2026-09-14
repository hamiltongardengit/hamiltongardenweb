const express = require("express");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");
const { createContactMessage, getAllContactMessages } = require("../controllers/contactController");
const router = express.Router();

router.route("/contact").post(createContactMessage);
router.route("/admin/contacts").get(isAuthenticatedUser, authorizedRoles('admin', 'employee'), getAllContactMessages);

module.exports = router;