import api from './axios';

// ========================================
// ORDERS API
// ========================================
export const ordersAPI = {
  // Create order after payment verification
  create: (orderData) =>
    api.post('/orders', orderData),

  // Buyer order history
  getMyOrders: (params) =>
    api.get('/orders/my-orders', { params }),

  // Get single order
  getById: (id) =>
    api.get(`/orders/${id}`),

  // Cancel order (buyer)
  cancel: (id) =>
    api.patch(`/orders/${id}/cancel`),

  // Seller/Admin update order status
  updateStatus: (id, status) =>
    api.patch(`/orders/${id}/status`, { status }),

  // Seller orders dashboard
  getSellerOrders: (params) =>
    api.get('/orders/seller/orders', { params }),
};
