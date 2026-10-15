const express = require('express');
const router = express.Router();
const { createPaymentOrder, verifyPayment, getOrders, getOrderById } = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All order routes are protected
router.post('/create-payment-order', authMiddleware, createPaymentOrder);
router.post('/verify-payment', authMiddleware, verifyPayment);
router.get('/', authMiddleware, getOrders);
router.get('/:id', authMiddleware, getOrderById);

module.exports = router;
