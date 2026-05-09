const express = require('express');
const adminController = require('../controllers/adminController');
const { verifyAdminToken, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/login',  adminController.adminLogin);
router.post('/logout', adminController.adminLogout);

// Super admin only — manage admin accounts
router.post(  '/',    verifyAdminToken, requireSuperAdmin, adminController.createAdmin);
router.get(   '/',    verifyAdminToken, requireSuperAdmin, adminController.listAdmins);
router.delete('/:id', verifyAdminToken, requireSuperAdmin, adminController.deleteAdmin);

module.exports = router;
