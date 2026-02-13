const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// ================= PUBLIC =================

// Razorpay webhook (RAW body required)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleWebhook
);

// ================= PROTECTED =================
router.use(protect);

// Get Razorpay key (protected for security)
router.get('/razorpay-key', paymentController.getRazorpayKey);

// ---------- Validation middleware ----------
const validateCreateOrder = (req, res, next) => {
  const { items, shippingAddress } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'No order items provided' });
  }

  if (!shippingAddress) {
    return res.status(400).json({ message: 'Shipping address required' });
  }

  next();
};

// Create Razorpay order
router.post('/create-order', validateCreateOrder, paymentController.createOrder);

// Verify payment signature
router.post('/verify', paymentController.verifyPayment);

// Get payment details
router.get('/details/:paymentId', paymentController.getPaymentDetails);

// ================= ADMIN / SELLER =================
router.patch(
  '/refund/:orderId',
  restrictTo('admin', 'seller'),
  paymentController.requestRefund
);

module.exports = router;
