const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');
const ReturnRequest = require('../models/ReturnRequest');
const Razorpay = require('razorpay');

// Razorpay Refund setup
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
const isMock = !keyId || keyId.includes('mock') || !keySecret || keySecret.includes('mock');

let razorpay;
if (!isMock) {
  razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
}

// ----------------------------------------------------
// 1. Dashboard Stats
// ----------------------------------------------------
exports.getDashboardStats = async (req, res) => {
  try {
    // Total Revenue
    const completedOrders = await Order.find({ 
      'paymentDetails.paymentStatus': 'Paid',
      orderStatus: { $ne: 'Cancelled' }
    });

    const totalRevenue = completedOrders.reduce((acc, order) => acc + order.pricing.total, 0);

    // Sales metrics by month (Mock aggregating or real mongoose aggregation)
    const salesOverTime = [
      { month: 'Jan', sales: Math.round(totalRevenue * 0.1) },
      { month: 'Feb', sales: Math.round(totalRevenue * 0.15) },
      { month: 'Mar', sales: Math.round(totalRevenue * 0.12) },
      { month: 'Apr', sales: Math.round(totalRevenue * 0.2) },
      { month: 'May', sales: Math.round(totalRevenue * 0.18) },
      { month: 'Jun', sales: Math.round(totalRevenue * 0.25) },
    ];

    // Low stock count (< 5 items)
    const lowStockAlerts = await Product.find({ stock: { $lt: 5 } }).select('name stock price fabric');

    // Recent orders
    const recentOrders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Counts
    const ordersCount = await Order.countDocuments();
    const productsCount = await Product.countDocuments();
    const usersCount = await User.countDocuments({ role: 'customer' });

    res.json({
      success: true,
      stats: {
        totalRevenue,
        ordersCount,
        productsCount,
        usersCount,
        lowStockAlerts,
        recentOrders,
        salesOverTime
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------------------------------------
// 2. Product Management (Admin-specific CRUD)
// ----------------------------------------------------
exports.createProduct = async (req, res) => {
  try {
    const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const productData = { ...req.body, slug };

    const product = await Product.create(productData);
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.body.name) {
      req.body.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk action (e.g. deactivate or stock adjustments)
exports.bulkUpdateProducts = async (req, res) => {
  const { ids, update } = req.body;
  try {
    await Product.updateMany({ _id: { $in: ids } }, { $set: update });
    res.json({ success: true, message: 'Products updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------------------------------------
// 3. Order Management
// ----------------------------------------------------
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { orderStatus, courierName, trackingId, trackingUrl, statusDescription } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
      order.statusTimeline.push({
        status: orderStatus,
        description: statusDescription || `Order status updated to ${orderStatus}`
      });
    }

    if (courierName || trackingId) {
      order.trackingDetails = {
        courierName: courierName || order.trackingDetails?.courierName,
        trackingId: trackingId || order.trackingDetails?.trackingId,
        trackingUrl: trackingUrl || order.trackingDetails?.trackingUrl
      };
    }

    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------------------------------------
// 4. Return & Refund Management
// ----------------------------------------------------
exports.getReturnRequests = async (req, res) => {
  try {
    const returns = await ReturnRequest.find()
      .populate('orderId')
      .populate('userId', 'name email')
      .populate('items.productId')
      .sort({ createdAt: -1 });

    res.json({ success: true, returns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.processReturnRequest = async (req, res) => {
  const { action, adminNotes } = req.body; // action: 'Approved' | 'Rejected' | 'Refund'

  try {
    const returnReq = await ReturnRequest.findById(req.params.id);
    if (!returnReq) {
      return res.status(404).json({ success: false, message: 'Return request not found' });
    }

    const order = await Order.findById(returnReq.orderId);

    if (action === 'Approved') {
      returnReq.status = 'Approved';
      returnReq.adminNotes = adminNotes || 'Return approved, awaiting pickup';
      order.orderStatus = 'Returned';
      order.statusTimeline.push({
        status: 'Returned',
        description: 'Return request approved by admin'
      });
      await order.save();
    } else if (action === 'Rejected') {
      returnReq.status = 'Rejected';
      returnReq.adminNotes = adminNotes || 'Return request rejected';
      order.statusTimeline.push({
        status: 'Delivered', // revert back to delivered
        description: `Return request rejected: ${adminNotes}`
      });
      await order.save();
    } else if (action === 'Refund') {
      // Process Refund
      const refundAmount = order.pricing.total; // Refund total order amount or item level proportion
      
      if (order.paymentDetails.paymentMethod === 'Razorpay' && order.paymentDetails.razorpayPaymentId && !isMock) {
        // Genuine Razorpay Refund
        try {
          const refund = await razorpay.payments.refund(order.paymentDetails.razorpayPaymentId, {
            amount: Math.round(refundAmount * 100) // refund amount in paise
          });
          returnReq.status = 'Refunded';
          returnReq.refundDetails = {
            razorpayRefundId: refund.id,
            refundAmount,
            refundStatus: refund.status,
            initiatedAt: new Date()
          };
        } catch (rzpErr) {
          return res.status(400).json({ success: false, message: `Razorpay Refund failed: ${rzpErr.message}` });
        }
      } else {
        // Mock Refund or COD refund
        returnReq.status = 'Refunded';
        returnReq.refundDetails = {
          razorpayRefundId: `ref_mock_${Date.now()}`,
          refundAmount,
          refundStatus: 'processed',
          initiatedAt: new Date(),
          processedAt: new Date()
        };
      }

      order.paymentDetails.paymentStatus = 'Refunded';
      order.statusTimeline.push({
        status: 'Returned',
        description: `Refund processed successfully for amount ₹${refundAmount}`
      });
      await order.save();
    }

    await returnReq.save();
    res.json({ success: true, returnRequest: returnReq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------------------------------------
// 5. Coupon Management
// ----------------------------------------------------
exports.createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------------------------------------
// 6. User Management
// ----------------------------------------------------
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleUserBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ success: true, message: `User account is now ${user.isBlocked ? 'blocked' : 'active'}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------------------------------------
// 7. Reviews Moderation
// ----------------------------------------------------
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('productId', 'name slug images')
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleReviewApproval = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.isApproved = !review.isApproved;
    await review.save();

    res.json({ success: true, message: `Review approval status toggled`, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
