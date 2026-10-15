const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get customer and check if product is already in wishlist
    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Initialize wishlist if it doesn't exist
    if (!customer.wishlist) {
      customer.wishlist = [];
    }

    // Check if product is already in wishlist
    if (customer.wishlist.some(id => id.toString() === productId)) {
      return res.status(409).json({ message: 'Product already in wishlist' });
    }

    // Add product to wishlist
    customer.wishlist.push(productId);
    await customer.save();

    res.status(201).json({
      success: true,
      message: 'Product added to wishlist'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find customer and populate wishlist
    const customer = await Customer.findById(userId).populate({
      path: 'wishlist',
      select: 'name price category image stock description'
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Handle case where wishlist might be null
    const wishlist = customer.wishlist || [];

    res.json({
      success: true,
      count: wishlist.length,
      wishlist: wishlist
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Get customer
    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check if product is in wishlist
    if (!customer.wishlist || !customer.wishlist.some(id => id.toString() === productId)) {
      return res.status(404).json({ message: 'Product not in wishlist' });
    }

    // Remove product from wishlist
    customer.wishlist = customer.wishlist.filter(id => id.toString() !== productId);
    await customer.save();

    res.json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist
};
