const express = require('express');
const paymentController = require('../controllers/paymentController');
const { verifyAdminToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Razorpay payment integration
 */

/**
 * @swagger
 * /api/payments/create-order:
 *   post:
 *     summary: Create a Razorpay order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items, amount]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     price:
 *                       type: number
 *               amount:
 *                 type: number
 *                 description: Total amount in INR (not paise)
 *               currency:
 *                 type: string
 *                 default: INR
 *     responses:
 *       201:
 *         description: Razorpay order created
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/create-order', paymentController.createOrder);

/**
 * @swagger
 * /api/payments/verify:
 *   post:
 *     summary: Verify Razorpay payment signature
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature]
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: MongoDB Order _id
 *               razorpayOrderId:
 *                 type: string
 *               razorpayPaymentId:
 *                 type: string
 *               razorpaySignature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       400:
 *         description: Invalid signature or missing fields
 *       401:
 *         description: Unauthorized
 */
router.post('/verify', paymentController.verifyPayment);

/**
 * @swagger
 * /api/payments/orders:
 *   get:
 *     summary: Get all orders for the logged-in user
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /api/payments/admin/all-orders:
 *   get:
 *     summary: Get all orders (admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All orders
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/admin/all-orders', verifyAdminToken, requireAdmin, paymentController.getAllOrders);

router.get('/orders', paymentController.getOrders);

/**
 * @swagger
 * /api/payments/orders/{id}:
 *   get:
 *     summary: Get a single order by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order found
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
router.get('/orders/:id', paymentController.getOrderById);

module.exports = router;
