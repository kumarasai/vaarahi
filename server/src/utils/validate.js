const axios = require('axios');
const app = require('../app');
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const PORT = 5001; // use separate port for validation test

const runValidation = async () => {
  let server;
  try {
    console.log('--- STARTING BACKEND TRANSACTION VALIDATION ---');
    
    // Connect to database
    await connectDB();
    
    // Start temporary validation server
    server = app.listen(PORT, () => {
      console.log(`Validation server running on port ${PORT}`);
    });

    const client = axios.create({
      baseURL: `http://localhost:${PORT}/api`,
      validateStatus: () => true // resolve promise on any status
    });

    // 1. Health Check
    console.log('\nChecking health status...');
    const health = await client.get('/health');
    console.log(`Health status: ${health.data.status} (HTTP ${health.status})`);

    // 2. Register Mock Customer
    console.log('\nRegistering validation test customer...');
    const userEmail = `validation_${Date.now()}@vastraa.com`;
    const regRes = await client.post('/auth/register', {
      name: 'Validation Tester',
      email: userEmail,
      password: 'testpassword123',
      phone: '+919999988888'
    });
    
    if (!regRes.data.success) {
      throw new Error(`Registration failed: ${regRes.data.message}`);
    }
    const token = regRes.data.accessToken;
    console.log(`Customer registration succeeded: Token retrieved.`);

    // Configure client headers for authenticated routes
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // 3. Search Saree Catalog
    console.log('\nSearching products catalog...');
    const prodRes = await client.get('/products');
    if (!prodRes.data.success || prodRes.data.products.length === 0) {
      throw new Error('No sarees found in database. Seed may be empty.');
    }
    const targetSaree = prodRes.data.products[0];
    console.log(`Discovered saree: "${targetSaree.name}" (SKU: ${targetSaree.sku}, Price: ₹${targetSaree.price})`);

    // 4. Add to Cart
    console.log(`\nAdding Saree to cart with blouse sizing...`);
    const cartRes = await client.post('/cart', {
      productId: targetSaree._id,
      quantity: 1,
      blouseSelected: true,
      blouseSize: '38'
    });
    if (!cartRes.data.success) {
      throw new Error('Failed to add item to cart');
    }
    console.log('Item added to cart with custom blouse options successfully.');

    // 5. Checkout / Create Order
    console.log('\nInitializing checkout order placement...');
    const orderRes = await client.post('/orders', {
      shippingAddress: {
        name: 'Validation Tester',
        phone: '+919999988888',
        streetAddress: '42, Silk Weaving Block',
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        pinCode: '221001'
      },
      paymentMethod: 'Razorpay',
      couponCode: 'FESTIVE15'
    });

    if (!orderRes.data.success) {
      throw new Error(`Order placement failed: ${orderRes.data.message}`);
    }
    const placedOrder = orderRes.data.order;
    console.log(`Order placed in Pending state: ID #${placedOrder._id}`);
    console.log(`Payable amount calculated: ₹${placedOrder.pricing.total} (Discount applied: ₹${placedOrder.pricing.discount})`);

    // 6. Verify Signature (Razorpay Capture mock)
    console.log('\nSimulating Razorpay Payment Gateway webhook verification...');
    const verifyRes = await client.post('/payments/verify-signature', {
      razorpayOrderId: `order_mock_${Date.now()}`,
      razorpayPaymentId: `pay_mock_${Date.now()}`,
      razorpaySignature: 'sig_mock_validation',
      orderId: placedOrder._id
    });

    if (!verifyRes.data.success) {
      throw new Error('Payment verification signature declined');
    }
    console.log('Payment verified successfully. Order status moved to Confirmed.');

    // 7. Customer order status tracking
    console.log('\nQuerying visual delivery tracking timeline...');
    const trackingRes = await client.get(`/orders/${placedOrder._id}`);
    const trackedOrder = trackingRes.data.order;
    console.log(`Current tracked order status: "${trackedOrder.orderStatus}"`);
    console.log('Timeline history states logged:');
    trackedOrder.statusTimeline.forEach(t => {
      console.log(` - [${new Date(t.updatedAt).toLocaleTimeString()}] ${t.status}: ${t.description}`);
    });

    console.log('\n--- TRANSACTION VALIDATION SUCCESSFUL ---');
    
    // Close connections and exit
    mongoose.connection.close();
    server.close(() => process.exit(0));
  } catch (error) {
    console.error('\n*** TRANSACTION VALIDATION FAILED ***');
    console.error(error.message);
    if (server) {
      server.close();
    }
    mongoose.connection.close();
    process.exit(1);
  }
};

runValidation();
