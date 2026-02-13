const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');


// ================= CREATE ORDER (TRANSACTION) =================
const createOrder = async (orderData, userId) => {
  const {
    orderItems,
    shippingAddress,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = orderData;

  if (!orderItems || orderItems.length === 0) {
    throw new AppError('Cart is empty', 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const item of orderItems) {
      const product = await Product.findById(item.product).session(session);

      if (!product) throw new AppError(`Product ${item.name} not found`, 404);
      if (!product.isApproved) throw new AppError(`Product ${item.name} is not available`, 400);
      if (product.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for ${item.name}. Available: ${product.stock}`,
          400
        );
      }

      product.stock -= item.quantity;
      await product.save({ session });
    }

    const order = await Order.create(
      [
        {
          user: userId,
          orderItems,
          shippingAddress,
          paymentInfo,
          itemsPrice,
          taxPrice,
          shippingPrice,
          totalPrice,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return order[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};


// ================= GET USER ORDERS =================
const getUserOrders = async (userId, query) => {
  const { page = 1, limit = 10 } = query;

  const skip = (Number(page) - 1) * Number(limit);

  const orders = await Order.find({ user: userId })
    .populate('orderItems.product', 'name images')
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit));

  const total = await Order.countDocuments({ user: userId });

  return {
    orders,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};


// ================= GET SINGLE ORDER =================
const getOrderById = async (orderId, userId, userRole) => {
  const order = await Order.findById(orderId)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name images')
    .populate('orderItems.seller', 'name storeName');

  if (!order) throw new AppError('Order not found', 404);

  if (userRole !== 'admin' && order.user._id.toString() !== userId.toString()) {
    const isSeller = order.orderItems.some(
      (item) => item.seller._id.toString() === userId.toString()
    );

    if (!isSeller) {
      throw new AppError('You do not have permission to view this order', 403);
    }
  }

  return order;
};


// ================= UPDATE ORDER STATUS =================
const updateOrderStatus = async (orderId, status, userId, userRole) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);

  const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid order status', 400);
  }

  if (userRole !== 'admin') {
    const isSeller = order.orderItems.some(
      (item) => item.seller.toString() === userId.toString()
    );

    if (!isSeller) {
      throw new AppError('You can only update orders containing your products', 403);
    }
  }

  order.orderStatus = status;

  if (status === 'Delivered') order.deliveredAt = Date.now();

  await order.save();
  return order;
};


// ================= CANCEL ORDER (TRANSACTION) =================
const cancelOrder = async (orderId, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) throw new AppError('Order not found', 404);

    if (order.user.toString() !== userId.toString()) {
      throw new AppError('You can only cancel your own orders', 403);
    }

    if (order.orderStatus !== 'Processing') {
      throw new AppError('You can only cancel orders that are still processing', 400);
    }

    for (const item of order.orderItems) {
      const product = await Product.findById(item.product).session(session);
      product.stock += item.quantity;
      await product.save({ session });
    }

    order.orderStatus = 'Cancelled';
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// ================= CALCULATE ORDER AMOUNT (SECURE) =================
const calculateOrderAmount = async (items, shippingAddress, userId) => {
  if (!items || items.length === 0) {
    throw new AppError('No order items provided', 400);
  }

  let itemsPrice = 0;

  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);

    if (!product) throw new AppError(`Product not found`, 404);
    if (!product.isApproved) throw new AppError(`Product not available`, 400);
    if (product.stock < item.quantity)
      throw new AppError(`Insufficient stock for ${product.name}`, 400);

    itemsPrice += product.price * item.quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      price: product.price,
      image: product.images?.[0]?.url || '',
      seller: product.seller,
    });
  }

  const taxPrice = Number((itemsPrice * 0.1).toFixed(2));
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const totalPrice = Number((itemsPrice + taxPrice + shippingPrice).toFixed(2));

  // create pending order in DB
  const order = await Order.create({
    user: userId,
    orderItems,
    shippingAddress,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo: { status: 'pending' },
  });

  return {
    orderId: order._id,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  };
};



// ================= GET SELLER ORDERS =================
const getSellerOrders = async (sellerId, query) => {
  const { page = 1, limit = 10, status } = query;

  const filter = { 'orderItems.seller': sellerId };
  if (status) filter.orderStatus = status;

  const skip = (Number(page) - 1) * Number(limit);

  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name images')
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit));

  const total = await Order.countDocuments(filter);

  return {
    orders,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};
// ================= MARK ORDER PAID =================
const markOrderPaid = async (orderId, paymentInfo) => {
  const order = await Order.findById(orderId);

  if (!order) throw new AppError('Order not found', 404);

  order.paymentInfo = {
    id: paymentInfo.id,
    status: paymentInfo.status,
    method: paymentInfo.method,
    amount: paymentInfo.amount,
    paidAt: Date.now(),
  };

  order.orderStatus = 'Processing';

  await order.save();

  return order;
};



// ================= EXPORTS =================
module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getSellerOrders,
  calculateOrderAmount,   
  markOrderPaid, 
};
