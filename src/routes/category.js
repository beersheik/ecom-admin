const express = require('express');
const categoryController = require('../controllers/categoryController');
const { verifyAdminToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/',    verifyAdminToken, requireAdmin, categoryController.getCategories);
router.get('/:id', verifyAdminToken, requireAdmin, categoryController.getCategoryById);
router.post('/',   verifyAdminToken, requireAdmin, categoryController.createCategory);
router.put('/:id', verifyAdminToken, requireAdmin, categoryController.updateCategory);
router.delete('/:id', verifyAdminToken, requireAdmin, categoryController.deleteCategory);

module.exports = router;
