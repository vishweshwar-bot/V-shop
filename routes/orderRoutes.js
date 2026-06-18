import express from 'express';
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  createStripePaymentIntent,
  getSalesAnalytics,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create order (User) or fetch all orders (Admin)
router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);

// Fetch logged in user's orders (Must be placed before /:id)
router.route('/mine').get(protect, getMyOrders);

// Fetch Sales Analytics (Admin only, must be placed before /:id)
router.route('/analytics').get(protect, admin, getSalesAnalytics);

// Fetch order details by ID
router.route('/:id').get(protect, getOrderById);

// Update order to paid
router.route('/:id/pay').put(protect, updateOrderToPaid);

// Create Stripe Payment Intent for an order
router.route('/:id/stripe-payment-intent').post(protect, createStripePaymentIntent);

// Update order to delivered (Admin)
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);

export default router;
