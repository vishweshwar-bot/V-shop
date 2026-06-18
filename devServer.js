import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function start() {
  console.log('\n==================================================');
  console.log('STARTING DEVELOPMENT SERVER WITH IN-MEMORY DATABASE');
  console.log('==================================================\n');

  // Start in-memory database
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  console.log(`✔ In-Memory MongoDB database started at: ${uri}`);

  // Override MONGO_URI in process.env so that Mongoose connects to this in-memory instance
  process.env.MONGO_URI = uri;

  // Dynamically import server.js to ensure it reads the overridden MONGO_URI
  const { app } = await import('./server.js');

  // Seed sample data if database is empty
  try {
    const User = (await import('./models/userModel.js')).default;
    const Product = (await import('./models/productModel.js')).default;
    const Category = (await import('./models/categoryModel.js')).default;

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database empty. Seeding initial development data...');

      // Seed Categories
      const categories = [
        { name: 'Electronics', description: 'Vibrant gadgets, computing power, and electronic utilities.' },
        { name: 'Audio', description: 'Headphones, earbuds, speakers, and premium acoustics.' },
        { name: 'Accessories', description: 'Keyboards, cables, mice, and desk setup accessories.' },
        { name: 'Wearables', description: 'Smartwatches, fitness bands, and wearable tech.' }
      ];
      await Category.insertMany(categories);
      console.log('✔ Default categories successfully seeded.');

      // Seed Default Admin
      const adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        isAdmin: true,
      });
      console.log(`✔ Default Admin created: admin@example.com / password123`);

      // Seed Sample Products
      const sampleProducts = [
        {
          user: adminUser._id,
          name: 'Premium Wireless Headphones',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
          brand: 'SoundMaster',
          category: 'Electronics',
          description: 'Immerse yourself in deep acoustics featuring state-of-the-art active noise cancelling technology and up to 40 hours of continuous wireless playback.',
          price: 12500.00,
          countInStock: 10,
          rating: 0,
          numReviews: 0,
        },
        {
          user: adminUser._id,
          name: 'Professional USB Microphone',
          image: 'https://images.unsplash.com/photo-1590608897129-79da98d15969?auto=format&fit=crop&w=600&q=80',
          brand: 'VocalGlow',
          category: 'Electronics',
          description: 'Broadcast studio-grade vocal recordings directly to your computer. Features multi-pattern cardioid capture and zero-latency headphone outputs.',
          price: 7999.00,
          countInStock: 5,
          rating: 0,
          numReviews: 0,
        },
        {
          user: adminUser._id,
          name: 'Mechanical Ergonomic Keyboard',
          image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
          brand: 'TypeCraft',
          category: 'Electronics',
          description: 'Premium RGB backlit mechanical keyboard featuring tactile brown switches, double-shot keycaps, and custom split layout for maximum comfort.',
          price: 14999.00,
          countInStock: 8,
          rating: 0,
          numReviews: 0,
        },
        {
          user: adminUser._id,
          name: 'Wireless Noise Cancelling Earbuds',
          image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
          brand: 'AcousticLite',
          category: 'Electronics',
          description: 'Ultra-lightweight true wireless earbuds with hybrid noise cancelling, smart touch controls, IPX7 waterproof rating, and custom tuning companion app.',
          price: 5999.00,
          countInStock: 12,
          rating: 0,
          numReviews: 0,
        },
        {
          user: adminUser._id,
          name: '4K Ultra HD Action Camera',
          image: 'https://images.unsplash.com/photo-1502920917128-1aa34b774301?auto=format&fit=crop&w=600&q=80',
          brand: 'ActionGear',
          category: 'Electronics',
          description: 'Capture your adventures in stunning native 4K resolution. Features hyper-smooth electronic image stabilization, 131ft waterproof case, and dual screens.',
          price: 11999.00,
          countInStock: 4,
          rating: 0,
          numReviews: 0,
        },
        {
          user: adminUser._id,
          name: 'Portable Bluetooth Speaker',
          image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80',
          brand: 'BoomBox',
          category: 'Electronics',
          description: 'Vibrant 360-degree sound signature with deep bass. Featuring IPX7 dust-and-waterproofing, 24-hour runtime battery, and party-link stereo sync.',
          price: 2999.00,
          countInStock: 15,
          rating: 0,
          numReviews: 0,
        },
        {
          user: adminUser._id,
          name: 'Smart Fitness Tracker Watch',
          image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80',
          brand: 'FitBand',
          category: 'Electronics',
          description: 'Track your steps, heart rate, sleep quality, and active stress levels. Renders on a crystal-clear AMOLED display with 14-day battery life.',
          price: 4499.00,
          countInStock: 20,
          rating: 0,
          numReviews: 0,
        },
      ];

      await Product.insertMany(sampleProducts);
      console.log('✔ Sample products successfully seeded.');
    }
  } catch (err) {
    console.error('Failed to seed development data:', err.message);
  }

  // Handle graceful shutdowns
  const handleShutdown = async () => {
    console.log('\n\nGracefully closing connections...');
    const mongoose = (await import('mongoose')).default;
    await mongoose.disconnect();
    await mongoServer.stop();
    console.log('Connections closed. Exit.');
    process.exit(0);
  };

  process.on('SIGINT', handleShutdown);
  process.on('SIGTERM', handleShutdown);
}

start().catch((err) => {
  console.error('Failed to boot local development server:', err);
});
