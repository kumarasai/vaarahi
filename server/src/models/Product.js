const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  price: { type: Number, required: true },
  discountPercent: { type: Number, default: 0 },
  sku: { type: String, required: true, unique: true },
  stock: { type: Number, required: true, default: 0 },
  outOfStockAutoHide: { type: Boolean, default: false },
  
  // Fabric-first details
  fabric: { type: String, required: true, index: true },      // e.g., Katan Silk, Organza, Linen
  weave: { type: String, required: true, index: true },       // e.g., Banarasi, Kanjivaram, Chanderi, Jamdani
  occasion: { type: String, required: true, index: true },    // e.g., Bridal, Festive, Casual, Office
  zariType: { type: String, enum: ['Pure Zari', 'Tested Zari', 'Metallic Zari', 'None'], default: 'None' },
  origin: { type: String },                                   // e.g., Varanasi, Tamil Nadu, Madhya Pradesh
  careInstructions: { type: [String], default: [] },
  
  color: {
    name: { type: String, required: true },
    hex: { type: String, required: true }                     // For visual color swatch filtering
  },
  
  images: [{
    secure_url: { type: String, required: true },
    public_id: { type: String, required: true }
  }],
  video: {
    secure_url: { type: String },
    public_id: { type: String }
  },
  
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  
  seo: {
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: [String] }
  },
  
  isActive: { type: Boolean, default: true, index: true },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

// Auto-slugify name before validation
productSchema.pre('validate', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

// Create text index for search
productSchema.index({ name: 'text', description: 'text', fabric: 'text', weave: 'text', origin: 'text' });

module.exports = mongoose.model('Product', productSchema);
