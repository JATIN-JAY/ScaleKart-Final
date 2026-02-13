import api from './axios';

// PAYMENTS API (RAZORPAY)
export const paymentsAPI = {
  // Public Razorpay key
  getRazorpayKey: () =>
    api.get('/payments/razorpay-key'),

  // Create Razorpay order
  createOrder: (orderData) =>
    api.post('/payments/create-order', orderData),

  // Verify payment
  verifyPayment: (paymentData) =>
    api.post('/payments/verify', paymentData),

  // Fetch payment details
  getPaymentDetails: (paymentId) =>
    api.get(`/payments/details/${paymentId}`),

  // Refund request
  requestRefund: (orderId, refundData) =>
    api.post(`/payments/refund/${orderId}`, refundData),
};
