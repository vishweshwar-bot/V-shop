import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Route imports
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';

// Load environment variables from .env
dotenv.config();

// Connect to MongoDB Database (skip during automated testing, where we use in-memory db)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Body parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Standard logging middleware
app.use((req, res, next) => {
  // Silent logs during test mode
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);

// Stripe Client Config API (exposes public key/parameters if needed)
app.get('/api/config/stripe', (req, res) => {
  res.json({ publicKey: process.env.STRIPE_PUBLIC_KEY || '' });
});

// Root route
app.get('/', (req, res) => {
  res.send('API is running successfully...');
});

// Fallback for not found endpoints
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

let server;
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  server = app.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
  });
}

export { app, server };

