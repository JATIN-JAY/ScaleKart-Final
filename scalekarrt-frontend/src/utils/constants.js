// src/utils/constants.js

// ------------------------------------
// Product Categories
// ------------------------------------
export const CATEGORIES = Object.freeze([
  'Electronics',
  'Fashion',
  'Home & Kitchen',
  'Books',
  'Sports',
  'Beauty',
  'Toys',
  'Automotive',
  'Health',
  'Grocery',
]);

// ------------------------------------
// Order Status
// ------------------------------------
export const ORDER_STATUS = Object.freeze({
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
});

// Useful list version
export const ORDER_STATUS_LIST = Object.freeze(Object.values(ORDER_STATUS));

// ------------------------------------
// User Roles
// ------------------------------------
export const USER_ROLES = Object.freeze({
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin',
});

export const USER_ROLE_LIST = Object.freeze(Object.values(USER_ROLES));

// ------------------------------------
// Payment Methods
// ------------------------------------
export const PAYMENT_METHODS = Object.freeze({
  CARD: 'card',
  UPI: 'upi',
  WALLET: 'wallet',
  NETBANKING: 'netbanking',
});

export const PAYMENT_METHOD_LIST = Object.freeze(Object.values(PAYMENT_METHODS));
