const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');
const sendEmail = require('../utils/email');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  const { 
    shippingAddress, 
    paymentMethod = 'Razorpay', 
    couponCode,
    razorpayDetails 
  } = req.body;

  try {
    // 1. Fetch user's cart
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // 2. Validate stock and calculate pricing
    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.productId;
      if (!product || !product.isActive) {
        return res.status(404).json({ success: false, message: `Product ${product ? product.name : 'unknown'} is no longer available` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}. Only ${product.stock} left` });
      }

      const discountedPrice = Math.round(product.price * (1 - (product.discountPercent / 100)));
      subtotal += discountedPrice * item.quantity;

      orderItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: discountedPrice,
        blouseSize: item.blouseSize,
        image: product.images[0].secure_url
      });
    }

    // 3. Apply Coupon Discount if provided
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        // Validate dates
        const now = new Date();
        if (now >= coupon.startDate && now <= coupon.endDate) {
          // Validate min order
          if (subtotal >= coupon.minOrderAmount) {
            // Apply discount
            if (coupon.discountType === 'flat') {
              discount = coupon.discountValue;
            } else {
              discount = Math.round((subtotal * coupon.discountValue) / 100);
              if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
                discount = coupon.maxDiscountAmount;
              }
            }
            // Protect against negative pricing
            if (discount > subtotal) discount = subtotal;

            // Increment usage count
            coupon.timesUsed += 1;
            await coupon.save();
          }
        }
      }
    }

    const shippingCharges = subtotal - discount > 2000 ? 0 : 150; // free shipping over 2000
    const tax = Math.round((subtotal - discount) * 0.05); // 5% GST on handloom/sarees
    const total = subtotal - discount + shippingCharges + tax;

    // 4. Update Stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.productId._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // 5. Create Order
    const paymentStatus = paymentMethod === 'COD' ? 'Pending' : (razorpayDetails ? 'Paid' : 'Pending');
    const timeline = [
      {
        status: 'Placed',
        description: 'Order created successfully'
      }
    ];

    if (paymentStatus === 'Paid') {
      timeline.push({
        status: 'Confirmed',
        description: 'Payment verified and order confirmed'
      });
    }

    const returnsEligibleUntil = new Date();
    returnsEligibleUntil.setDate(returnsEligibleUntil.getDate() + 7); // 7-day return policy

    const order = await Order.create({
      userId: req.user.id,
      items: orderItems,
      shippingAddress,
      pricing: {
        subtotal,
        discount,
        shippingCharges,
        tax,
        total
      },
      paymentDetails: {
        paymentMethod,
        razorpayOrderId: razorpayDetails?.razorpayOrderId,
        razorpayPaymentId: razorpayDetails?.razorpayPaymentId,
        razorpaySignature: razorpayDetails?.razorpaySignature,
        paymentStatus
      },
      orderStatus: paymentStatus === 'Paid' ? 'Confirmed' : 'Placed',
      statusTimeline: timeline,
      returnsEligibleUntil
    });

    // 6. Clear Cart
    cart.items = [];
    await cart.save();

    // 7. Dispatch Confirmation Email
    try {
      await sendEmail({
        to: req.user.email,
        subject: `Vastraa - Order Confirmed #${order._id.toString().substring(0, 8).toUpperCase()}`,
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 5px;">
            <h2 style="color: #042c2f; border-bottom: 2px solid #c5a059; padding-bottom: 10px;">Thank you for your order, ${req.user.name}!</h2>
            <p>Your order <strong>#${order._id.toString().substring(0, 8).toUpperCase()}</strong> has been placed successfully.</p>
            <h3>Order Details:</h3>
            <ul>
              ${orderItems.map(item => `<li>${item.name} (${item.blouseSize}) x ${item.quantity} - ₹${item.price * item.quantity}</li>`).join('')}
            </ul>
            <p><strong>Total Amount Paid:</strong> ₹${total}</p>
            <p>We are weaving your saree experience, and will update you as soon as it is shipped!</p>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">Vastraa Saree Co. - 2026</p>
          </div>
        `
      });
    } catch (mailErr) {
      console.error('Failed to send order email:', mailErr.message);
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's order history
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify ownership
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'sub-admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized access to order' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized cancellation request' });
    }

    if (!['Placed', 'Confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled now. Already processed/shipped' });
    }

    // Restock items
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity }
      });
    }

    order.orderStatus = 'Cancelled';
    order.statusTimeline.push({
      status: 'Cancelled',
      description: 'Order cancelled by customer'
    });
    
    if (order.paymentDetails.paymentStatus === 'Paid') {
      order.paymentDetails.paymentStatus = 'Refunded'; // For COD or manual/Razorpay refund logs
    }

    await order.save();

    res.json({ success: true, message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
