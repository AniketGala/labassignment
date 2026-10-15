const express = require('express');
const router = express.Router();
const { addToCart, getCart, updateQuantity, removeFromCart } = require('../controllers/cart.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All cart routes are protected
router.post('/:productId', authMiddleware, addToCart);
router.get('/', authMiddleware, getCart);
router.patch('/:productId', authMiddleware, updateQuantity);
router.delete('/:productId', authMiddleware, removeFromCart);

module.exports = router;
