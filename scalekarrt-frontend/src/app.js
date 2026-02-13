const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
// const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
// const xss = require('xss-clean');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middleware/errorHandler');

// ROUTES
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); // ⭐ ADD THIS
const adminRoutes = require('./routes/adminRoutes'); 

const app = express();


// ========================================
// 1. SECURITY MIDDLEWARE
// ========================================

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Rate limit
const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Cookies
app.use(cookieParser());

// Prevent HTTP param pollution
app.use(hpp());

// NoSQL injection protection
// app.use(mongoSanitize());

// XSS protection
// app.use(xss());


// ========================================
// 2. RAZORPAY WEBHOOK RAW BODY
// ⚠️ MUST be BEFORE express.json()
// ========================================

app.use(
  '/api/v1/payments/webhook',
  express.raw({ type: 'application/json' })
);


// ========================================
// 3. BODY PARSER
// ========================================

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));


// ========================================
// 4. HEALTH CHECK
// ========================================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'ScaleKarrt API is running',
  });
});


// ========================================
// 5. API ROUTES
// ========================================

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes); // ⭐ ADD THIS
app.use('/api/v1/admin', adminRoutes); 


// ========================================
// 6. HANDLE UNKNOWN ROUTES
// ========================================

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});


// ========================================
// 7. GLOBAL ERROR HANDLER
// ========================================

app.use(globalErrorHandler);

module.exports = app;
