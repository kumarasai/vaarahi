const Product = require('../models/Product');
const Review = require('../models/Review');

// @desc    Get all active products with filters and search
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { 
      search, 
      fabric, 
      weave, 
      occasion, 
      color, 
      minPrice, 
      maxPrice, 
      sort, 
      page = 1, 
      limit = 12 
    } = req.query;

    const query = { isActive: true };

    // Text Search
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (fabric) {
      query.fabric = fabric;
    }
    if (weave) {
      query.weave = weave;
    }
    if (occasion) {
      query.occasion = occasion;
    }
    if (color) {
      query['color.name'] = color;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Find options
    let sortOptions = { createdAt: -1 }; // default: new arrivals
    if (sort) {
      if (sort === 'price-asc') sortOptions = { price: 1 };
      if (sort === 'price-desc') sortOptions = { price: -1 };
      if (sort === 'popularity') sortOptions = { 'ratings.average': -1, 'ratings.count': -1 };
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get unique filter choices (to render swatches, chips dynamically)
// @route   GET /api/products/filters
// @access  Public
exports.getProductFilters = async (req, res) => {
  try {
    const fabrics = await Product.distinct('fabric', { isActive: true });
    const weaves = await Product.distinct('weave', { isActive: true });
    const occasions = await Product.distinct('occasion', { isActive: true });
    
    // For colors, we aggregate to get both the color name and its hex code
    const colors = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$color.name', hex: { $first: '$color.hex' } } },
      { $project: { name: '$_id', hex: 1, _id: 0 } }
    ]);

    const maxPrice = await Product.findOne({ isActive: true })
      .sort({ price: -1 })
      .select('price');

    res.json({
      success: true,
      filters: {
        fabrics,
        weaves,
        occasions,
        colors,
        maxPrice: maxPrice ? maxPrice.price : 100000
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Fetch approved reviews
    const reviews = await Review.find({ productId: product._id, isApproved: true })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      product,
      reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get similar products (AI-ish recommendations based on fabric/weave)
// @route   GET /api/products/similar/:id
// @access  Public
exports.getSimilarProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Find products with same weave or fabric, excluding current product
    const similar = await Product.find({
      _id: { $ne: product._id },
      isActive: true,
      $or: [
        { weave: product.weave },
        { fabric: product.fabric }
      ]
    }).limit(4);

    res.json({
      success: true,
      products: similar
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create product review
// @route   POST /api/products/reviews/:id
// @access  Private (Customer only)
exports.createReview = async (req, res) => {
  const { rating, title, comment, images } = req.body;
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed
    const alreadyReviewed = await Review.findOne({
      productId,
      userId: req.user.id
    });

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'Product already reviewed by you' });
    }

    const review = await Review.create({
      productId,
      userId: req.user.id,
      userName: req.user.name,
      rating: Number(rating),
      title,
      comment,
      images: images || [],
      isApproved: true // In production, this can be false initially for moderation. Let's auto-approve for simplicity, but leave the field
    });

    // Update product ratings average and count
    const reviews = await Review.find({ productId, isApproved: true });
    
    product.ratings.count = reviews.length;
    product.ratings.average = 
      reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
