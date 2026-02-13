const adminService = require('../services/adminService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');


// ========================================
// USER MANAGEMENT
// ========================================

// Get all users
exports.getAllUsers = catchAsync(async (req, res) => {
  const result = await adminService.getAllUsers(req.query);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});


// Get single user
exports.getUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next(new AppError('User ID is required', 400));

  const user = await adminService.getUserById(id);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});


// Activate / deactivate user
exports.updateUserStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return next(new AppError('isActive must be boolean', 400));
  }

  const user = await adminService.updateUserStatus(id, isActive);

  res.status(200).json({
    status: 'success',
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: { user },
  });
});


// Update user role
exports.updateUserRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role) return next(new AppError('Role is required', 400));

  const user = await adminService.updateUserRole(id, role);

  res.status(200).json({
    status: 'success',
    message: 'User role updated successfully',
    data: { user },
  });
});


// ========================================
// SELLER MANAGEMENT
// ========================================

// Verify seller
exports.verifySeller = catchAsync(async (req, res) => {
  const user = await adminService.verifySeller(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Seller verified successfully',
    data: { user },
  });
});


// Unverify seller
exports.unverifySeller = catchAsync(async (req, res) => {
  const user = await adminService.unverifySeller(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Seller verification revoked',
    data: { user },
  });
});


// ========================================
// PRODUCT MANAGEMENT
// ========================================

// Get pending products
exports.getPendingProducts = catchAsync(async (req, res) => {
  const result = await adminService.getPendingProducts(req.query);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});


// Approve product
exports.approveProduct = catchAsync(async (req, res) => {
  const product = await adminService.approveProduct(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Product approved successfully',
    data: { product },
  });
});


// Reject product
exports.rejectProduct = catchAsync(async (req, res) => {
  const product = await adminService.rejectProduct(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Product rejected successfully',
    data: { product },
  });
});


// Delete product (admin override)
exports.deleteProduct = catchAsync(async (req, res) => {
  await adminService.deleteProductAdmin(req.params.id);

  res.status(204).json({
    status: 'success',
    message: 'Product deleted successfully',
  });
});


// ========================================
// ORDER MANAGEMENT
// ========================================

// Get all orders (admin view)
exports.getAllOrders = catchAsync(async (req, res) => {
  const result = await adminService.getAllOrders(req.query);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});


// ========================================
// ANALYTICS
// ========================================

// Platform analytics
exports.getPlatformAnalytics = catchAsync(async (req, res) => {
  const analytics = await adminService.getPlatformAnalytics();

  res.status(200).json({
    status: 'success',
    data: { analytics },
  });
});
