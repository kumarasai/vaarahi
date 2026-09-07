import React, { useEffect, useState } from 'react';
import { ShieldCheck, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function ReturnMgmt() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = () => {
    setLoading(true);
    api.get('/admin/returns')
      .then(res => {
        setReturns(res.data.returns || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleAction = async (id, action, notes) => {
    try {
      const res = await api.put(`/admin/returns/${id}`, { action, adminNotes: notes });
      if (res.data.success) {
        alert(`Return status updated successfully: ${action}`);
        fetchReturns();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing return action');
    }
  };

  return (
    <div className="space-y-8 pt-4">
      
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl md:text-3xl text-white font-bold tracking-widest uppercase">
          RETURN & REFUND DISPATCH
        </h1>
        <span className="text-xs text-gray-400 uppercase tracking-widest mt-1 block">
          Assess product return requests, check craft quality reports, and trigger Razorpay refunds
        </span>
      </div>

      {loading ? (
        <div className="h-64 bg-teal-dark rounded animate-pulse" />
      ) : returns.length === 0 ? (
        <div className="text-center py-20 border border-gold/10 rounded bg-teal-dark/10">
          <AlertCircle className="h-10 w-10 text-gold mx-auto mb-3" />
          <p className="font-serif text-base text-gold">No pending return requests found.</p>
        </div>
      ) : (
        <div className="space-y-4 text-xs">
          {returns.map(ret => {
            const reqDate = new Date(ret.createdAt).toLocaleDateString();

            return (
              <div key={ret._id} className="silk-card p-5 rounded-lg border border-gold/15 space-y-4">
                
                {/* Header Info */}
                <div className="flex justify-between items-start border-b border-gold/5 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">
                        Return Request for Order #{ret.orderId?._id?.toString().substring(0, 8).toUpperCase() || 'UNKNOWN'}
                      </span>
                      <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded border ${
                        ret.status === 'Refunded' 
                          ? 'bg-green-950 text-green-400 border-green-500/30' 
                          : ret.status === 'Rejected' 
                            ? 'bg-red-950 text-red-400 border-red-500/30'
                            : 'bg-gold/10 text-gold border border-gold/30'
                      }`}>
                        {ret.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 block">
                      Submitted by {ret.userId?.name} ({ret.userId?.email}) on {reqDate}
                    </span>
                  </div>
                  
                  <span className="font-serif text-sm font-bold text-gold">
                    Refund Amount: ₹{ret.orderId?.pricing?.total || 'N/A'}
                  </span>
                </div>

                {/* Return particulars */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
                  <div className="space-y-2">
                    <span className="text-[9px] text-gold uppercase tracking-widest font-bold block">Reason for return</span>
                    <p className="text-white font-semibold">{ret.reason}</p>
                    <p className="text-gray-300 mt-1">{ret.description || 'No additional explanation.'}</p>
                  </div>

                  <div>
                    <span className="text-[9px] text-gold uppercase tracking-widest font-bold block mb-2">Item to Return</span>
                    {ret.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2.5 bg-teal-dark/20 p-2.5 border border-gold/10 rounded">
                        <img 
                          src={item.productId?.images?.[0]?.secure_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=100'} 
                          alt="Saree preview" 
                          className="h-10 w-7.5 object-cover rounded bg-teal-dark/50"
                        />
                        <div>
                          <span className="font-bold text-white block">{item.productId?.name}</span>
                          <span className="text-[9px] text-gold uppercase mt-0.5 block">{item.productId?.weave} &bull; Qty: {item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Refund transaction logs */}
                {ret.status === 'Refunded' && ret.refundDetails && (
                  <div className="p-3.5 bg-green-950/20 border border-green-500/20 rounded-lg text-xs space-y-1 text-green-400">
                    <span className="font-bold block uppercase tracking-widest text-[9px]">Refund Captured</span>
                    <p>Refund ID: <strong className="text-white font-mono">{ret.refundDetails.razorpayRefundId}</strong></p>
                    <p>Status: <strong className="text-white">{ret.refundDetails.refundStatus}</strong> on {new Date(ret.refundDetails.initiatedAt).toLocaleString()}</p>
                  </div>
                )}

                {/* Action buttons */}
                {ret.status === 'Requested' && (
                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={() => handleAction(ret._id, 'Approved', 'Return approved by admin.')}
                      className="px-4 py-2 border border-gold text-gold font-bold uppercase rounded text-[10px] hover:bg-gold/10 flex items-center space-x-1"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>Approve Quality Inspection</span>
                    </button>
                    <button
                      onClick={() => handleAction(ret._id, 'Rejected', 'Return request rejected. Item did not pass handloom criteria.')}
                      className="px-4 py-2 border border-red-500 text-red-500 font-bold uppercase rounded text-[10px] hover:bg-red-500/10 flex items-center space-x-1"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject Request</span>
                    </button>
                  </div>
                )}

                {ret.status === 'Approved' && (
                  <button
                    onClick={() => handleAction(ret._id, 'Refund', 'Refund dispatched.')}
                    className="w-full bg-gold text-teal-dark font-bold uppercase tracking-widest py-3.5 rounded text-[10px] hover:bg-gold-dark flex items-center justify-center space-x-1 font-semibold"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Trigger Razorpay Refund API</span>
                  </button>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
