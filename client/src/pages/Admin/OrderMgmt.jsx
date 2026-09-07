import React, { useEffect, useState } from 'react';
import { Truck, Compass, CheckCircle2, ChevronDown, ChevronUp, Save } from 'lucide-react';
import api from '../../services/api';

export default function OrderMgmt() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // Status updating states
  const [status, setStatus] = useState('');
  const [courierName, setCourierName] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [description, setDescription] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/admin/orders')
      .then(res => {
        setOrders(res.data.orders);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleExpandClick = (order) => {
    if (expandedId === order._id) {
      setExpandedId(null);
      setUpdatingId(null);
    } else {
      setExpandedId(order._id);
      setUpdatingId(order._id);
      setStatus(order.orderStatus);
      setCourierName(order.trackingDetails?.courierName || '');
      setTrackingId(order.trackingDetails?.trackingId || '');
      setTrackingUrl(order.trackingDetails?.trackingUrl || '');
      setDescription('');
    }
  };

  const handleUpdateSubmit = async (e, orderId) => {
    e.preventDefault();
    try {
      await api.put(`/admin/orders/${orderId}`, {
        orderStatus: status,
        courierName,
        trackingId,
        trackingUrl,
        statusDescription: description || `Status updated to ${status}`
      });
      alert('Order logs updated successfully.');
      fetchOrders();
    } catch (err) {
      alert('Failed to update order details.');
    }
  };

  return (
    <div className="space-y-8 pt-4">
      
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl md:text-3xl text-white font-bold tracking-widest uppercase">
          ORDER LOG MANAGEMENT
        </h1>
        <span className="text-xs text-gray-400 uppercase tracking-widest mt-1 block">
          Track customer orders, assign courier packages, and dispatch deliveries
        </span>
      </div>

      {loading ? (
        <div className="h-64 bg-teal-dark rounded animate-pulse" />
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const isExpanded = expandedId === order._id;
            const orderDate = new Date(order.createdAt).toLocaleDateString();

            return (
              <div key={order._id} className="silk-card rounded-lg border border-gold/15 overflow-hidden">
                {/* Header Summary */}
                <div 
                  onClick={() => handleExpandClick(order)}
                  className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer bg-teal-dark/35 hover:bg-teal-dark/50 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-gold">
                        #{order._id.toString().substring(0, 8).toUpperCase()}
                      </span>
                      <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded border ${
                        order.orderStatus === 'Delivered' 
                          ? 'bg-green-950 text-green-400 border-green-500/30' 
                          : order.orderStatus === 'Cancelled'
                            ? 'bg-red-950 text-red-400 border-red-500/30'
                            : 'bg-gold/10 text-gold border border-gold/30'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 block">
                      Placed by {order.userId?.name} ({order.userId?.email}) on {orderDate}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="font-serif text-sm font-bold text-gold">₹{order.pricing.total}</span>
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-gold" /> : <ChevronDown className="h-5 w-5 text-gold" />}
                  </div>
                </div>

                {/* Expanded content details */}
                {isExpanded && (
                  <div className="p-5 border-t border-gold/10 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
                    {/* Summary list */}
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] text-gold uppercase tracking-widest font-bold block mb-1">Items Summary</span>
                        <div className="divide-y divide-gold/5">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center py-2">
                              <span>{item.name} ({item.blouseSize}) x{item.quantity}</span>
                              <span className="font-semibold text-gold">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-gold/10 pt-3">
                        <span className="text-[10px] text-gold uppercase tracking-widest font-bold block mb-1">Shipping Destination</span>
                        <p className="font-semibold text-white">{order.shippingAddress.name} &bull; {order.shippingAddress.phone}</p>
                        <p className="text-gray-300 mt-1">{order.shippingAddress.streetAddress}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pinCode}</p>
                      </div>

                      <div className="border-t border-gold/10 pt-3 flex justify-between">
                        <div>
                          <span className="text-[10px] text-gold uppercase tracking-widest font-bold block">Payment Method</span>
                          <span className="text-gray-300 font-semibold">{order.paymentDetails.paymentMethod}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gold uppercase tracking-widest font-bold block">Gateway Status</span>
                          <span className="text-gray-300 font-semibold">{order.paymentDetails.paymentStatus}</span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline edit sub-form */}
                    <div className="bg-teal-dark/15 border border-gold/10 p-4 rounded-lg">
                      <h4 className="font-serif text-sm font-bold text-gold uppercase tracking-widest mb-4 flex items-center">
                        <Compass className="h-4.5 w-4.5 mr-2" />
                        <span>Update Order Timeline</span>
                      </h4>

                      <form onSubmit={(e) => handleUpdateSubmit(e, order._id)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[9px] uppercase tracking-widest text-gray-400 block mb-1">Set Loom Status</label>
                            <select
                              value={status}
                              onChange={(e) => setStatus(e.target.value)}
                              className="w-full bg-teal-dark border border-gold/20 text-gold rounded p-2 focus:outline-none"
                            >
                              <option value="Placed">Placed</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Packed">Packed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[9px] uppercase tracking-widest text-gray-400 block mb-1">Courier Carrier</label>
                            <input
                              type="text"
                              placeholder="e.g. Delhivery, Bluedart"
                              value={courierName}
                              onChange={(e) => setCourierName(e.target.value)}
                              className="w-full bg-teal-dark border border-gold/20 text-white rounded p-2 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[9px] uppercase tracking-widest text-gray-400 block mb-1">Tracking ID</label>
                            <input
                              type="text"
                              placeholder="e.g. AWB9876543210"
                              value={trackingId}
                              onChange={(e) => setTrackingId(e.target.value)}
                              className="w-full bg-teal-dark border border-gold/20 text-white rounded p-2 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] uppercase tracking-widest text-gray-400 block mb-1">Tracking Link URL</label>
                            <input
                              type="text"
                              placeholder="http://tracking.delhivery.com/..."
                              value={trackingUrl}
                              onChange={(e) => setTrackingUrl(e.target.value)}
                              className="w-full bg-teal-dark border border-gold/20 text-white rounded p-2 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] uppercase tracking-widest text-gray-400 block mb-1">Milestone Description</label>
                          <input
                            type="text"
                            placeholder="e.g. Saree dispatched from Varanasi warehouse"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-teal-dark border border-gold/20 text-white rounded p-2 focus:outline-none focus:border-gold"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-gold text-teal-dark font-bold uppercase tracking-widest py-3 rounded flex items-center justify-center space-x-1 font-semibold"
                        >
                          <Save className="h-4 w-4" />
                          <span>Commit Log Details</span>
                        </button>

                      </form>
                    </div>

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
