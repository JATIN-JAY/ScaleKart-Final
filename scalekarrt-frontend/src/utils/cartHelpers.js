const Product = require('../models/Product');
const AppError = require('./AppError');

// Calculate prices safely on backend
const calculateOrderPrices = (items) => {
  const itemsPrice = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const taxPrice = +(itemsPrice * 0.1).toFixed(2);
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const totalPrice = +(itemsPrice + taxPrice + shippingPrice).toFixed(2);

  return { itemsPrice, taxPrice, shippingPrice, totalPrice };
};

// Validate cart against DB
const validateCartItems = async (cartItems) => {
  const validated = [];

  for (const item of cartItems) {
    const product = await Product.findById(item.productId);

    if (!product) throw new AppError('Product not found', 404);
    if (!product.isApproved) throw new AppError('Product not available', 400);
    if (product.stock < item.quantity)
      throw new AppError(`Insufficient stock for ${product.name}`, 400);

    validated.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.images[0]?.url || '',
      seller: product.seller,
    });
  }

  return validated;
};

module.exports = { calculateOrderPrices, validateCartItems };
