const express = require('express');
const c = require('../controllers/contentController');
const { verifyAdminToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public reads — pass ?business=<id> to scope results
router.get('/faq',            c.getFAQs);
router.get('/privacy-policy', c.getPrivacyPolicy);

// Admin writes (admin scoped to own business; superadmin passes business in body)
router.post(  '/faq',            verifyAdminToken, requireAdmin, c.createFAQ);
router.put(   '/faq/:id',        verifyAdminToken, requireAdmin, c.updateFAQ);
router.delete('/faq/:id',        verifyAdminToken, requireAdmin, c.deleteFAQ);
router.put(   '/privacy-policy', verifyAdminToken, requireAdmin, c.updatePrivacyPolicy);

module.exports = router;
