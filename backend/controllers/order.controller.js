const crypto = require('crypto');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const razorpay = require('../config/razorpay');

const createPaymentOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress } = req.body;

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || 
        !shippingAddress.addressLine1 || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.pincode) {
      return res.status(400).json({ success: false, message: 'All shipping address fields are required' });
    }

    // Validate pincode (6 digits)
    if (!/^\d{6}$/.test(shippingAddress.pincode)) {
      return res.status(400).json({ success: false, message: 'Pincode must contain 6 digits' });
    }

    // Validate phone (10 digits)
    if (!/^\d{10}$/.test(shippingAddress.phone)) {
      return res.status(400).json({ success: false, message: 'Phone number must contain 10 digits' });
    }

    // Check Razorpay is configured BEFORE doing any DB work
    if (!razorpay) {
      return res.status(500).json({ 
        success: false, 
        message: 'Payment gateway not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the backend .env file (Test Mode keys).' 
      });
    }

    // Get customer with cart
    const customer = await Customer.findById(userId).populate({
      path: 'cart.product',
      select: 'name price category image stock description'
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Check if cart is empty
    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // Validate stock and get latest product data
    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of customer.cart) {
      // Handle missing populated product (deleted product case)
      if (!cartItem.product) {
        return res.status(400).json({ 
          success: false,
          message: `One or more products in your cart are no longer available. Please remove them and try again.` 
        });
      }

      const product = await Product.findById(cartItem.product._id);
      
      if (!product) {
        return res.status(400).json({ 
          success: false,
          message: `Product ${cartItem.product.name} is no longer available` 
        });
      }

      if (cartItem.quantity > product.stock) {
        return res.status(400).json({ 
          success: false,
          message: `Insufficient stock for ${product.name}. Only ${product.stock} units available.` 
        });
      }

      // Add to order items with snapshot
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image
      });

      totalAmount += product.price * cartItem.quantity;
    }

    // Create ShopKart order with PENDING_PAYMENT status
    const order = await Order.create({
      user: userId,
      items: orderItems,
      shippingAddress,
      totalAmount,
      paymentStatus: 'PENDING',
      status: 'PENDING_PAYMENT'
    });

    // Create Razorpay order (amount in paise)
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        receipt: order._id.toString()
      });
    } catch (rzpErr) {
      return res.status(500).json({
        success: false,
        message: `Razorpay error: ${rzpErr.message || rzpErr.description || 'Failed to create Razorpay order. Check your Test Mode API keys in .env.'}`
      });
    }

    // Save Razorpay order ID
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(201).json({
      success: true,
      shopKartOrderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('\n[ORDER ERROR] createPaymentOrder:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error while creating order' 
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user._id;

    // Find the order
    const order = await Order.findById(shopKartOrderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify order ownership (use ObjectId.equals() - robust to string/ObjectId type mismatch)
    if (!order.user || !order.user.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Verify Razorpay signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error('[VERIFY] Missing RAZORPAY_KEY_SECRET in env during signature check');
      return res.status(500).json({
        success: false,
        message: 'Server misconfiguration: missing key secret'
      });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.log('[VERIFY] Signature mismatch (expected vs received):', expectedSignature.slice(0,8) + '...', ' vs ', (razorpay_signature || '').slice(0,8) + '...');
      return res.status(400).json({ 
        success: false,
        message: 'Invalid payment signature' 
      });
    }

    // Update order status
    order.paymentStatus = 'PAID';
    order.status = 'PLACED';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // Clear user's cart
    const customer = await Customer.findById(userId);
    customer.cart = [];
    await customer.save();

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order
    });
  } catch (error) {
    console.error('\n[ORDER ERROR] verifyPayment:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error during payment verification' 
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('user', 'fullName email');

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('\n[ORDER ERROR] getOrders:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error loading orders' 
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const order = await Order.findById(id).populate('user', 'fullName email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify order ownership (populate returns a nested doc with ._id, check both paths with equals)
    const orderOwnerId = (order.user && order.user._id) ? order.user._id : order.user;
    if (!orderOwnerId || !orderOwnerId.equals(userId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('\n[ORDER ERROR] getOrderById:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error loading order' 
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrderById
};
