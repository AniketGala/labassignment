const express = require('express');
const router = express.Router();
const { addToWishlist, getWishlist, removeFromWishlist } = require('../controllers/wishlist.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All wishlist routes are protected
router.post('/:productId', authMiddleware, addToWishlist);
router.get('/', authMiddleware, getWishlist);
router.delete('/:productId', authMiddleware, removeFromWishlist);

module.exports = router;
