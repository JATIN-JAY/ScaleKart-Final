const Product = require("../models/Product");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { deleteImage } = require("./uploadService");

// CREATE
const createProduct = async (data, sellerId) => {
  return Product.create({
    ...data,
    seller: sellerId,
    isApproved: false,
  });
};

// GET ALL
const getAllProducts = async (query) => {
  const {
    page = 1,
    limit = 20,
    category,
    minPrice,
    maxPrice,
    ratings,
    search,
    sort = "-createdAt",
  } = query;

  const filter = { isApproved: true };

  if (category) filter.category = category;

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (ratings) filter.ratings = { $gte: Number(ratings) };

  if (search) filter.$text = { $search: search };

  const skip = (page - 1) * limit;

  const products = await Product.find(filter)
    .populate("seller", "name storeName")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  const total = await Product.countDocuments(filter);

  return {
    products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// GET ONE
const getProductById = async (id) => {
  const product = await Product.findById(id)
    .populate("seller", "name storeName email")
    .populate("reviews.user", "name");

  if (!product) throw new AppError("Product not found", 404);

  return product;
};

// UPDATE
const updateProduct = async (id, data, userId, role) => {
  const product = await Product.findById(id);
  if (!product) throw new AppError("Product not found", 404);

  if (role !== "admin" && product.seller.toString() !== userId.toString())
    throw new AppError("Not allowed", 403);

  Object.assign(product, data);
  await product.save();

  return product;
};

// DELETE
const deleteProduct = async (id, userId, role) => {
  const product = await Product.findById(id);
  if (!product) throw new AppError("Product not found", 404);

  if (role !== "admin" && product.seller.toString() !== userId.toString())
    throw new AppError("Not allowed", 403);

  for (const img of product.images) {
    await deleteImage(img.public_id);
  }

  await product.deleteOne();
};

// SELLER PRODUCTS
const getSellerProducts = async (sellerId, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const products = await Product.find({ seller: sellerId })
    .sort("-createdAt")
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments({ seller: sellerId });

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

// ADD REVIEW
const addReview = async (productId, userId, rating, comment) => {
  const product = await Product.findById(productId);
  if (!product) throw new AppError("Product not found", 404);

  if (product.reviews.find((r) => r.user.toString() === userId.toString()))
    throw new AppError("Already reviewed", 400);

  const user = await User.findById(userId);

  product.reviews.push({ user: userId, name: user.name, rating, comment });

  product.numOfReviews = product.reviews.length;

  product.ratings =
    product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length;

  await product.save();

  return product;
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  addReview,
};
