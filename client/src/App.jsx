import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Customer Pages
import Home from './pages/Customer/Home';
import ProductListing from './pages/Customer/ProductListing';
import ProductDetail from './pages/Customer/ProductDetail';
import Cart from './pages/Customer/Cart';
import Checkout from './pages/Customer/Checkout';
import MyOrders from './pages/Customer/MyOrders';
import Wishlist from './pages/Customer/Wishlist';
import Profile from './pages/Customer/Profile';
import About from './pages/Static/About';
import Policies from './pages/Static/Policies';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Admin Layout and Pages
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';
import ProductMgmt from './pages/Admin/ProductMgmt';
import OrderMgmt from './pages/Admin/OrderMgmt';
import ReturnMgmt from './pages/Admin/ReturnMgmt';
import CouponMgmt from './pages/Admin/CouponMgmt';
import UserMgmt from './pages/Admin/UserMgmt';
import ReviewMgmt from './pages/Admin/ReviewMgmt';

// Customer Layout Wrapper
function CustomerLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        
        {/* Customer Facing Site */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<ProductListing />} />
          <Route path="product/:slug" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<MyOrders />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="profile" element={<Profile />} />
          <Route path="about" element={<About />} />
          <Route path="policies" element={<Policies />} />
          
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* Admin Dashboard */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductMgmt />} />
          <Route path="orders" element={<OrderMgmt />} />
          <Route path="returns" element={<ReturnMgmt />} />
          <Route path="coupons" element={<CouponMgmt />} />
          <Route path="users" element={<UserMgmt />} />
          <Route path="reviews" element={<ReviewMgmt />} />
        </Route>

      </Routes>
    </Router>
  );
}
