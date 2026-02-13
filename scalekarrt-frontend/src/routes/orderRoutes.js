const express = require('express');
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();


// ================= CART =================
// Calculate totals before placing order
router.post('/calculate-cart', protect, orderController.calculateCart);


// ================= PROTECTED ROUTES =================
router.use(protect);


// ================= SELLER / ADMIN =================
// IMPORTANT: place BEFORE "/:id"
router.get(
  '/seller/orders',
  restrictTo('seller', 'admin'),
  orderController.getSellerOrders
);

router.patch(
  '/:id/status',
  restrictTo('seller', 'admin'),
  orderController.updateOrderStatus
);


// ================= BUYER =================
router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/:id', orderController.getOrder);
router.patch('/:id/cancel', orderController.cancelOrder);


module.exports = router;
