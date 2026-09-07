const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const {
  getDashboardStats,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateProducts,
  getOrders,
  updateOrderStatus,
  getReturnRequests,
  processReturnRequest,
  createCoupon,
  getCoupons,
  deleteCoupon,
  getUsers,
  toggleUserBlock,
  getReviews,
  toggleReviewApproval
} = require('../controllers/adminController');

// All admin routes are protected and restricted to admin/sub-admin roles
router.use(protect, authorize('admin', 'sub-admin'));

// Dashboard Stats
router.get('/dashboard', getDashboardStats);

// Products CRUD
router.post('/products', createProduct);
router.put('/products/bulk', bulkUpdateProducts);
router.route('/products/:id')
  .put(updateProduct)
  .delete(deleteProduct);

// Orders Management
router.get('/orders', getOrders);
router.put('/orders/:id', updateOrderStatus);

// Return requests Management
router.get('/returns', getReturnRequests);
router.put('/returns/:id', processReturnRequest);

// Coupons CRUD
router.route('/coupons')
  .get(getCoupons)
  .post(createCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Users Management
router.get('/users', getUsers);
router.put('/users/:id/block', toggleUserBlock);

// Reviews Moderation
router.get('/reviews', getReviews);
router.put('/reviews/:id/approve', toggleReviewApproval);

module.exports = router;
