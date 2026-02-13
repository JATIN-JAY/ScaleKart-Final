import api from './axios';

// ========================================
// ADMIN API
// ========================================
export const adminAPI = {
  // ---------------- USERS ----------------
  getAllUsers: (params) =>
    api.get('/admin/users', { params }),

  getUser: (id) =>
    api.get(`/admin/users/${id}`),

  updateUserStatus: (id, isActive) =>
    api.patch(`/admin/users/${id}/status`, { isActive }),

  updateUserRole: (id, role) =>
    api.patch(`/admin/users/${id}/role`, { role }),

  // ---------------- SELLERS ----------------
  verifySeller: (id) =>
    api.patch(`/admin/sellers/${id}/verify`),

  unverifySeller: (id) =>
    api.patch(`/admin/sellers/${id}/unverify`),

  // ---------------- PRODUCTS ----------------
  getPendingProducts: (params) =>
    api.get('/admin/products/pending', { params }),

  approveProduct: (id) =>
    api.patch(`/admin/products/${id}/approve`),

  rejectProduct: (id) =>
    api.patch(`/admin/products/${id}/reject`),

  deleteProduct: (id) =>
    api.delete(`/admin/products/${id}`),

  // ---------------- ORDERS ----------------
  getAllOrders: (params) =>
    api.get('/admin/orders', { params }),

  // ---------------- ANALYTICS ----------------
  getAnalytics: () =>
    api.get('/admin/analytics'),
};
