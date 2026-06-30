import mongoose from 'mongoose';

/**
 * Connects to MongoDB using the URI specified in environment variables.
 * Handles serverless execution environments (like Vercel) by checking readyState
 * and avoiding synchronous crashes or process exits.
 */
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('CRITICAL: MONGO_URI environment variable is missing.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    if (!process.env.VERCEL) {
      process.exit(1); // Only exit in traditional server environments
    }
  }
};

/**
 * Express middleware to ensure database connection is established.
 * Prevents API endpoints from hanging or crashing if the DB is offline.
 */
const dbStatusMiddleware = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(500).json({
      message: 'Database connection failed. Please check your MONGO_URI configuration in Vercel.',
    });
  }

  next();
};

export default connectDB;
export { dbStatusMiddleware };

