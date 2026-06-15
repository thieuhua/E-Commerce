require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const errorHandler = require('./middlewares/errorHandler');

// Routes
const authRoutes     = require('./modules/auth/auth.routes');
const productRoutes  = require('./modules/product/product.routes');
const catalogRoutes  = require('./modules/product/catalog.routes');
const addressRoutes  = require('./modules/address/address.routes');
const cartRoutes     = require('./modules/cart/cart.routes');
const orderRoutes    = require('./modules/order/order.routes');
const paymentRoutes  = require('./modules/payment/payment.routes');
const shipmentRoutes = require('./modules/shipment/shipment.routes');
const reviewRoutes   = require('./modules/review/review.routes');
const couponRoutes   = require('./modules/coupon/coupon.routes');
const userRoutes     = require('./modules/user/user.routes')
const adminRoutes    = require('./modules/admin/admin.routes')

const app = express();

// ── Security & Logging ─────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Rate limiting ──────────────────────────────────────────
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many requests' }));
app.use('/api',      rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// ── Body parsing ───────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Static files ───────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));

// ── API Routes ─────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/products',  productRoutes);
app.use('/api',           catalogRoutes);   // /api/categories, /api/brands
app.use('/api/addresses', addressRoutes);
app.use('/api/cart',      cartRoutes);
app.use('/api/orders',    orderRoutes);
app.use('/api/payments',  paymentRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/reviews',   reviewRoutes);
app.use('/api/coupons',   couponRoutes);
app.use('/api/users',     userRoutes)
app.use('/api/admin',     adminRoutes);

app.get('/health', (req, res) =>
  res.json({ status: 'ok', uptime: process.uptime(), env: process.env.NODE_ENV }));

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

app.use(errorHandler);

const start = async () => {
  try {
    await connectDB();
    await connectRedis();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
};

start();
module.exports = app;
