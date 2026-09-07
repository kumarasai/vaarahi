import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Plus, ShieldCheck, CreditCard, ChevronRight, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { cart, getPricingDetails, coupon, clearCart } = useCartStore();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');

  // Address form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');

  // Payment popup simulation state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paying, setPaying] = useState(false);
  const [simulatedOrderId, setSimulatedOrderId] = useState('');

  // Load User addresses
  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/auth/me'); // gets user addresses from User info or custom address endpoint
      // We will also allow a mock address default to populate if user has none
      const userAddresses = res.data.user?.addresses || [
        {
          name: user.name,
          phone: user.phone || '+91 99887 76655',
          streetAddress: 'Flat 402, Lotus Residency, Jubilee Hills',
          city: 'Hyderabad',
          state: 'Telangana',
          pinCode: '500033',
          addressType: 'Home'
        }
      ];
      setAddresses(userAddresses);
    } catch (e) {
      console.error('Failed to load addresses:', e);
    }
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!name || !phone || !streetAddress || !city || !state || !pinCode) return;

    const newAddr = { name, phone, streetAddress, city, state, pinCode, addressType: 'Home' };
    const updated = [...addresses, newAddr];
    setAddresses(updated);
    
    // Reset Form
    setName('');
    setPhone('');
    setStreetAddress('');
    setCity('');
    setState('');
    setPinCode('');
    setShowAddressForm(false);
    setSelectedAddressIdx(updated.length - 1);
  };

  const { subtotal, discount, shipping, tax, total } = getPricingDetails();

  const handlePlaceOrder = async () => {
    if (addresses.length === 0) {
      alert('Please configure a shipping address.');
      return;
    }

    const shippingAddress = addresses[selectedAddressIdx];

    if (paymentMethod === 'COD') {
      try {
        setPaying(true);
        const res = await api.post('/orders', {
          shippingAddress,
          paymentMethod: 'COD',
          couponCode: coupon?.code
        });

        if (res.data.success) {
          clearCart();
          navigate('/orders?success=true');
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to place COD order');
      } finally {
        setPaying(false);
      }
      return;
    }

    // Razorpay Integration
    try {
      setPaying(true);
      // Create Razorpay Order in Backend
      const res = await api.post('/payments/create-razorpay-order', { amount: total });
      
      if (res.data.success) {
        setSimulatedOrderId(res.data.order.id);
        setShowPaymentModal(true); // Open simulated Razorpay Gateway
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to initialize payment gateway');
    } finally {
      setPaying(false);
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    setPaying(true);
    const shippingAddress = addresses[selectedAddressIdx];

    try {
      // 1. Create order as Placed/Pending first
      const orderRes = await api.post('/orders', {
        shippingAddress,
        paymentMethod: 'Razorpay',
        couponCode: coupon?.code
      });

      if (orderRes.data.success) {
        const orderId = orderRes.data.order._id;

        // 2. Call Verify signature (mocked) to transition order to Confirmed/Paid
        const verifyRes = await api.post('/payments/verify-signature', {
          razorpayOrderId: simulatedOrderId,
          razorpayPaymentId: `pay_simulated_${Date.now()}`,
          razorpaySignature: `sig_simulated_${Math.random().toString(36).substring(7)}`,
          orderId
        });

        if (verifyRes.data.success) {
          setShowPaymentModal(false);
          clearCart();
          navigate('/orders?success=true');
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment verification failed');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-16">
      
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs uppercase tracking-wider text-gray-500 mb-8">
        <Link to="/cart" className="hover:text-gold">Cart</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-300">Checkout</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Checkout Steps (Left) - 8 Columns */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Address Card */}
          <div className="bg-teal-dark/30 border border-gold/15 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6 border-b border-gold/10 pb-3">
              <h2 className="font-serif text-lg font-bold text-gold uppercase tracking-widest flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                <span>Shipping Destination</span>
              </h2>
              {!showAddressForm && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="text-xs text-gold border border-gold/30 rounded px-3 py-1.5 flex items-center space-x-1 hover:bg-gold/10 uppercase tracking-widest font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add New</span>
                </button>
              )}
            </div>

            {/* Address Form */}
            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="space-y-4 mb-6 p-4 border border-gold/10 bg-teal-dark/20 rounded">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Recipient Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-teal-dark border border-gold/20 text-white rounded p-2 text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="10-Digit Mobile Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-teal-dark border border-gold/20 text-white rounded p-2 text-xs focus:outline-none"
                  />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Street Address / Flat / Area"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full bg-teal-dark border border-gold/20 text-white rounded p-2 text-xs focus:outline-none"
                />
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-teal-dark border border-gold/20 text-white rounded p-2 text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="bg-teal-dark border border-gold/20 text-white rounded p-2 text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Pin Code"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="bg-teal-dark border border-gold/20 text-white rounded p-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="text-xs text-gray-400 px-4 py-2 border border-gold/15 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gold text-teal-dark font-bold text-xs uppercase px-6 py-2 rounded"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}

            {/* Address Selector list */}
            {addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedAddressIdx(idx)}
                    className={`p-4 rounded border-2 cursor-pointer transition flex flex-col justify-between ${
                      idx === selectedAddressIdx 
                        ? 'border-gold bg-gold/10 shadow-lg' 
                        : 'border-gold/10 hover:border-gold/30 bg-teal-dark/5'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm text-teal-dark">{addr.name}</span>
                        <span className="text-[9px] bg-gold/20 text-gold-dark px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                          {addr.addressType}
                        </span>
                      </div>
                      <p className="text-xs text-gray-800 leading-relaxed mt-1">{addr.streetAddress}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{addr.city}, {addr.state} - {addr.pinCode}</p>
                    </div>
                    <div className="text-[10px] text-teal-dark font-semibold mt-3">
                      Phone: {addr.phone}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 text-xs">
                No addresses saved. Please add a shipping destination above.
              </div>
            )}
          </div>

          {/* Payment Method selector */}
          <div className="bg-teal-dark/30 border border-gold/15 p-6 rounded-lg">
            <h2 className="font-serif text-lg font-bold text-gold uppercase tracking-widest border-b border-gold/10 pb-3 mb-6 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              <span>Payment Protocol</span>
            </h2>

            <div className="space-y-3">
              <div
                onClick={() => setPaymentMethod('Razorpay')}
                className={`p-4 rounded border-2 cursor-pointer transition flex items-center justify-between ${
                  paymentMethod === 'Razorpay'
                    ? 'border-gold bg-gold/10 shadow'
                    : 'border-gold/10 hover:border-gold/20 bg-teal-dark/5'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'Razorpay' ? 'border-gold' : 'border-gray-600'
                  }`}>
                    {paymentMethod === 'Razorpay' && <div className="h-2 w-2 rounded-full bg-gold" />}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-teal-dark block">Razorpay Payment Gateway</span>
                    <span className="text-xs text-gray-700 block mt-0.5">Pay securely using Cards, UPI, Netbanking, Wallet</span>
                  </div>
                </div>
                <span className="text-xs text-gold-dark font-bold tracking-widest uppercase">Popular</span>
              </div>

              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded border-2 cursor-pointer transition flex items-center justify-between ${
                  paymentMethod === 'COD'
                    ? 'border-gold bg-gold/10 shadow'
                    : 'border-gold/10 hover:border-gold/20 bg-teal-dark/5'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'COD' ? 'border-gold' : 'border-gray-600'
                  }`}>
                    {paymentMethod === 'COD' && <div className="h-2 w-2 rounded-full bg-gold" />}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-teal-dark block">Cash on Delivery (COD)</span>
                    <span className="text-xs text-gray-700 block mt-0.5">Pay with cash upon delivery of your handloom</span>
                  </div>
                </div>
                <span className="text-xs text-gray-500 uppercase">+₹150 cod fee</span>
              </div>
            </div>
          </div>

        </div>

        {/* Pricing breakdown & checkout button (Right) - 4 Columns */}
        <div className="lg:col-span-4 bg-teal-dark/30 border border-gold/15 p-6 rounded-lg space-y-5">
          <h3 className="font-serif text-sm font-bold text-gold uppercase tracking-widest border-b border-gold/10 pb-3">
            Review Order
          </h3>

          <div className="max-h-60 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {cart.items?.map(item => {
              const product = item.productId;
              if (!product) return null;
              const dPrice = Math.round(product.price * (1 - (product.discountPercent / 100)));
              
              return (
                <div key={item._id} className="flex justify-between items-center text-xs border-b border-gold/5 pb-2.5">
                  <div className="max-w-[70%]">
                    <span className="font-bold text-white block truncate">{product.name}</span>
                    <span className="text-[10px] text-gold uppercase block mt-0.5">Qty: {item.quantity} &bull; Size: {item.blouseSize}</span>
                  </div>
                  <span className="font-serif font-bold text-gold">₹{(dPrice + (item.blouseSelected ? 1200 : 0)) * item.quantity}</span>
                </div>
              );
            })}
          </div>

          <div className="space-y-2.5 text-xs text-gray-300 border-t border-gold/10 pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Discount Applied</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Charges</span>
              <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
            </div>
            {paymentMethod === 'COD' && (
              <div className="flex justify-between text-orange-400">
                <span>COD Processing Fee</span>
                <span>₹150</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>GST (5% Handloom Tax)</span>
              <span>₹{tax}</span>
            </div>
          </div>

          <div className="border-t border-gold/15 pt-4 flex justify-between items-baseline">
            <span className="font-serif text-sm font-bold text-white uppercase tracking-wider">Payable Total</span>
            <span className="font-serif text-xl font-bold text-gold">₹{total + (paymentMethod === 'COD' ? 150 : 0)}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={paying}
            className="w-full bg-gold text-teal-dark font-bold hover:bg-gold-dark text-center uppercase tracking-widest py-3.5 rounded transition flex items-center justify-center space-x-2 shadow-lg border border-gold text-sm font-semibold"
          >
            <span>{paying ? 'Weaving Order...' : (paymentMethod === 'COD' ? 'Place COD Order' : 'Authorize Secure Payment')}</span>
          </button>

          <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-500 pt-2">
            <ShieldCheck className="h-4 w-4 text-gold animate-pulse" />
            <span>Encrypted Razorpay Sandbox Checkout</span>
          </div>
        </div>

      </div>

      {/* ==================================================== */}
      {/* Razorpay Sandbox Payment Simulator Modal Overlay */}
      {/* ==================================================== */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-teal-dark/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e2124] border-2 border-gold rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
            
            {/* Header */}
            <div className="bg-[#0b1a1c] border-b border-gold/20 p-5 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="font-serif text-xl font-black tracking-widest text-gold">RAZORPAY</span>
                <span className="text-[9px] bg-red-950 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                  Sandbox Demo
                </span>
              </div>
              <span className="text-xs text-gray-400">ID: {simulatedOrderId}</span>
            </div>

            {/* Content Details */}
            <div className="p-6 space-y-6">
              <div className="text-center">
                <span className="text-xs text-gray-400 block mb-1">Payable to Vaarahi Sarees</span>
                <span className="font-serif text-3xl font-bold text-gold">₹{total}</span>
              </div>

              <div className="p-4 bg-teal-dark/30 border border-gold/15 rounded text-xs space-y-3 text-gray-300">
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span className="text-white font-bold">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="text-white font-bold">{user.email}</span>
                </div>
                <p className="text-[10px] text-gray-400 text-center border-t border-gold/10 pt-2.5">
                  This mock gateway simulates successful credit capture. Signature details are authenticated in our backend.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="py-3 border border-red-400 text-red-400 rounded text-xs uppercase tracking-widest font-bold hover:bg-red-400/10"
                >
                  Cancel Payment
                </button>
                <button
                  onClick={handleSimulatePaymentSuccess}
                  disabled={paying}
                  className="py-3 bg-gold text-teal-dark rounded text-xs uppercase tracking-widest font-bold hover:bg-gold-dark flex items-center justify-center space-x-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{paying ? 'Simulating...' : 'Verify Success'}</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
