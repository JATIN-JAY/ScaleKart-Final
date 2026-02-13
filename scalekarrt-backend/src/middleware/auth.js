const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Protect routes (require authentication)
exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // Get token from cookie OR Authorization header
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If token missing → not logged in
  if (!token) {
    return next(
      new AppError(
        'You are not logged in. Please log in to access this resource',
        401
      )
    );
  }
console.log("ACCESS SECRET (SIGN):", process.env.JWT_ACCESS_SECRET);

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

  // Check if user still exists
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(
      new AppError('The user belonging to this token no longer exists', 401)
    );
  }

  // Check if user is active
  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated', 403));
  }

  // Grant access
  req.user = user;
  next();
});

// Restrict to specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

// Verify seller status
exports.verifySeller = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'seller') {
    return next(new AppError('This action is only available to sellers', 403));
  }

  if (!req.user.isVerifiedSeller) {
    return next(new AppError('Your seller account is not verified yet', 403));
  }

  next();
});
