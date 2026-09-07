const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, cancelOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.use(protect); // All order routes require auth

router.route('/')
  .post(createOrder);

router.get('/my-orders', getMyOrders);

router.route('/:id')
  .get(getOrderById);

router.put('/:id/cancel', cancelOrder);

module.exports = router;
