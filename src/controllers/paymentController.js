const Razorpay = require('razorpay');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const Business = require('../models/Business');

function getUserFromToken(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

async function getRazorpayClient(businessId) {
  const business = await Business.findById(businessId);
  const keyId = business?.payments?.razorpay?.keyId;
  const keySecret = business?.payments?.razorpay?.keySecret;
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured for this business');
  }
  return { client: new Razorpay({ key_id: keyId, key_secret: keySecret }), keyId, keySecret };
}

// POST /api/payments/create-order
exports.createOrder = async (req, res) => {
  const decoded = getUserFromToken(req);
  if (!decoded) return res.status(401).json({ message: 'Unauthorized' });

  const { items, amount, currency = 'INR' } = req.body;
  if (!items || !items.length || !amount) {
    return res.status(400).json({ message: 'items and amount are required' });
  }

  try {
    const { client: razorpay, keyId } = await getRazorpayClient(decoded.business);

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency,
      receipt: `receipt_${Date.now()}`
    });

    const order = await Order.create({
      business: decoded.business,
      user: decoded.id,
      items,
      amount,
      currency,
      razorpayOrderId: razorpayOrder.id
    });

    res.status(201).json({
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: keyId
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
  const decoded = getUserFromToken(req);
  if (!decoded) return res.status(401).json({ message: 'Unauthorized' });

  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({ message: 'All payment fields are required' });
  }

  try {
    const { keySecret } = await getRazorpayClient(decoded.business);

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      await Order.findByIdAndUpdate(orderId, { status: 'failed' });
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { razorpayPaymentId, razorpaySignature, status: 'paid' },
      { new: true }
    );

    res.json({ message: 'Payment verified', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/payments/orders
exports.getOrders = async (req, res) => {
  const decoded = getUserFromToken(req);
  if (!decoded) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const orders = await Order.find({ user: decoded.id })
      .populate('items.product', 'name price profileImage')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/payments/admin/all-orders  (auth handled by middleware)
exports.getAllOrders = async (req, res) => {
  try {
    const filter = req.admin?.role === 'admin' ? { business: req.admin.business } : {};
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('business', 'name')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/payments/orders/:id
exports.getOrderById = async (req, res) => {
  const decoded = getUserFromToken(req);
  if (!decoded) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const order = await Order.findOne({ _id: req.params.id, user: decoded.id })
      .populate('items.product', 'name price profileImage');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
