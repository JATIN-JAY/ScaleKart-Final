const orderService = require('../services/orderService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { calculateOrderPrices, validateCartItems } = require('../utils/cartHelpers');

// ================= CREATE ORDER (WITH RAZORPAY VERIFY) =================
exports.createOrder = catchAsync(async (req, res, next) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  let paymentInfo = null;

  // ===== If Razorpay payment details provided → verify =====
  if (razorpay_payment_id && razorpay_order_id && razorpay_signature) {
    const paymentService = require('../services/paymentService');

    // 1️⃣ Verify signature
    const verification = paymentService.verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!verification.verified) {
      return next(new AppError('Payment verification failed', 400));
    }

    // 2️⃣ Fetch real payment details from Razorpay
    const paymentDetails = await paymentService.fetchPayment(razorpay_payment_id);

    // 3️⃣ Ensure payment actually captured
    if (paymentDetails.status !== 'captured') {
      return next(
        new AppError('Payment not completed. Please complete payment first.', 400)
      );
    }

    // 4️⃣ Attach secure payment info
    paymentInfo = {
      id: paymentDetails.id,
      status: paymentDetails.status,
      method: paymentDetails.method,
      amount: paymentDetails.amount,
      currency: paymentDetails.currency,
    };
  }

  // Attach paymentInfo if exists (supports COD also)
  if (paymentInfo) {
    req.body.paymentInfo = paymentInfo;
  }

  // ===== Create order =====
  const order = await orderService.createOrder(req.body, req.user.id);

  res.status(201).json({
    status: 'success',
    message: 'Order placed successfully',
    data: { order },
  });
});

// ================= GET MY ORDERS =================
exports.getMyOrders = catchAsync(async (req, res, next) => {
  const result = await orderService.getUserOrders(req.user.id, req.query);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

// ================= GET SINGLE ORDER =================
exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await orderService.getOrderById(
    req.params.id,
    req.user.id,
    req.user.role
  );

  res.status(200).json({
    status: 'success',
    data: { order },
  });
});

// ================= UPDATE ORDER STATUS =================
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return next(new AppError('Please provide order status', 400));
  }

  const order = await orderService.updateOrderStatus(
    req.params.id,
    status,
    req.user.id,
    req.user.role
  );

  res.status(200).json({
    status: 'success',
    message: 'Order status updated',
    data: { order },
  });
});

// ================= CANCEL ORDER =================
exports.cancelOrder = catchAsync(async (req, res, next) => {
  const order = await orderService.cancelOrder(req.params.id, req.user.id);

  res.status(200).json({
    status: 'success',
    message: 'Order cancelled successfully',
    data: { order },
  });
});

// ================= GET SELLER ORDERS =================
exports.getSellerOrders = catchAsync(async (req, res, next) => {
  const result = await orderService.getSellerOrders(req.user.id, req.query);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

// ================= CALCULATE CART =================
exports.calculateCart = catchAsync(async (req, res, next) => {
  const { cartItems } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return next(new AppError('Cart is empty', 400));
  }

  const orderItems = await validateCartItems(cartItems);
  const prices = calculateOrderPrices(orderItems);

  res.status(200).json({
    status: 'success',
    data: {
      orderItems,
      ...prices,
    },
  });
});
