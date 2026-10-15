require('dotenv').config();
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

console.log('\n=== ENV DIAGNOSTIC ===');
console.log('MONGODB_URI set?', !!process.env.MONGODB_URI, 
  process.env.MONGODB_URI ? `(${process.env.MONGODB_URI.slice(0,20)}...)` : '');
console.log('JWT_SECRET set?', !!process.env.JWT_SECRET, 
  process.env.JWT_SECRET ? `(${process.env.JWT_SECRET.slice(0,10)}...)` : '');
console.log('RAZORPAY_KEY_ID set?', !!process.env.RAZORPAY_KEY_ID, 
  process.env.RAZORPAY_KEY_ID ? `(${process.env.RAZORPAY_KEY_ID})` : '');
console.log('RAZORPAY_KEY_SECRET set?', !!process.env.RAZORPAY_KEY_SECRET, 
  process.env.RAZORPAY_KEY_SECRET ? `(length: ${process.env.RAZORPAY_KEY_SECRET.length})` : '');
console.log('=====================\n');

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const customerRoutes = require('./routes/customer.routes');
const productRoutes = require('./routes/product.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');

const app = express();

// Simple request logger (helpful for debugging 500s)
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  const originalEnd = res.end.bind(res);
  res.end = (chunk, encoding) => {
    if (res.statusCode >= 400) {
      console.log(`    → ${res.statusCode} ${req.method} ${req.url}`);
    }
    return originalEnd(chunk, encoding);
  };
  next();
});

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow any localhost origin during development
    if (origin.match(/^http:\/\/localhost:\d+$/)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
