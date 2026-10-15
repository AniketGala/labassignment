const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

const addToCart = async (req, res) => {
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

    // Get customer
    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Initialize cart if it doesn't exist
    if (!customer.cart) {
      customer.cart = [];
    }

    // Check if product is already in cart
    const existingCartItem = customer.cart.find(
      item => item.product.toString() === productId
    );

    if (existingCartItem) {
      // Increase quantity by 1
      const newQuantity = existingCartItem.quantity + 1;
      
      // Check stock availability
      if (newQuantity > product.stock) {
        return res.status(400).json({ 
          message: `Only ${product.stock} units available in stock` 
        });
      }

      existingCartItem.quantity = newQuantity;
    } else {
      // Add new item with quantity 1
      if (product.stock < 1) {
        return res.status(400).json({ 
          message: 'Product is out of stock' 
        });
      }

      customer.cart.push({
        product: productId,
        quantity: 1
      });
    }

    await customer.save();

    // Return updated cart
    const updatedCustomer = await Customer.findById(userId).populate({
      path: 'cart.product',
      select: 'name price category image stock description'
    });

    res.status(201).json({
      success: true,
      message: 'Cart updated',
      cart: updatedCustomer.cart || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find customer and populate cart products
    const customer = await Customer.findById(userId).populate({
      path: 'cart.product',
      select: 'name price category image stock description'
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Handle case where cart might be null
    const cart = customer.cart || [];

    res.json({
      success: true,
      cart: cart
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Validate quantity
    if (typeof quantity !== 'number' || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    // Get customer
    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Initialize cart if it doesn't exist
    if (!customer.cart) {
      customer.cart = [];
    }

    // Find cart item
    const cartItem = customer.cart.find(
      item => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({ message: 'Product not in cart' });
    }

    // Get product to check stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check stock availability
    if (quantity > product.stock) {
      return res.status(400).json({ 
        message: `Only ${product.stock} units available in stock` 
      });
    }

    // Update quantity
    cartItem.quantity = quantity;
    await customer.save();

    // Return updated cart
    const updatedCustomer = await Customer.findById(userId).populate({
      path: 'cart.product',
      select: 'name price category image stock description'
    });

    res.json({
      success: true,
      message: 'Quantity updated',
      cart: updatedCustomer.cart || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const removeFromCart = async (req, res) => {
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

    // Initialize cart if it doesn't exist
    if (!customer.cart) {
      customer.cart = [];
    }

    // Check if product is in cart
    const cartItemIndex = customer.cart.findIndex(
      item => item.product.toString() === productId
    );

    if (cartItemIndex === -1) {
      return res.status(404).json({ message: 'Product not in cart' });
    }

    // Remove product from cart
    customer.cart.splice(cartItemIndex, 1);
    await customer.save();

    // Return updated cart
    const updatedCustomer = await Customer.findById(userId).populate({
      path: 'cart.product',
      select: 'name price category image stock description'
    });

    res.json({
      success: true,
      message: 'Product removed from cart',
      cart: updatedCustomer.cart || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart
};
