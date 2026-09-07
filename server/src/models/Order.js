const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    blouseSize: { type: String, required: true },
    image: { type: String, required: true }
  }],
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    streetAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true }
  },
  pricing: {
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingCharges: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  paymentDetails: {
    paymentMethod: { type: String, enum: ['Razorpay', 'COD'], default: 'Razorpay' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' }
  },
  orderStatus: {
    type: String,
    enum: ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'],
    default: 'Placed',
    index: true
  },
  statusTimeline: [{
    status: { type: String },
    updatedAt: { type: Date, default: Date.now },
    description: { type: String }
  }],
  trackingDetails: {
    courierName: { type: String },
    trackingId: { type: String },
    trackingUrl: { type: String }
  },
  returnsEligibleUntil: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
