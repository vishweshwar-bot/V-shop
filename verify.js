// Set env variables before importing modules
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_for_jwt_verification_123';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_stripe_key_for_testing';

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from './server.js';
import User from './models/userModel.js';
import Product from './models/productModel.js';
import Order from './models/orderModel.js';

let mongoServer;
let server;
let baseUrl;

// Test state variables
let userToken = '';
let userId = '';
let productId = '';
let orderId = '';

async function setup() {
  console.log('\n--- SETTING UP TEST ENVIRONMENT ---');
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  console.log(`In-Memory MongoDB started at: ${mongoUri}`);

  await mongoose.connect(mongoUri);
  console.log('Connected to Mongoose in-memory database');

  // Start Express on a dynamic port
  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;
  console.log(`Test server running at: ${baseUrl}`);
}

async function runTests() {
  try {
    console.log('\n--- RUNNING API INTEGRATION TESTS ---');

    // ==========================================
    // 1. USER REGISTRATION
    // ==========================================
    console.log('\n[TEST 1] Registering a new user (POST /api/users)...');
    const regRes = await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Vishweshwar',
        email: 'vishweshwar@example.com',
        password: 'password123',
      }),
    });
    const regData = await regRes.json();
    if (regRes.status !== 201 || !regData.token) {
      throw new Error(`User registration failed! Status: ${regRes.status}, Message: ${regData.message}`);
    }
    userToken = regData.token;
    userId = regData._id;
    console.log(`✔ User registered successfully. ID: ${userId}, Admin: ${regData.isAdmin}`);

    // ==========================================
    // 2. USER LOGIN
    // ==========================================
    console.log('\n[TEST 2] Logging in user (POST /api/users/login)...');
    const loginRes = await fetch(`${baseUrl}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'vishweshwar@example.com',
        password: 'password123',
      }),
    });
    const loginData = await loginRes.json();
    if (loginRes.status !== 200 || !loginData.token) {
      throw new Error(`User login failed! Status: ${loginRes.status}, Message: ${loginData.message}`);
    }
    console.log(`✔ User logged in successfully.`);

    // ==========================================
    // 3. USER PROFILE
    // ==========================================
    console.log('\n[TEST 3] Fetching user profile (GET /api/users/profile)...');
    const profileRes = await fetch(`${baseUrl}/api/users/profile`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const profileData = await profileRes.json();
    if (profileRes.status !== 200 || profileData.email !== 'vishweshwar@example.com') {
      throw new Error(`Profile query failed! Status: ${profileRes.status}`);
    }
    console.log(`✔ Profile retrieved: ${profileData.name} (${profileData.email})`);

    // ==========================================
    // 4. UPDATE USER PROFILE
    // ==========================================
    console.log('\n[TEST 4] Updating user profile (PUT /api/users/profile)...');
    const updateRes = await fetch(`${baseUrl}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        name: 'Vishweshwar Updated',
      }),
    });
    const updateData = await updateRes.json();
    if (updateRes.status !== 200 || updateData.name !== 'Vishweshwar Updated') {
      throw new Error(`Profile update failed! Status: ${updateRes.status}`);
    }
    userToken = updateData.token; // update token
    console.log(`✔ Profile updated successfully. New Name: ${updateData.name}`);

    // ==========================================
    // 5. ADMIN VERIFICATION (ROUTING CHECK)
    // ==========================================
    console.log('\n[TEST 5] Testing Admin route access control (GET /api/users)...');
    const adminCheckRes = await fetch(`${baseUrl}/api/users`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (adminCheckRes.status !== 401) {
      throw new Error(`Non-admin gained access to admin route! Status: ${adminCheckRes.status}`);
    }
    console.log('✔ Access denied for non-admin user as expected.');

    // Manually promote user to admin in DB
    console.log('Promoting user to admin role directly in database...');
    await User.findByIdAndUpdate(userId, { isAdmin: true });

    console.log('Retrying admin route access...');
    const adminRes = await fetch(`${baseUrl}/api/users`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const adminData = await adminRes.json();
    if (adminRes.status !== 200 || !Array.isArray(adminData)) {
      throw new Error(`Admin failed to access user list! Status: ${adminRes.status}`);
    }
    console.log(`✔ Admin access granted. Found ${adminData.length} users in the system.`);

    // ==========================================
    // 6. PRODUCT CREATION (ADMIN)
    // ==========================================
    console.log('\n[TEST 6] Admin creating product (POST /api/products)...');
    const prodCreateRes = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const prodCreateData = await prodCreateRes.json();
    if (prodCreateRes.status !== 201) {
      throw new Error(`Product creation failed! Status: ${prodCreateRes.status}`);
    }
    productId = prodCreateData._id;
    console.log(`✔ Product created successfully. ID: ${productId}`);

    // ==========================================
    // 7. PRODUCT FETCH & PAGINATION & SEARCH
    // ==========================================
    console.log('\n[TEST 7] Fetching products (GET /api/products)...');
    const prodFetchRes = await fetch(`${baseUrl}/api/products`);
    const prodFetchData = await prodFetchRes.json();
    if (prodFetchRes.status !== 200 || prodFetchData.products.length !== 1) {
      throw new Error(`Product fetch failed! Count: ${prodFetchData.products.length}`);
    }
    console.log(`✔ Retrieved products. Total in DB: ${prodFetchData.total}, Page: ${prodFetchData.page} of ${prodFetchData.pages}`);

    console.log('Searching products with keyword "Sample" (GET /api/products?keyword=Sample)...');
    const searchRes = await fetch(`${baseUrl}/api/products?keyword=Sample`);
    const searchData = await searchRes.json();
    if (searchRes.status !== 200 || searchData.products.length === 0) {
      throw new Error('Keyword search failed to match created sample product!');
    }
    console.log(`✔ Search matched ${searchData.products.length} product(s).`);

    // ==========================================
    // 8. UPDATE PRODUCT (ADMIN)
    // ==========================================
    console.log('\n[TEST 8] Admin updating product details (PUT /api/products/:id)...');
    const prodUpdateRes = await fetch(`${baseUrl}/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        name: 'Premium Wireless Headphones',
        price: 3000.0,
        description: 'Noise cancelling overhead bluetooth headphones.',
        brand: 'SoundMaster',
        category: 'Electronics',
        countInStock: 10,
      }),
    });
    const prodUpdateData = await prodUpdateRes.json();
    if (prodUpdateRes.status !== 200 || prodUpdateData.price !== 3000.0) {
      throw new Error(`Product update failed! Status: ${prodUpdateRes.status}`);
    }
    console.log(`✔ Product updated. New Name: "${prodUpdateData.name}", Price: ₹${prodUpdateData.price}, Stock: ${prodUpdateData.countInStock}`);

    // ==========================================
    // 9. CREATE PRODUCT REVIEW
    // ==========================================
    console.log('\n[TEST 9] Adding product review (POST /api/products/:id/reviews)...');
    const reviewRes = await fetch(`${baseUrl}/api/products/${productId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        rating: 5,
        comment: 'Absolutely amazing sound quality!',
      }),
    });
    const reviewData = await reviewRes.json();
    if (reviewRes.status !== 201) {
      throw new Error(`Failed to add review! Status: ${reviewRes.status}, Message: ${reviewData.message}`);
    }
    console.log('✔ Review added successfully.');

    console.log('Attempting duplicate review from same user...');
    const duplicateReviewRes = await fetch(`${baseUrl}/api/products/${productId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        rating: 4,
        comment: 'Second thoughts...',
      }),
    });
    if (duplicateReviewRes.status !== 400) {
      throw new Error(`Duplicate review restriction bypassed! Status: ${duplicateReviewRes.status}`);
    }
    console.log('✔ Duplicate review blocked successfully.');

    // Fetch product to verify rating and reviews count
    const prodVerifyRes = await fetch(`${baseUrl}/api/products/${productId}`);
    const prodVerifyData = await prodVerifyRes.json();
    if (prodVerifyData.numReviews !== 1 || prodVerifyData.rating !== 5) {
      throw new Error(`Product ratings aggregation incorrect! Rating: ${prodVerifyData.rating}, Reviews Count: ${prodVerifyData.numReviews}`);
    }
    console.log(`✔ Ratings verification passed. Rating: ${prodVerifyData.rating}/5, Total reviews: ${prodVerifyData.numReviews}`);

    // ==========================================
    // 10. ORDER PLACEMENT & SECURE PRICING
    // ==========================================
    console.log('\n[TEST 10] Submitting new order with custom/manipulated client prices (POST /api/orders)...');
    const orderRes = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        orderItems: [
          {
            product: productId,
            qty: 2,
            name: 'Attempt to bypass price',
            price: 1.0, // Manipulated price
            image: '/images/cheat.jpg',
          },
        ],
        shippingAddress: {
          address: '123 Tech Lane',
          city: 'Bangalore',
          postalCode: '560001',
          country: 'India',
        },
        paymentMethod: 'Stripe',
      }),
    });
    const orderData = await orderRes.json();
    if (orderRes.status !== 201) {
      throw new Error(`Order placement failed! Status: ${orderRes.status}, Message: ${orderData.message}`);
    }
    orderId = orderData._id;

    // --- Price verification assertions ---
    // Product price is ₹3000.00
    // qty is 2 -> itemsPrice must be ₹6000.00
    // itemsPrice > ₹5000 -> shippingPrice must be ₹0.00
    // taxPrice is 15% -> taxPrice must be ₹900.00
    // totalPrice must be ₹6900.00
    if (
      orderData.itemsPrice !== 6000.0 ||
      orderData.shippingPrice !== 0.0 ||
      orderData.taxPrice !== 900.0 ||
      orderData.totalPrice !== 6900.0
    ) {
      throw new Error(
        `Secure pricing validation failed! Returned pricing values: \n` +
          `Items: ${orderData.itemsPrice} (Expected: 6000)\n` +
          `Shipping: ${orderData.shippingPrice} (Expected: 0)\n` +
          `Tax: ${orderData.taxPrice} (Expected: 900)\n` +
          `Total: ${orderData.totalPrice} (Expected: 6900)`
      );
    }
    console.log(`✔ Secure pricing verification passed: `);
    console.log(`   Items Price (Server calculated): ₹${orderData.itemsPrice}`);
    console.log(`   Shipping Price: ₹${orderData.shippingPrice}`);
    console.log(`   Tax: ₹${orderData.taxPrice}`);
    console.log(`   Total: ₹${orderData.totalPrice}`);

    // Verify stock has decreased
    const postOrderProdRes = await fetch(`${baseUrl}/api/products/${productId}`);
    const postOrderProdData = await postOrderProdRes.json();
    if (postOrderProdData.countInStock !== 8) {
      throw new Error(`Inventory deduction failed! Current Stock: ${postOrderProdData.countInStock} (Expected: 8)`);
    }
    console.log(`✔ Stock deduction verified. Pre-order stock: 10, current stock: ${postOrderProdData.countInStock}`);

    // ==========================================
    // 11. FETCH ORDER BY ID
    // ==========================================
    console.log('\n[TEST 11] Fetching order by ID (GET /api/orders/:id)...');
    const getOrderRes = await fetch(`${baseUrl}/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const getOrderData = await getOrderRes.json();
    if (getOrderRes.status !== 200 || getOrderData.user.email !== 'vishweshwar@example.com') {
      throw new Error(`Order fetch by ID failed! Status: ${getOrderRes.status}`);
    }
    console.log(`✔ Order details retrieved for User: ${getOrderData.user.name}`);

    // ==========================================
    // 12. STRIPE PAYMENT INTENT CREATION
    // ==========================================
    console.log('\n[TEST 12] Creating Stripe Payment Intent (POST /api/orders/:id/stripe-payment-intent)...');
    const paymentIntentRes = await fetch(`${baseUrl}/api/orders/${orderId}/stripe-payment-intent`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const paymentIntentData = await paymentIntentRes.json();
    if (paymentIntentRes.status !== 200 || !paymentIntentData.clientSecret) {
      throw new Error(`Stripe payment intent creation failed! Status: ${paymentIntentRes.status}`);
    }
    console.log('✔ Stripe Payment Intent created successfully. clientSecret retrieved.');

    // ==========================================
    // 13. UPDATE ORDER STATUS TO PAID
    // ==========================================
    console.log('\n[TEST 13] Marking order as paid (PUT /api/orders/:id/pay)...');
    const payRes = await fetch(`${baseUrl}/api/orders/${orderId}/pay`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        id: 'ch_mockstripepaymentid123',
        status: 'succeeded',
        update_time: new Date().toISOString(),
        email_address: 'vishweshwar@example.com',
      }),
    });
    const payData = await payRes.json();
    if (payRes.status !== 200 || !payData.isPaid) {
      throw new Error(`Failed to update order to paid! Status: ${payRes.status}`);
    }
    console.log(`✔ Order marked as Paid. Paid At: ${payData.paidAt}`);

    // ==========================================
    // 14. UPDATE ORDER STATUS TO DELIVERED (ADMIN)
    // ==========================================
    console.log('\n[TEST 14] Admin updating order to delivered (PUT /api/orders/:id/deliver)...');
    const deliverRes = await fetch(`${baseUrl}/api/orders/${orderId}/deliver`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const deliverData = await deliverRes.json();
    if (deliverRes.status !== 200 || !deliverData.isDelivered) {
      throw new Error(`Failed to update order to delivered! Status: ${deliverRes.status}`);
    }
    console.log(`✔ Order marked as Delivered. Delivered At: ${deliverData.deliveredAt}`);

    // ==========================================
    // 15. FILE UPLOAD (MULTER)
    // ==========================================
    console.log('\n[TEST 15] Uploading image file (POST /api/upload)...');
    const formData = new FormData();
    // Simulate image uploading
    const blob = new Blob(['mock jpeg file buffer content'], { type: 'image/jpeg' });
    formData.append('image', blob, 'test-image.jpg');

    const uploadRes = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      body: formData,
    });
    const uploadData = await uploadRes.json();
    if (uploadRes.status !== 201 || !uploadData.image) {
      throw new Error(`File upload failed! Status: ${uploadRes.status}, Message: ${uploadData.message}`);
    }
    console.log(`✔ Image uploaded successfully. File path: ${uploadData.image}`);

    // Clean check static folder serving
    console.log(`Fetching uploaded image static route (GET ${uploadData.image})...`);
    const staticRes = await fetch(`${baseUrl}${uploadData.image}`);
    if (staticRes.status !== 200) {
      throw new Error(`Static uploads file routing failed! Status: ${staticRes.status}`);
    }
    console.log('✔ Static file retrieved successfully.');

    // Cleanup uploaded file
    try {
      const serverPath = `./${uploadData.image.substring(1)}`;
      if (fs.existsSync(serverPath)) {
        fs.unlinkSync(serverPath);
        console.log('✔ Cleaned up mock uploaded file.');
      }
    } catch (err) {
      console.warn('Unable to clean up temporary test file:', err.message);
    }

    console.log('\n✔ ✔ ✔ ALL API INTEGRATION TESTS PASSED SUCCESSFULLY! ✔ ✔ ✔\n');
  } catch (error) {
    console.error('\n✖ ✖ ✖ TEST SUITE RUNTIME FAILURE! ✖ ✖ ✖');
    console.error(error);
    process.exitCode = 1;
  } finally {
    // Teardown
    console.log('\n--- CLEANING UP ENVIRONMENT ---');
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      console.log('Stopped Express local server');
    }
    await mongoose.disconnect();
    console.log('Disconnected from Mongoose');
    if (mongoServer) {
      await mongoServer.stop();
      console.log('Stopped In-Memory MongoDB Server');
    }
    console.log('Cleanup finished.');
  }
}

import fs from 'fs';

setup().then(() => runTests());
