const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id }).populate({
      path: 'items.productId',
      select: 'name price discountPercent slug images stock fabric weave color'
    });

    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
  const { productId, quantity = 1, blouseSelected = false, blouseSize = 'Unstitched' } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} items left in stock` });
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }

    // Check if item already in cart with same blouse specifications
    const itemIndex = cart.items.findIndex(
      item => 
        item.productId.toString() === productId && 
        item.blouseSize === blouseSize && 
        item.blouseSelected === blouseSelected
    );

    if (itemIndex > -1) {
      // Item exists, update quantity
      const newQty = cart.items[itemIndex].quantity + Number(quantity);
      if (product.stock < newQty) {
        return res.status(400).json({ success: false, message: `Cannot add more. Max stock available: ${product.stock}` });
      }
      cart.items[itemIndex].quantity = newQty;
    } else {
      // Item doesn't exist, push new item
      cart.items.push({
        productId,
        quantity: Number(quantity),
        blouseSelected,
        blouseSize
      });
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      select: 'name price discountPercent slug images stock fabric weave color'
    });

    res.json({ success: true, cart: populatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update cart item quantity or blouse selections
// @route   PUT /api/cart
// @access  Private
exports.updateCartItem = async (req, res) => {
  const { itemId, quantity, blouseSelected, blouseSize } = req.body;

  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    const product = await Product.findById(item.productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (quantity !== undefined) {
      if (product.stock < quantity) {
        return res.status(400).json({ success: false, message: `Only ${product.stock} items left in stock` });
      }
      item.quantity = Number(quantity);
    }

    if (blouseSelected !== undefined) {
      item.blouseSelected = blouseSelected;
    }

    if (blouseSize !== undefined) {
      item.blouseSize = blouseSize;
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      select: 'name price discountPercent slug images stock fabric weave color'
    });

    res.json({ success: true, cart: populatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // Filter out the item
    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      select: 'name price discountPercent slug images stock fabric weave color'
    });

    res.json({ success: true, cart: populatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
