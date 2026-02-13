import api from './axios';

// ========================================
// PRODUCTS API
// ========================================
export const productsAPI = {
  // Get all products with filters
  getAll: (params) =>
    api.get('/products', { params }),

  // Get single product
  getById: (id) =>
    api.get(`/products/${id}`),

  // Create product (seller)
  create: (productData) =>
    api.post('/products', productData),

  // Update product
  update: (id, productData) =>
    api.patch(`/products/${id}`, productData),

  // Delete product
  delete: (id) =>
    api.delete(`/products/${id}`),

  // Upload images (multipart)
  uploadImages: (formData) =>
    api.post('/products/upload-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Add review (buyer)
  addReview: (id, reviewData) =>
    api.post(`/products/${id}/reviews`, reviewData),

  // Seller dashboard products
  getMyProducts: (params) =>
    api.get('/products/seller/my-products', { params }),
};
