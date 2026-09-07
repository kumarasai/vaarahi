const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductFilters, 
  getProductBySlug, 
  getSimilarProducts, 
  createReview 
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/filters', getProductFilters);
router.get('/slug/:slug', getProductBySlug);
router.get('/similar/:id', getSimilarProducts);
router.post('/reviews/:id', protect, createReview);

module.exports = router;
