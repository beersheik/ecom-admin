const express = require('express');
const productController = require('../controllers/productController');
const { verifyAdminToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public reads (used by PlaceOrder user flow)
router.get('/',    productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/:id/reviews', productController.updateProductReviews);

// Admin writes
router.post('/',   verifyAdminToken, requireAdmin, productController.upload, productController.createProduct);
router.put('/:id', verifyAdminToken, requireAdmin, productController.upload, productController.updateProduct);
router.delete('/:id', verifyAdminToken, requireAdmin, productController.deleteProduct);

module.exports = router;
