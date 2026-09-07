const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifySignature } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.use(protect); // Payments require auth

router.post('/create-razorpay-order', createRazorpayOrder);
router.post('/verify-signature', verifySignature);

module.exports = router;
