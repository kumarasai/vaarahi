const Wishlist = require('../models/Wishlist');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user.id }).populate({
      path: 'products',
      select: 'name price discountPercent slug images stock fabric weave color'
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user.id, products: [] });
    }

    res.json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle item in wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
exports.toggleWishlist = async (req, res) => {
  const { productId } = req.params;

  try {
    let wishlist = await Wishlist.findOne({ userId: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user.id, products: [] });
    }

    const itemExists = wishlist.products.includes(productId);

    if (itemExists) {
      // Remove product
      wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
      await wishlist.save();
      res.json({ success: true, message: 'Removed from wishlist', action: 'removed' });
    } else {
      // Add product
      wishlist.products.push(productId);
      await wishlist.save();
      res.json({ success: true, message: 'Added to wishlist', action: 'added' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
