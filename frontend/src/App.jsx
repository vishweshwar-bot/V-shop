import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

// Screens
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import CartScreen from './screens/CartScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import ShippingScreen from './screens/ShippingScreen';
import PaymentScreen from './screens/PaymentScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';

// Admin Screens
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import AdminUserListScreen from './screens/AdminUserListScreen';
import AdminProductListScreen from './screens/AdminProductListScreen';
import AdminProductEditScreen from './screens/AdminProductEditScreen';
import AdminOrderListScreen from './screens/AdminOrderListScreen';
import AdminCategoryListScreen from './screens/AdminCategoryListScreen';

// Route Guards
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomeScreen />} />
          <Route path="/product/:id" element={<ProductScreen />} />
          <Route path="/cart" element={<CartScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />

          {/* Protected Member Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/shipping" element={<ShippingScreen />} />
            <Route path="/payment" element={<PaymentScreen />} />
            <Route path="/placeorder" element={<PlaceOrderScreen />} />
            <Route path="/order/:id" element={<OrderScreen />} />
          </Route>

          {/* Admin Dashboard Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboardScreen />} />
            <Route path="/admin/userlist" element={<AdminUserListScreen />} />
            <Route path="/admin/productlist" element={<AdminProductListScreen />} />
            <Route path="/admin/product/:id/edit" element={<AdminProductEditScreen />} />
            <Route path="/admin/orderlist" element={<AdminOrderListScreen />} />
            <Route path="/admin/categorylist" element={<AdminCategoryListScreen />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
