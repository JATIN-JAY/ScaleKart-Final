const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');


// ================= COMMON HELPERS =================

const getPagination = (query, defaultLimit = 20) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || defaultLimit, 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};


// ================= USERS =================

// Get all users
const getAllUsers = async (query) => {
  const { role, search } = query;
  const { page, limit, skip } = getPagination(query);

  const filter = {};

  if (role) filter.role = role;

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password -refreshToken')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),

    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};


// Get single user
const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password -refreshToken');

  if (!user) throw new AppError('User not found', 404);

  return user;
};


// Activate / deactivate user
const updateUserStatus = async (userId, isActive) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true, runValidators: true }
  ).select('-password -refreshToken');

  if (!user) throw new AppError('User not found', 404);

  return user;
};


// Update role
const updateUserRole = async (userId, role) => {
  const validRoles = ['buyer', 'seller', 'admin'];

  if (!validRoles.includes(role)) {
    throw new AppError('Invalid role', 400);
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, runValidators: true }
  ).select('-password -refreshToken');

  if (!user) throw new AppError('User not found', 404);

  return user;
};


// ================= SELLER =================

const verifySeller = async (userId) => {
  const user = await User.findById(userId);

  if (!user) throw new AppError('User not found', 404);
  if (user.role !== 'seller') throw new AppError('User is not a seller', 400);

  user.isVerifiedSeller = true;
  await user.save();

  return user;
};

const unverifySeller = async (userId) => {
  const user = await User.findById(userId);

  if (!user) throw new AppError('User not found', 404);

  user.isVerifiedSeller = false;
  await user.save();

  return user;
};


// ================= PRODUCTS =================

const getPendingProducts = async (query) => {
  const { page, limit, skip } = getPagination(query);

  const filter = { isApproved: false };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('seller', 'name storeName email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),

    Product.countDocuments(filter),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};


const approveProduct = async (productId) => {
  const product = await Product.findByIdAndUpdate(
    productId,
    { isApproved: true },
    { new: true }
  ).populate('seller', 'name storeName email');

  if (!product) throw new AppError('Product not found', 404);

  return product;
};


const rejectProduct = async (productId) => {
  const product = await Product.findByIdAndUpdate(
    productId,
    { isApproved: false },
    { new: true }
  ).populate('seller', 'name storeName email');

  if (!product) throw new AppError('Product not found', 404);

  return product;
};


const deleteProductAdmin = async (productId) => {
  const product = await Product.findById(productId);

  if (!product) throw new AppError('Product not found', 404);

  await product.deleteOne();
};


// ================= ORDERS =================

const getAllOrders = async (query) => {
  const { status } = query;
  const { page, limit, skip } = getPagination(query);

  const filter = {};
  if (status) filter.orderStatus = status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name')
      .populate('orderItems.seller', 'name storeName')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),

    Order.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};


// ================= ANALYTICS =================

const getPlatformAnalytics = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalUsers,
    totalBuyers,
    totalSellers,
    verifiedSellers,
    activeUsers,
    newUsers,
    totalProducts,
    pendingProducts,
    totalProductsAll,
    totalOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'buyer' }),
    User.countDocuments({ role: 'seller' }),
    User.countDocuments({ role: 'seller', isVerifiedSeller: true }),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Product.countDocuments({ isApproved: true }),
    Product.countDocuments({ isApproved: false }),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: 'Processing' }),
    Order.countDocuments({ orderStatus: 'Shipped' }),
    Order.countDocuments({ orderStatus: 'Delivered' }),
    Order.countDocuments({ orderStatus: 'Cancelled' }),
  ]);

  const revenueAgg = await Order.aggregate([
    { $match: { orderStatus: { $ne: 'Cancelled' } } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' },
        avgOrderValue: { $avg: '$totalPrice' },
      },
    },
  ]);

  const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
  const avgOrderValue = revenueAgg[0]?.avgOrderValue || 0;

  return {
    users: { total: totalUsers, buyers: totalBuyers, sellers: totalSellers, verifiedSellers, activeUsers, newUsers },
    products: { total: totalProducts, pending: pendingProducts, allProducts: totalProductsAll },
    orders: { total: totalOrders, processing: processingOrders, shipped: shippedOrders, delivered: deliveredOrders, cancelled: cancelledOrders },
    revenue: {
      total: Number(totalRevenue.toFixed(2)),
      avgOrderValue: Number(avgOrderValue.toFixed(2)),
    },
  };
};


module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  verifySeller,
  unverifySeller,
  getPendingProducts,
  approveProduct,
  rejectProduct,
  deleteProductAdmin,
  getAllOrders,
  getPlatformAnalytics,
};
