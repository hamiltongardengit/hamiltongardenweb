const express = require("express");
const { registerUser, loginUser, logout, getAllUsers, deleteUser, forgetPassword, resetPassword, getUserDetails, updatePassword, updateProfile, updateUserRole, addUsage, updateUsage, deleteUsage, getUserUsage, uploadAgreement, deleteAgreement, downloadAgreement } = require("../controllers/userController");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");
const router = express.Router();

router.route("/admin/register").post(isAuthenticatedUser, authorizedRoles('admin','employee'), registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(isAuthenticatedUser, logout);

router.route("/forgot-password").post(forgetPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/password/update").put(isAuthenticatedUser, updatePassword);

router.route("/profile").get(isAuthenticatedUser, getUserDetails);
router.route("/update-profile/:id").put(isAuthenticatedUser, updateProfile);

router.route("/admin/get-all-users").post(isAuthenticatedUser, authorizedRoles("admin", 'employee'), getAllUsers);
router.route("/admin/user/:id").put(isAuthenticatedUser, authorizedRoles('admin', 'employee'), updateUserRole).delete(isAuthenticatedUser, authorizedRoles('admin'), deleteUser);

// Route to for user usage 
router.route("/usage").post(isAuthenticatedUser, getUserUsage)
router.route("/admin/usage").post(isAuthenticatedUser, authorizedRoles('admin', 'employee'), getUserUsage)
router.route("/admin/add-usage").post(isAuthenticatedUser, authorizedRoles('admin', 'employee'), addUsage)
router.route("/admin/usage/:id").put(isAuthenticatedUser, authorizedRoles('admin', 'employee'), updateUsage)
router.route("/admin/delete-usage/:userId/:usageId")
    .delete(isAuthenticatedUser, authorizedRoles('admin', 'employee'), deleteUsage);
    
router.route("/admin/upload-agreement").post(isAuthenticatedUser, authorizedRoles('admin', 'employee'), uploadAgreement);
router.route("/admin/agreement/:userId").delete(isAuthenticatedUser, authorizedRoles('admin', 'employee'), deleteAgreement);

module.exports = router;