const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Send tokens via HTTP-only cookies
const sendTokens = (res, accessToken, refreshToken) => {
  // Cookie options
  const accessTokenOptions = {
    expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',
  };

  const refreshTokenOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('accessToken', accessToken, accessTokenOptions);
  res.cookie('refreshToken', refreshToken, refreshTokenOptions);
};

// Register user
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return next(new AppError('Please provide name, email, and password', 400));
  }

  // Register user
  const { user, accessToken, refreshToken } = await authService.registerUser({
    name,
    email,
    password,
    role: role || 'buyer', // Default to buyer
  });

  // Send tokens
  sendTokens(res, accessToken, refreshToken);

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: { user },
  });
});

// Login user
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Login user
  const { user, accessToken, refreshToken } = await authService.loginUser(
    email,
    password
  );

  // Send tokens
  sendTokens(res, accessToken, refreshToken);

  res.status(200).json({
    status: 'success',
    message: 'Logged in successfully',
    data: { user },
  });
});

// Refresh access token
exports.refresh = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new AppError('Refresh token not found', 401));
  }

  // Generate new access token
  const { accessToken } = await authService.refreshAccessToken(refreshToken);

  // Send new access token
  res.cookie('accessToken', accessToken, {
    expires: new Date(Date.now() + 15 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({
    status: 'success',
    message: 'Access token refreshed',
  });
});

// Logout user
// Logout user (production-safe)
exports.logout = catchAsync(async (req, res, next) => {
  try {
    // Try to invalidate refresh token if user exists
    if (req.user?.id) {
      await authService.logoutUser(req.user.id);
    }
  } catch (err) {
    // Ignore errors → logout must NEVER fail
  }

  // Clear cookies safely
  res.cookie('accessToken', '', {
    expires: new Date(0),
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  res.cookie('refreshToken', '', {
    expires: new Date(0),
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});


// Get current user
exports.getMe = catchAsync(async (req, res, next) => {
  const User = require('../models/User');
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});