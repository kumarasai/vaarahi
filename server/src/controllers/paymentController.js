const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

// Initialize Razorpay instance
let razorpay;
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const isMock = !keyId || keyId.includes('mock') || !keySecret || keySecret.includes('mock');

if (!isMock) {
  razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
}

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-razorpay-order
// @access  Private
exports.createRazorpayOrder = async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ success: false, message: 'Amount is required' });
  }

  try {
    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`
    };

    if (isMock) {
      // Mock Razorpay Order for testing
      const mockOrder = {
        id: `order_mock_${Math.random().toString(36).substring(2, 11)}`,
        entity: 'order',
        amount: options.amount,
        amount_paid: 0,
        amount_due: options.amount,
        currency: 'INR',
        receipt: options.receipt,
        status: 'created',
        attempts: 0,
        notes: [],
        created_at: Math.floor(Date.now() / 1000)
      };

      return res.json({ success: true, isMock: true, keyId: 'rzp_test_mock', order: mockOrder });
    }

    const order = await razorpay.orders.create(options);
    res.json({
      success: true,
      isMock: false,
      keyId,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay Signature
// @route   POST /api/payments/verify-signature
// @access  Private
exports.verifySignature = async (req, res) => {
  const { 
    razorpayOrderId, 
    razorpayPaymentId, 
    razorpaySignature,
    orderId // Internal DB Order ID
  } = req.body;

  try {
    if (isMock || razorpayOrderId.startsWith('order_mock_')) {
      // Verification succeeded in mock mode
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentDetails.paymentStatus = 'Paid';
        order.paymentDetails.razorpayOrderId = razorpayOrderId;
        order.paymentDetails.razorpayPaymentId = razorpayPaymentId || `pay_mock_${Date.now()}`;
        order.paymentDetails.razorpaySignature = razorpaySignature || 'sig_mock_ok';
        order.orderStatus = 'Confirmed';
        
        // Ensure confirmed timeline exists
        if (!order.statusTimeline.some(t => t.status === 'Confirmed')) {
          order.statusTimeline.push({
            status: 'Confirmed',
            description: 'Mock Payment verified and order confirmed'
          });
        }
        await order.save();
      }

      return res.json({ success: true, message: 'Mock payment verified successfully' });
    }

    // Crypographic validation for live transactions
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpaySignature;

    if (isSignatureValid) {
      // Update order status in database
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Internal order not found' });
      }

      order.paymentDetails.paymentStatus = 'Paid';
      order.paymentDetails.razorpayOrderId = razorpayOrderId;
      order.paymentDetails.razorpayPaymentId = razorpayPaymentId;
      order.paymentDetails.razorpaySignature = razorpaySignature;
      order.orderStatus = 'Confirmed';
      
      if (!order.statusTimeline.some(t => t.status === 'Confirmed')) {
        order.statusTimeline.push({
          status: 'Confirmed',
          description: 'Razorpay Payment verified successfully'
        });
      }
      await order.save();

      res.json({ success: true, message: 'Payment verified and captured successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
