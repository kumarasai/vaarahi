const ReturnRequest = require('../models/ReturnRequest');
const Order = require('../models/Order');

// @desc    Request a return for an order item
// @route   POST /api/returns
// @access  Private
exports.requestReturn = async (req, res) => {
  const { orderId, productId, quantity, reason, description, images } = req.body;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify ownership
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized return request' });
    }

    // Check delivery status
    if (order.orderStatus !== 'Delivered') {
      return res.status(400).json({ success: false, message: 'Only delivered orders are eligible for return' });
    }

    // Check expiry
    const now = new Date();
    if (order.returnsEligibleUntil && now > order.returnsEligibleUntil) {
      return res.status(400).json({ success: false, message: 'Return window (7 days post-delivery) has expired' });
    }

    // Verify the product actually exists in the order
    const orderedItem = order.items.find(item => item.productId.toString() === productId);
    if (!orderedItem) {
      return res.status(400).json({ success: false, message: 'Product not found in this order' });
    }

    if (orderedItem.quantity < quantity) {
      return res.status(400).json({ success: false, message: `Cannot return more than purchased (${orderedItem.quantity})` });
    }

    // Create the ReturnRequest
    const returnRequest = await ReturnRequest.create({
      orderId,
      userId: req.user.id,
      items: [{ productId, quantity }],
      reason,
      description,
      images: images || [],
      status: 'Requested'
    });

    // Update order status timeline to indicate return request
    order.orderStatus = 'Returned'; // Update general status, or keep it delivered and append timeline
    order.statusTimeline.push({
      status: 'Returned',
      description: `Return requested for item: ${orderedItem.name} x${quantity}`
    });
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Return request submitted successfully',
      returnRequest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all return requests for logged-in user
// @route   GET /api/returns/my-returns
// @access  Private
exports.getMyReturns = async (req, res) => {
  try {
    const returns = await ReturnRequest.find({ userId: req.user.id })
      .populate('orderId')
      .populate('items.productId')
      .sort({ createdAt: -1 });

    res.json({ success: true, returns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
