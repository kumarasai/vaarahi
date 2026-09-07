const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    blouseSelected: { type: Boolean, default: false },
    blouseSize: { type: String, enum: ['Unstitched', '32', '34', '36', '38', '40', '42'], default: 'Unstitched' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
