const paymentService = require('../services/paymentService');
const orderService = require('../services/orderService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');


// =======================================================
// CREATE RAZORPAY ORDER  (CORRECT VERSION)
// =======================================================
exports.createOrder = catchAsync(async (req, res, next) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return next(new AppError('Invalid payment amount', 400));
  }

  // Razorpay needs amount in paise
  const razorpayOrder = await paymentService.createOrder(
    Math.round(amount),
    'INR',
    `receipt_${Date.now()}`,
    {
      userId: req.user.id.toString(),
      userEmail: req.user.email,
    }
  );

  res.status(200).json({
    status: 'success',
    data: razorpayOrder, // 🔥 return full razorpay object
  });
});

// exports.createOrder = catchAsync(async (req, res, next) => {
//   const { items, shippingAddress } = req.body;

//   if (!items || items.length === 0) {
//     return next(new AppError('No order items provided', 400));
//   }

//   // 1️⃣ Create pending DB order securely
//   const orderData = await orderService.calculateOrderAmount(
//     items,
//     shippingAddress,
//     req.user.id
//   );

//   // 2️⃣ Create Razorpay order
//   const razorpayOrder = await paymentService.createOrder(
//     Math.round(orderData.totalPrice * 100), // paise
//     'INR',
//     `receipt_${Date.now()}`,
//     {
//       orderId: orderData.orderId.toString(),
//     }
//   );

//   // 3️⃣ Send BOTH IDs to frontend
//   res.status(200).json({
//     status: 'success',
//     data: {
//       orderId: orderData.orderId,          // 🔥 DB ORDER ID
//       razorpayOrderId: razorpayOrder.id,   // Razorpay order id
//       amount: razorpayOrder.amount,        // already paise
//       currency: razorpayOrder.currency,
//     },
//   });
// });


// =======================================================
// VERIFY PAYMENT
// =======================================================
exports.verifyPayment = catchAsync(async (req, res, next) => {
  console.log("VERIFY BODY:", req.body);

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return next(new AppError('Missing payment verification parameters', 400));
  }

  // Verify signature
  const isValid = paymentService.verifyPayment(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isValid) {
    return next(new AppError('Payment signature verification failed', 400));
  }

  // Fetch payment details
  const paymentDetails = await paymentService.fetchPayment(razorpay_payment_id);

  res.status(200).json({
    status: 'success',
    message: 'Payment verified successfully',
    data: paymentDetails,
  });
});

// exports.verifyPayment = catchAsync(async (req, res, next) => {
//   console.log("VERIFY BODY:", req.body);

//   const {
//     razorpay_order_id,
//     razorpay_payment_id,
//     razorpay_signature,
//     orderId, // ← VERY IMPORTANT (frontend must send this)
//   } = req.body;

//   if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//     return next(new AppError('Missing payment verification parameters', 400));
//   }

//   // 1️⃣ Verify signature
//   const verification = paymentService.verifyPayment(
//     razorpay_order_id,
//     razorpay_payment_id,
//     razorpay_signature
//   );

//   if (!verification.verified) {
//     return next(new AppError('Payment signature verification failed', 400));
//   }

//   // 2️⃣ Fetch real Razorpay payment details
//   const paymentDetails = await paymentService.fetchPayment(razorpay_payment_id);

//   // 3️⃣ Ensure payment captured
//   if (paymentDetails.status !== 'captured') {
//     return next(new AppError('Payment not captured', 400));
//   }

//   // 4️⃣ 🔥 MARK ORDER AS PAID IN DB
//   if (orderId) {
//     await orderService.markOrderPaid(orderId, {
//   id: paymentDetails.id,
//   status: paymentDetails.status,
//   method: paymentDetails.method,
//   amount: paymentDetails.amount,
// });

//   } else {
//     console.warn("⚠️ orderId missing in verifyPayment");
//   }

//   res.status(200).json({
//     status: 'success',
//     message: 'Payment verified & order updated',
//     data: paymentDetails,
//   });
// });


// =======================================================
// GET RAZORPAY KEY
// =======================================================
exports.getRazorpayKey = catchAsync(async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      keyId: process.env.RAZORPAY_KEY_ID,
    },
  });
});


// =======================================================
// GET PAYMENT DETAILS
// =======================================================
exports.getPaymentDetails = catchAsync(async (req, res) => {
  const { paymentId } = req.params;

  const paymentDetails = await paymentService.fetchPayment(paymentId);

  res.status(200).json({
    status: 'success',
    data: paymentDetails,
  });
});


// =======================================================
// REQUEST REFUND
// =======================================================
exports.requestRefund = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { amount, reason } = req.body;

  const order = await orderService.getOrderById(
    orderId,
    req.user.id,
    req.user.role
  );

  if (!order.paymentInfo?.id) {
    return next(new AppError('No payment information found for this order', 400));
  }

  const refund = await paymentService.createRefund(
    order.paymentInfo.id,
    amount,
    reason || 'requested_by_customer'
  );

  await orderService.updateOrderStatus(
    orderId,
    'Cancelled',
    req.user.id,
    req.user.role
  );

  res.status(200).json({
    status: 'success',
    message: 'Refund processed successfully',
    data: refund,
  });
});


// =======================================================
// WEBHOOK HANDLER
// =======================================================
exports.handleWebhook = catchAsync(async (req, res, next) => {
  const signature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('Webhook secret not configured');
    return res.status(200).json({ received: true });
  }

  const isValid = paymentService.verifyWebhookSignature(
    req.rawBody,
    signature,
    webhookSecret
  );

  if (!isValid) {
    return next(new AppError('Invalid webhook signature', 400));
  }

  const event = req.body.event;
  const payment = req.body.payload?.payment?.entity;

  if (event === 'payment.captured') {
    console.log('✅ Payment captured:', payment.id);
  }

  if (event === 'payment.failed') {
    console.log('❌ Payment failed:', payment.id);
  }

  if (event === 'refund.processed') {
    console.log('💰 Refund processed:', payment.id);
  }

  res.status(200).json({ received: true });
});
