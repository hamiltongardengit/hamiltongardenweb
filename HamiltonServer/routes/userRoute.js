const express = require("express");
const { registerUser, loginUser, verifyOtp, logout, getAllUsers, deleteUser, forgetPassword, resetPassword, getUserDetails, updatePassword, updateProfile, updateUserRole, addUsage, updateUsage, deleteUsage, getUserUsage, uploadAgreement, deleteAgreement, downloadAgreement,
    createEmployee, getAllEmployees, updateEmployee, deleteEmployee, assignCustomersToEmployee, acceptAgreement
 } = require("../controllers/userController");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");
const router = express.Router();

router.route("/admin/register").post(isAuthenticatedUser, authorizedRoles('admin','employee'), registerUser);
router.route("/login").post(loginUser);
router.route("/verify-otp").post(verifyOtp);
router.route("/logout").get(isAuthenticatedUser, logout);

router.route("/forgot-password").post(forgetPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/password/update").put(isAuthenticatedUser, updatePassword);

router.route("/profile").get(isAuthenticatedUser, getUserDetails);
router.route("/update-profile/:id").put(isAuthenticatedUser, updateProfile);

router.route("/admin/get-all-users").post(isAuthenticatedUser, authorizedRoles("admin", 'employee', 'employee_view'), getAllUsers);
router.route("/admin/user/:id").put(isAuthenticatedUser, authorizedRoles('admin', 'employee'), updateUserRole).delete(isAuthenticatedUser, authorizedRoles('admin'), deleteUser);

// Route to for user usage 
router.route("/usage").post(isAuthenticatedUser, getUserUsage)
router.route("/admin/usage").post(isAuthenticatedUser, authorizedRoles('admin', 'employee', 'employee_view'), getUserUsage)
router.route("/admin/add-usage").post(isAuthenticatedUser, authorizedRoles('admin', 'employee', 'employee_view'), addUsage)
router.route("/admin/usage/:id").put(isAuthenticatedUser, authorizedRoles('admin', 'employee', 'employee_view'), updateUsage)
router.route("/admin/delete-usage/:userId/:usageId")
    .delete(isAuthenticatedUser, authorizedRoles('admin', 'employee'), deleteUsage);
    
router.route("/admin/upload-agreement").post(isAuthenticatedUser, authorizedRoles('admin', 'employee'), uploadAgreement);
router.route("/admin/agreement/:userId").delete(isAuthenticatedUser, authorizedRoles('admin', 'employee'), deleteAgreement);
router.route("/admin/accept-agreement").post(isAuthenticatedUser, authorizedRoles('admin', 'employee'), acceptAgreement);

// Route to for employee
router.route("/admin/create-employee").post(isAuthenticatedUser, authorizedRoles('admin', 'employee'), createEmployee);
router.route("/admin/get-all-employee").post(isAuthenticatedUser, authorizedRoles("admin", 'employee', 'employee_view'), getAllEmployees);
router.route("/admin/employee/:id").put(isAuthenticatedUser, authorizedRoles('admin', 'employee'), updateEmployee).delete(isAuthenticatedUser, authorizedRoles('admin'), deleteEmployee);
router.route("/admin/assign-customers-to-employee").post(isAuthenticatedUser, authorizedRoles('admin', 'employee'), assignCustomersToEmployee);

module.exports = router;