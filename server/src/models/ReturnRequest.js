const mongoose = require('mongoose');

const returnRequestSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true }
  }],
  reason: { 
    type: String, 
    enum: ['Color mismatch', 'Fabric quality issue', 'Defective weave', 'Incorrect item sent', 'Other'],
    required: true 
  },
  description: { type: String },
  images: [{ type: String }],
  status: { 
    type: String, 
    enum: ['Requested', 'Approved', 'Rejected', 'Picked Up', 'Refund Initiated', 'Refunded'], 
    default: 'Requested',
    index: true 
  },
  refundDetails: {
    razorpayRefundId: { type: String },
    refundAmount: { type: Number },
    refundStatus: { type: String },
    initiatedAt: { type: Date },
    processedAt: { type: Date }
  },
  adminNotes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ReturnRequest', returnRequestSchema);
