const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");

const {
    createInvoice,
    getInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,
    exportInvoicesToCSV,
    getAllInvoicesByLatestExpiry,
} = require('../controllers/invoiceController');
const { processAllInvoices } = require('../services/batchUploadAndCleanup');

router.post('/admin/invoices', isAuthenticatedUser, authorizedRoles('admin','employee'), createInvoice);
router.post('/admin/get_all_invoices', isAuthenticatedUser, authorizedRoles('admin', 'employee', 'employee_view'), getInvoices);
router.get('/admin/invoices/:id', isAuthenticatedUser, authorizedRoles('admin', 'employee', 'employee_view'), getInvoiceById);
router.put('/admin/invoices/:id', isAuthenticatedUser, authorizedRoles('admin','employee'), updateInvoice);
router.delete('/admin/invoices/:id', isAuthenticatedUser, authorizedRoles('admin','employee'), deleteInvoice);

// New route for batch processing
router.get('/admin/process-invoices', isAuthenticatedUser, authorizedRoles('admin','employee'), async (req, res) => {
    try {
        await processAllInvoices();
        res.status(200).json({ success: true, message: 'Batch processing started successfully.' });
    } catch (error) {
        console.error('Error processing invoices:', error);
        res.status(500).json({ success: false, message: 'Failed to process invoices.' });
    }
});

router.get('/admin/export-invoices', isAuthenticatedUser, authorizedRoles('admin', 'employee', 'employee_view'), exportInvoicesToCSV);
router.post('/admin/get-expiring-memberships', isAuthenticatedUser, authorizedRoles('admin', 'employee', 'employee_view'), getAllInvoicesByLatestExpiry);

module.exports = router;