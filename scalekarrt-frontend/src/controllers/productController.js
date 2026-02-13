const productService = require("../services/productService");
const uploadService = require("../services/uploadService");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.uploadImages = catchAsync(async (req, res, next) => {
  if (!req.files?.length)
    return next(new AppError("Upload at least one image", 400));

  const images = await uploadService.uploadMultipleImages(req.files);

  res.status(200).json({ status: "success", data: { images } });
});

exports.createProduct = catchAsync(async (req, res) => {
  const product = await productService.createProduct(req.body, req.user.id);

  res.status(201).json({ status: "success", data: { product } });
});

exports.getAllProducts = catchAsync(async (req, res) => {
  const data = await productService.getAllProducts(req.query);
  res.json({ status: "success", data });
});

exports.getProduct = catchAsync(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.json({ status: "success", data: { product } });
});

exports.updateProduct = catchAsync(async (req, res) => {
  const product = await productService.updateProduct(
    req.params.id,
    req.body,
    req.user.id,
    req.user.role
  );

  res.json({ status: "success", data: { product } });
});

exports.deleteProduct = catchAsync(async (req, res) => {
  await productService.deleteProduct(
    req.params.id,
    req.user.id,
    req.user.role
  );

  res.status(204).json({ status: "success" });
});

exports.getMyProducts = catchAsync(async (req, res) => {
  const data = await productService.getSellerProducts(req.user.id, req.query);
  res.json({ status: "success", data });
});

exports.addReview = catchAsync(async (req, res, next) => {
  const { rating, comment } = req.body;
  if (!rating || !comment)
    return next(new AppError("Rating & comment required", 400));

  const product = await productService.addReview(
    req.params.id,
    req.user.id,
    rating,
    comment
  );

  res.status(201).json({ status: "success", data: { product } });
});
