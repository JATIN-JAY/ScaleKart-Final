const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const AppError = require('../utils/AppError');


// ======================================================
// CREATE RAZORPAY ORDER
// ======================================================
const createOrder = async (amount, currency = 'INR', receipt, metadata = {}) => {
  try {
    if (!amount || amount <= 0) {
      throw new AppError('Invalid payment amount', 400);
    }

    const options = {
      amount: Math.round(amount * 100), // ₹ → paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: metadata, // store DB orderId etc.
    };

    const order = await razorpay.orders.create(options);

    return {
      id: order.id,                 // Razorpay order id
      amount: order.amount / 100,   // back to ₹
      currency: order.currency,
      receipt: order.receipt,
    };
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    throw new AppError('Failed to create payment order', 500);
  }
};


// ======================================================
// VERIFY PAYMENT SIGNATURE  ✅ RETURNS BOOLEAN
// ======================================================
const verifyPayment = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  try {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    return expectedSignature === razorpaySignature;
  } catch (error) {
    console.error('Payment verification error:', error);
    return false;
  }
};


// ======================================================
// FETCH PAYMENT DETAILS FROM RAZORPAY
// ======================================================
const fetchPayment = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);

    return {
      id: payment.id,
      orderId: payment.order_id,
      amount: payment.amount / 100,
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      email: payment.email,
      contact: payment.contact,
      createdAt: new Date(payment.created_at * 1000),

      card: payment.card
        ? { network: payment.card.network, last4: payment.card.last4 }
        : null,

      upi: payment.vpa || null,
      wallet: payment.wallet || null,
    };
  } catch (error) {
    console.error('Fetch payment error:', error);
    throw new AppError('Failed to fetch payment details', 500);
  }
};


// ======================================================
// CREATE REFUND
// ======================================================
const createRefund = async (paymentId, amount = null, reason = 'requested_by_customer') => {
  try {
    const refundData = {
      notes: { reason },
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100);
    }

    const refund = await razorpay.payments.refund(paymentId, refundData);

    return {
      id: refund.id,
      paymentId: refund.payment_id,
      amount: refund.amount / 100,
      currency: refund.currency,
      status: refund.status,
      createdAt: new Date(refund.created_at * 1000),
    };
  } catch (error) {
    console.error('Refund creation error:', error);
    throw new AppError('Failed to process refund', 500);
  }
};


// ======================================================
// FETCH REFUND DETAILS
// ======================================================
const fetchRefund = async (refundId) => {
  try {
    const refund = await razorpay.refunds.fetch(refundId);

    return {
      id: refund.id,
      paymentId: refund.payment_id,
      amount: refund.amount / 100,
      currency: refund.currency,
      status: refund.status,
      createdAt: new Date(refund.created_at * 1000),
    };
  } catch (error) {
    console.error('Fetch refund error:', error);
    throw new AppError('Failed to fetch refund details', 500);
  }
};


// ======================================================
// VERIFY RAZORPAY WEBHOOK SIGNATURE
// ======================================================
const verifyWebhookSignature = (rawBody, signature, secret) => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody) // IMPORTANT: raw buffer
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Webhook verification error:', error);
    return false;
  }
};


// ======================================================
// EXPORTS
// ======================================================
module.exports = {
  createOrder,
  verifyPayment,
  fetchPayment,
  createRefund,
  fetchRefund,
  verifyWebhookSignature,
};
