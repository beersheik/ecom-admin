const express = require('express');
const businessController = require('../controllers/businessController');
const { verifyAdminToken, requireSuperAdmin, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Super admin only
router.post('/',   verifyAdminToken, requireSuperAdmin, businessController.createBusiness);
router.delete('/:id', verifyAdminToken, requireSuperAdmin, businessController.deleteBusiness);

// Admin or super admin (admin scoped in controller)
router.get('/',       verifyAdminToken, requireAdmin, businessController.getBusinesses);
router.get('/:id',    verifyAdminToken, requireAdmin, businessController.getBusinessById);
router.put('/:id',    verifyAdminToken, requireAdmin, businessController.updateBusiness);
router.put('/:id/razorpay', verifyAdminToken, requireAdmin, businessController.updateRazorpayCredentials);

module.exports = router;
