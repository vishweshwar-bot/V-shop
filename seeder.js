import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';
import Product from './models/productModel.js';
import Category from './models/categoryModel.js';

dotenv.config();

const categories = [
  { name: 'Electronics', description: 'Vibrant gadgets, computing power, and electronic utilities.' },
  { name: 'Audio', description: 'Headphones, earbuds, speakers, and premium acoustics.' },
  { name: 'Accessories', description: 'Keyboards, cables, mice, and desk setup accessories.' },
  { name: 'Wearables', description: 'Smartwatches, fitness bands, and wearable tech.' }
];

const sampleProducts = (adminId) => [
  {
    user: adminId,
    name: 'Premium Wireless Headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    brand: 'SoundMaster',
    category: 'Audio',
    description: 'Immerse yourself in deep acoustics featuring state-of-the-art active noise cancelling technology and up to 40 hours of continuous wireless playback.',
    price: 12500.00,
    countInStock: 10,
    rating: 0,
    numReviews: 0,
  },
  {
    user: adminId,
    name: 'Professional USB Microphone',
    image: 'https://images.unsplash.com/photo-1590608897129-79da98d15969?auto=format&fit=crop&w=600&q=80',
    brand: 'VocalGlow',
    category: 'Audio',
    description: 'Broadcast studio-grade vocal recordings directly to your computer. Features multi-pattern cardioid capture and zero-latency headphone outputs.',
    price: 7999.00,
    countInStock: 5,
    rating: 0,
    numReviews: 0,
  },
  {
    user: adminId,
    name: 'Mechanical Ergonomic Keyboard',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    brand: 'TypeCraft',
    category: 'Accessories',
    description: 'Premium RGB backlit mechanical keyboard featuring tactile brown switches, double-shot keycaps, and custom split layout for maximum comfort.',
    price: 14999.00,
    countInStock: 8,
    rating: 0,
    numReviews: 0,
  },
  {
    user: adminId,
    name: 'Wireless Noise Cancelling Earbuds',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
    brand: 'AcousticLite',
    category: 'Audio',
    description: 'Ultra-lightweight true wireless earbuds with hybrid noise cancelling, smart touch controls, IPX7 waterproof rating, and custom tuning companion app.',
    price: 5999.00,
    countInStock: 12,
    rating: 0,
    numReviews: 0,
  },
  {
    user: adminId,
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
    user: adminId,
    name: 'Portable Bluetooth Speaker',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80',
    brand: 'BoomBox',
    category: 'Audio',
    description: 'Vibrant 360-degree sound signature with deep bass. Featuring IPX7 dust-and-waterproofing, 24-hour runtime battery, and party-link stereo sync.',
    price: 2999.00,
    countInStock: 15,
    rating: 0,
    numReviews: 0,
  },
  {
    user: adminId,
    name: 'Smart Fitness Tracker Watch',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80',
    brand: 'FitBand',
    category: 'Wearables',
    description: 'Track your steps, heart rate, sleep quality, and active stress levels. Renders on a crystal-clear AMOLED display with 14-day battery life.',
    price: 4499.00,
    countInStock: 20,
    rating: 0,
    numReviews: 0,
  },
  {
    user: adminId,
    name: 'Precision Wireless Mouse',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
    brand: 'LogiTech',
    category: 'Accessories',
    description: 'Ergonomic precision wireless mouse with customizable shortcuts, hyper-fast scroll wheel, and high-precision sensor tracking on any surface.',
    price: 4999.00,
    countInStock: 14,
    rating: 0,
    numReviews: 0,
  },
  {
    user: adminId,
    name: 'Studio Reference Monitors',
    image: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=600&q=80',
    brand: 'AcousticPro',
    category: 'Audio',
    description: 'Professional active studio monitors delivering transparent audio reproduction, front-firing acoustic ports, and room-tuning EQ controls.',
    price: 19999.00,
    countInStock: 6,
    rating: 0,
    numReviews: 0,
  },
  {
    user: adminId,
    name: 'Walnut Desk Shelf',
    image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=600&q=80',
    brand: 'CraftWood',
    category: 'Accessories',
    description: 'Handcrafted solid walnut wood desk shelf designed to elevate your screen, clear desk space, and store workspace accessories underneath.',
    price: 6499.00,
    countInStock: 8,
    rating: 0,
    numReviews: 0,
  },
  {
    user: adminId,
    name: 'Active Noise Cancelling Earphones',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
    brand: 'SonicWave',
    category: 'Audio',
    description: 'Compact neckband bluetooth earphones featuring customizable ambient sound control, lightweight ergonomic design, and waterproof protection.',
    price: 3499.00,
    countInStock: 25,
    rating: 0,
    numReviews: 0,
  },
  {
    user: adminId,
    name: 'GPS Multisport Smartwatch',
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80',
    brand: 'TrailRun',
    category: 'Wearables',
    description: 'Rugged solar-charged multisport GPS watch with advanced training features, route mapping, heart rate, and offline music playback support.',
    price: 24999.00,
    countInStock: 7,
    rating: 0,
    numReviews: 0,
  },
  {
    user: adminId,
    name: 'Ultra-Wide Curved Monitor',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
    brand: 'ViewMax',
    category: 'Electronics',
    description: 'Immersive 34-inch 144Hz curved screen with aspect ratio 21:9, HDR10 content rendering, and USB-C power delivery interface.',
    price: 32999.00,
    countInStock: 5,
    rating: 0,
    numReviews: 0,
  },
];

const importData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    console.log(`Connecting to database at: ${mongoUri.split('@').pop()}`); // Log safely
    await mongoose.connect(mongoUri);

    console.log('Clearing existing database collections...');
    await Product.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();

    console.log('Inserting default categories...');
    await Category.insertMany(categories);
    console.log('✔ Categories successfully seeded.');

    console.log('Creating default admin user...');
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      isAdmin: true,
    });
    console.log(`✔ Admin created: admin@example.com / password123`);

    console.log('Inserting sample products...');
    const productsToSeed = sampleProducts(adminUser._id);
    await Product.insertMany(productsToSeed);
    console.log('✔ Sample products successfully seeded.');

    console.log('Data import complete!');
    process.exit(0);
  } catch (error) {
    console.error(`Error importing data: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoUri);

    console.log('Clearing all database collections...');
    await Product.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();

    console.log('Data destroyed!');
    process.exit(0);
  } catch (error) {
    console.error(`Error destroying data: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
