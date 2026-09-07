import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  IndianRupee, 
  ShoppingBag, 
  Truck, 
  Users, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import api from '../../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => {
        setStats(res.data.stats);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse pt-4">
        <div className="h-10 bg-teal-dark rounded w-48" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-teal-dark rounded" />)}
        </div>
        <div className="h-64 bg-teal-dark rounded" />
      </div>
    );
  }

  const { 
    totalRevenue = 0, 
    ordersCount = 0, 
    productsCount = 0, 
    usersCount = 0, 
    lowStockAlerts = [], 
    recentOrders = [], 
    salesOverTime = [] 
  } = stats || {};

  const summaryCards = [
    { name: 'Total Revenue', value: `₹${totalRevenue}`, icon: IndianRupee, color: 'text-gold' },
    { name: 'Order Logs', value: ordersCount, icon: Truck, color: 'text-blue-400' },
    { name: 'Active Weaves', value: productsCount, icon: ShoppingBag, color: 'text-green-400' },
    { name: 'Subscribed Patrons', value: usersCount, icon: Users, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-8 pt-4">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-2xl md:text-3xl text-white font-bold tracking-widest uppercase">
          OPERATIONAL LOOM STATS
        </h1>
        <span className="text-xs text-gray-400 uppercase tracking-widest mt-1 block">
          Sales reports and inventory stock trackers
        </span>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="silk-card p-5 rounded-lg border border-gold/10 flex justify-between items-center bg-teal-dark/30">
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">{card.name}</span>
                <span className="font-serif text-2xl font-bold text-white">{card.value}</span>
              </div>
              <div className={`p-3 bg-teal-dark/50 rounded-full border border-gold/15 ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart and Low Stock alerts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recharts Area Chart - occupies 2 columns */}
        <div className="lg:col-span-2 bg-teal-dark/30 border border-gold/15 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-sm font-bold text-gold uppercase tracking-widest flex items-center">
              <TrendingUp className="h-4.5 w-4.5 mr-2" />
              <span>Earnings Velocity (Monthly Trend)</span>
            </h3>
          </div>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c5a059" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#c5a059" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#021a1c', borderColor: '#c5a059', borderRadius: '4px' }}
                  labelStyle={{ color: '#c5a059', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#c5a059" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts column */}
        <div className="lg:col-span-1 bg-teal-dark/30 border border-gold/15 p-6 rounded-lg flex flex-col">
          <h3 className="font-serif text-sm font-bold text-red-400 uppercase tracking-widest flex items-center mb-6">
            <AlertTriangle className="h-4.5 w-4.5 mr-2 text-red-400" />
            <span>Low Stock Alerts</span>
          </h3>

          <div className="flex-grow space-y-4 overflow-y-auto max-h-60 pr-1 scrollbar-thin">
            {lowStockAlerts.length > 0 ? (
              lowStockAlerts.map(item => (
                <div key={item._id} className="p-3 border border-red-500/20 bg-red-950/5 rounded flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white block">{item.name}</span>
                    <span className="text-[10px] text-gray-400 mt-0.5 block">{item.fabric} &bull; ₹{item.price}</span>
                  </div>
                  <span className="font-bold text-red-400 bg-red-950/20 border border-red-500/30 px-2.5 py-0.5 rounded text-[10px]">
                    Qty: {item.stock}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500 text-xs">
                All saree weaves are adequately stocked!
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Recent Orders table */}
      <div className="bg-teal-dark/30 border border-gold/15 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-serif text-sm font-bold text-gold uppercase tracking-widest">
            Recent Order Logs
          </h3>
          <Link to="/admin/orders" className="text-xs text-gold underline flex items-center">
            <span>View All Log Books</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gold/10 text-gray-400 uppercase tracking-widest pb-3">
                <th className="py-3">Order ID</th>
                <th className="py-3">Patron Name</th>
                <th className="py-3">Date</th>
                <th className="py-3">Total Value</th>
                <th className="py-3">Payment</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/5 text-gray-300">
              {recentOrders.map(order => (
                <tr key={order._id}>
                  <td className="py-3.5 font-mono text-gold font-bold">
                    #{order._id.toString().substring(0, 8).toUpperCase()}
                  </td>
                  <td className="py-3.5">{order.userId?.name || 'Guest'}</td>
                  <td className="py-3.5">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-3.5 font-bold">₹{order.pricing.total}</td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${
                      order.paymentDetails.paymentStatus === 'Paid' 
                        ? 'bg-green-950 text-green-400 border border-green-500/25' 
                        : 'bg-orange-950 text-orange-400 border border-orange-500/25'
                    }`}>
                      {order.paymentDetails.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 font-semibold">{order.orderStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
