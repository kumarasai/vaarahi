import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Package, Truck, ArrowLeftRight, CheckCircle, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../services/api';
import VisualTimeline from '../../components/product/VisualTimeline';
import { useAuthStore } from '../../store/authStore';

export default function MyOrders() {
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  // Return requests state
  const [showReturnForm, setShowReturnForm] = useState(null); // stores orderId if form is open
  const [returnProduct, setReturnProduct] = useState('');
  const [returnReason, setReturnReason] = useState('Color mismatch');
  const [returnDesc, setReturnDesc] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/orders/my-orders')
      .then(res => {
        setOrders(res.data.orders || []);
        if (res.data.orders?.length > 0) {
          setExpandedOrder(res.data.orders[0]._id); // Expand first by default
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this saree order? We have reserved these threads specifically for you.')) return;
    try {
      const res = await api.put(`/orders/${orderId}/cancel`);
      if (res.data.success) {
        alert('Order cancelled successfully.');
        fetchOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleReturnSubmit = async (e, orderId) => {
    e.preventDefault();
    if (!returnProduct) {
      alert('Please select a product to return');
      return;
    }

    setSubmittingReturn(true);
    try {
      const res = await api.post('/returns', {
        orderId,
        productId: returnProduct,
        quantity: 1, // default return 1 saree
        reason: returnReason,
        description: returnDesc,
        images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400']
      });

      if (res.data.success) {
        alert('Return request submitted. An admin will verify the craft quality and authorize refund.');
        setShowReturnForm(null);
        setReturnDesc('');
        fetchOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to request return');
    } finally {
      setSubmittingReturn(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-32 text-center">
        <Package className="h-16 w-16 text-gold mx-auto mb-6" />
        <h2 className="font-serif text-2xl text-white">Your Orders History</h2>
        <p className="text-gray-400 text-sm mt-2 mb-6">Please log in to track your order timeline.</p>
        <Link to="/login" className="bg-gold text-teal-dark font-bold uppercase tracking-widest px-8 py-3.5 border border-gold hover:bg-gold-dark">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 pt-24 pb-16">
      
      {/* Checkout Success Alert Notice */}
      {searchParams.get('success') && (
        <div className="bg-gold/15 border border-gold text-gold p-5 rounded-lg mb-10 text-center space-y-2">
          <CheckCircle className="h-8 w-8 mx-auto text-gold animate-bounce" />
          <h2 className="font-serif text-xl font-bold tracking-widest uppercase">ORDER WEAVING SECURED!</h2>
          <p className="text-xs text-gray-300 max-w-lg mx-auto">
            Your transaction has been processed. We are preparing the loom threads for your selected sarees and will email shipping tracking details shortly.
          </p>
        </div>
      )}

      <h1 className="font-serif text-2xl md:text-3xl text-white font-bold tracking-widest uppercase mb-10 text-center">
        YOUR ORDERS & WEAVES
      </h1>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          {[1, 2].map(idx => (
            <div key={idx} className="h-48 bg-teal-dark rounded" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 border border-gold/10 rounded bg-teal-dark/10">
          <Package className="h-12 w-12 text-gold mx-auto mb-4" />
          <p className="font-serif text-lg text-gold tracking-wide">No orders placed yet.</p>
          <Link to="/shop" className="mt-4 inline-block text-xs border border-gold text-gold px-8 py-3 uppercase tracking-wider hover:bg-gold hover:text-teal-dark transition">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => {
            const isExpanded = expandedOrder === order._id;
            const orderDate = new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

            return (
              <div key={order._id} className="silk-card rounded-lg overflow-hidden border border-gold/15">
                
                {/* Order Summary Header Header */}
                <div 
                  onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                  className="bg-teal-dark/40 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-teal-dark/60 transition"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-gold uppercase tracking-wider">
                        Order #{order._id.toString().substring(0, 8).toUpperCase()}
                      </span>
                      <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded ${
                        order.orderStatus === 'Delivered' 
                          ? 'bg-green-950 text-green-400 border border-green-500/30' 
                          : order.orderStatus === 'Cancelled' 
                            ? 'bg-red-950 text-red-400 border border-red-500/30'
                            : 'bg-gold/10 text-gold border border-gold/30'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 block">Placed on {orderDate}</span>
                  </div>

                  <div className="flex items-center space-x-4 self-end sm:self-auto">
                    <span className="font-serif text-base font-bold text-gold">₹{order.pricing.total}</span>
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-gold" /> : <ChevronDown className="h-5 w-5 text-gold" />}
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="p-5 border-t border-gold/10 space-y-6">
                    
                    {/* Products details */}
                    <div className="divide-y divide-gold/5">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex py-4 gap-4 first:pt-0 last:pb-0 items-center justify-between">
                          <div className="flex items-center space-x-3.5">
                            <img src={item.image} alt={item.name} className="h-14 w-11 object-cover rounded bg-teal-dark/50" />
                            <div>
                              <span className="text-xs font-bold text-white block leading-snug">{item.name}</span>
                              <span className="text-[10px] text-gold uppercase block mt-1">Blouse Bust: {item.blouseSize} &bull; Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <span className="font-serif text-sm font-semibold text-gold">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Progress visual Timeline */}
                    <VisualTimeline 
                      orderStatus={order.orderStatus} 
                      statusTimeline={order.statusTimeline} 
                    />

                    {/* Courier Carrier ID Tracking */}
                    {order.trackingDetails?.trackingId && (
                      <div className="bg-teal-dark/20 p-4 border border-gold/10 rounded flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2.5 text-gray-300">
                          <Truck className="h-4.5 w-4.5 text-gold" />
                          <span>
                            Shipped via <strong className="text-white">{order.trackingDetails.courierName}</strong>: ID <strong>{order.trackingDetails.trackingId}</strong>
                          </span>
                        </div>
                        {order.trackingDetails.trackingUrl && (
                          <a 
                            href={order.trackingDetails.trackingUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-gold underline font-semibold"
                          >
                            Trace Package
                          </a>
                        )}
                      </div>
                    )}

                    {/* Shipping Destination */}
                    <div className="text-xs text-gray-400 space-y-1">
                      <span className="text-[10px] text-gold uppercase tracking-widest font-bold block mb-1">Shipping Address</span>
                      <p className="text-white font-semibold">{order.shippingAddress.name} ({order.shippingAddress.phone})</p>
                      <p>{order.shippingAddress.streetAddress}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pinCode}</p>
                    </div>

                    {/* Return Form Toggle Trigger */}
                    {order.orderStatus === 'Delivered' && !showReturnForm && (
                      <button
                        onClick={() => {
                          setShowReturnForm(order._id);
                          setReturnProduct(order.items?.[0]?.productId || '');
                        }}
                        className="text-xs border border-gold/45 text-gold px-4 py-2 hover:bg-gold hover:text-teal-dark transition flex items-center space-x-2 uppercase font-bold"
                      >
                        <ArrowLeftRight className="h-4 w-4" />
                        <span>Request Return / Refund</span>
                      </button>
                    )}

                    {/* Return Form Details */}
                    {showReturnForm === order._id && (
                      <form 
                        onSubmit={(e) => handleReturnSubmit(e, order._id)}
                        className="p-5 border border-gold/15 bg-teal-dark/20 rounded space-y-4"
                      >
                        <h4 className="font-serif text-sm font-bold text-gold uppercase">Return Request Form</h4>
                        
                        <div>
                          <label className="text-[10px] uppercase text-gray-400 block mb-1">Select Item to Return</label>
                          <select
                            value={returnProduct}
                            onChange={(e) => setReturnProduct(e.target.value)}
                            className="w-full bg-teal-dark border border-gold/20 text-gold rounded p-2 text-xs focus:outline-none"
                          >
                            {order.items?.map(i => (
                              <option key={i.productId} value={i.productId}>{i.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] uppercase text-gray-400 block mb-1">Return Reason</label>
                            <select
                              value={returnReason}
                              onChange={(e) => setReturnReason(e.target.value)}
                              className="w-full bg-teal-dark border border-gold/20 text-gold rounded p-2 text-xs focus:outline-none"
                            >
                              <option value="Color mismatch">Color/Hue mismatch</option>
                              <option value="Fabric quality issue">Fabric quality issue</option>
                              <option value="Defective weave">Defective weave/zari work</option>
                              <option value="Incorrect item sent">Incorrect item sent</option>
                              <option value="Other">Other reason</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] uppercase text-gray-400 block mb-1">Details / Commentary</label>
                            <textarea
                              required
                              rows="1"
                              placeholder="Please explain the weave issue..."
                              value={returnDesc}
                              onChange={(e) => setReturnDesc(e.target.value)}
                              className="w-full bg-teal-dark border border-gold/20 text-white rounded p-2 text-xs focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowReturnForm(null)}
                            className="text-xs text-gray-400 px-4 py-2 border border-gold/10 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={submittingReturn}
                            className="bg-gold text-teal-dark font-bold text-xs uppercase px-6 py-2 rounded"
                          >
                            {submittingReturn ? 'Submitting...' : 'Request Refund'}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Order Cancellation option */}
                    {['Placed', 'Confirmed'].includes(order.orderStatus) && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="text-xs text-red-400 underline hover:text-white uppercase font-bold"
                      >
                        Cancel Weave Order
                      </button>
                    )}

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
