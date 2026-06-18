import asyncHandler from '../middleware/asyncHandler.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import Stripe from 'stripe';

// Initialize Stripe instance
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
const addOrderItems = asyncHandler(async (req, res, next) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    return next(new Error('No order items'));
  }

  // --- SECURE ORDER PRICE CALCULATION ---
  // To prevent client-side price manipulation (e.g., requesting a $1000 item for $1),
  // we look up each product in the database, grab its authorized price, and compute totals.
  let itemsPrice = 0;
  const verifiedOrderItems = [];

  for (const item of orderItems) {
    const dbProduct = await Product.findById(item.product);
    if (!dbProduct) {
      res.status(404);
      return next(new Error(`Product not found: ${item.product}`));
    }

    // Verify stock availability
    if (dbProduct.countInStock < item.qty) {
      res.status(400);
      return next(new Error(`Not enough stock for ${dbProduct.name}`));
    }

    const itemPrice = dbProduct.price;
    itemsPrice += itemPrice * item.qty;

    verifiedOrderItems.push({
      product: dbProduct._id,
      name: dbProduct.name,
      image: dbProduct.image,
      price: itemPrice,
      qty: item.qty,
    });
  }

  // Shipping cost: free if order items exceed ₹5000, otherwise flat rate of ₹150
  const shippingPrice = itemsPrice > 5000 ? 0 : 150;

  // Tax cost: standard 15% sales tax rate
  const taxPrice = Number((0.15 * itemsPrice).toFixed(2));

  // Total cost calculation
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  // Save the verified details to MongoDB
  const order = new Order({
    orderItems: verifiedOrderItems,
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  const createdOrder = await order.save();

  // Deduct stock levels for purchased items
  for (const item of verifiedOrderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { countInStock: -item.qty },
    });
  }

  res.status(201).json(createdOrder);
});

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = asyncHandler(async (req, res, next) => {
  // Populate user name and email from User collection
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    // Only allow the owner or an admin to fetch order details
    if (
      req.user.isAdmin ||
      order.user._id.toString() === req.user._id.toString()
    ) {
      res.json(order);
    } else {
      res.status(403);
      return next(new Error('Not authorized to view this order'));
    }
  } else {
    res.status(404);
    return next(new Error('Order not found'));
  }
});

/**
 * @desc    Update order to paid
 * @route   PUT /api/orders/:id/pay
 * @access  Private
 */
const updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // Security check: Only the order owner or an admin can update payment status
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(403);
      return next(new Error('Not authorized to update this order payment status'));
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    // Save details returned from Stripe checkout or payment gateway
    order.paymentResult = {
      id: req.body.id || `manual_${Math.random().toString(36).substring(7)}`,
      status: req.body.status || 'succeeded',
      update_time: req.body.update_time || new Date().toISOString(),
      email_address: req.body.email_address || req.user.email,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    return next(new Error('Order not found'));
  }
});

/**
 * @desc    Update order to delivered
 * @route   PUT /api/orders/:id/deliver
 * @access  Private/Admin
 */
const updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    return next(new Error('Order not found'));
  }
});

/**
 * @desc    Get logged in user orders
 * @route   GET /api/orders/mine
 * @access  Private
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private/Admin
 */
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
});

/**
 * @desc    Create Stripe Payment Intent
 * @route   POST /api/orders/:id/stripe-payment-intent
 * @access  Private
 */
const createStripePaymentIntent = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // Only allow order owner to pay
    if (order.user.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Not authorized to pay for this order'));
    }

    if (order.isPaid) {
      res.status(400);
      return next(new Error('Order is already paid'));
    }

    // Stripe expects the amount in cents (integer value)
    const amountInCents = Math.round(order.totalPrice * 100);

    let clientSecret;

    // Detect mock configuration or test environment to prevent API failures
    if (
      process.env.NODE_ENV === 'test' ||
      !process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY.startsWith('sk_test_placeholder') ||
      process.env.STRIPE_SECRET_KEY.startsWith('sk_test_mock')
    ) {
      // Simulate client secret creation for verification environments
      clientSecret = `pi_mock_${Math.random().toString(36).substring(2)}_secret_${Math.random().toString(36).substring(2)}`;
    } else {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        metadata: {
          orderId: order._id.toString(),
        },
      });
      clientSecret = paymentIntent.client_secret;
    }

    res.json({
      clientSecret,
    });
  } else {
    res.status(404);
    return next(new Error('Order not found'));
  }
});

/**
 * @desc    Get Sales Analytics
 * @route   GET /api/orders/analytics
 * @access  Private/Admin
 */
const getSalesAnalytics = asyncHandler(async (req, res) => {
  // 1. Total Sales (aggregate paid orders totalPrice)
  const paidOrders = await Order.find({ isPaid: true });
  const totalSales = paidOrders.reduce((acc, order) => acc + order.totalPrice, 0);

  // 2. Count metrics
  const numOrders = await Order.countDocuments();
  const numUsers = await User.countDocuments();
  const numProducts = await Product.countDocuments();

  // 3. Sales by Date (group paid orders by day)
  const salesByDateMap = {};
  paidOrders.forEach((order) => {
    const dateStr = order.paidAt
      ? order.paidAt.toISOString().substring(0, 10)
      : order.createdAt.toISOString().substring(0, 10);
    salesByDateMap[dateStr] = (salesByDateMap[dateStr] || 0) + order.totalPrice;
  });
  const salesByDate = Object.keys(salesByDateMap)
    .map((date) => ({
      date,
      amount: Number(salesByDateMap[date].toFixed(2)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // 4. Products by Category (Category management dashboard counts)
  const products = await Product.find({});
  const categoryMap = {};
  products.forEach((product) => {
    categoryMap[product.category] = (categoryMap[product.category] || 0) + 1;
  });
  const productsByCategory = Object.keys(categoryMap).map((category) => ({
    category,
    count: categoryMap[category],
  }));

  // 5. Recent sales report (last 5 paid orders with user populated)
  const recentSales = await Order.find({ isPaid: true })
    .sort({ paidAt: -1 })
    .limit(5)
    .populate('user', 'name');

  res.json({
    totalSales: Number(totalSales.toFixed(2)),
    numOrders,
    numUsers,
    numProducts,
    salesByDate,
    productsByCategory,
    recentSales,
  });
});

export {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  createStripePaymentIntent,
  getSalesAnalytics,
};
