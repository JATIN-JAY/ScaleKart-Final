const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// ========================================
// 🔐 ADMIN-ONLY MIDDLEWARE
// ========================================
// Every route below requires:
// 1. Logged-in user
// 2. Role = admin
router.use(protect, restrictTo('admin'));


// ========================================
// 👤 USER MANAGEMENT
// ========================================
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUser);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.patch('/users/:id/role', adminController.updateUserRole);


// ========================================
// 🏪 SELLER MANAGEMENT
// ========================================
router.patch('/sellers/:id/verify', adminController.verifySeller);
router.patch('/sellers/:id/unverify', adminController.unverifySeller);


// ========================================
// 📦 PRODUCT MANAGEMENT
// ========================================
router.get('/products/pending', adminController.getPendingProducts);
router.patch('/products/:id/approve', adminController.approveProduct);
router.patch('/products/:id/reject', adminController.rejectProduct);
router.delete('/products/:id', adminController.deleteProduct);


// ========================================
// 🧾 ORDER MANAGEMENT
// ========================================
router.get('/orders', adminController.getAllOrders);


// ========================================
// 📊 PLATFORM ANALYTICS
// ========================================
router.get('/analytics', adminController.getPlatformAnalytics);


module.exports = router;
