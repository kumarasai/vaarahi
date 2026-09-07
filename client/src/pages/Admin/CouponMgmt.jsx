import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Tag, Save } from 'lucide-react';
import api from '../../services/api';

export default function CouponMgmt() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrderAmount, setMinOrderAmount] = useState(1000);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(1000);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = () => {
    setLoading(true);
    api.get('/admin/coupons')
      .then(res => {
        setCoupons(res.data.coupons || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || !startDate || !endDate) return;

    try {
      await api.post('/admin/coupons', {
        code: code.toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount),
        maxDiscountAmount: discountType === 'percentage' ? Number(maxDiscountAmount) : undefined,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      });
      alert('Coupon created successfully.');
      setCode('');
      setShowAddForm(false);
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating coupon');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      fetchCoupons();
    } catch (err) {
      alert('Failed to delete coupon.');
    }
  };

  return (
    <div className="space-y-8 pt-4 text-xs">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gold/10 pb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-white font-bold tracking-widest uppercase">
            COUPON CODE SCHEMES
          </h1>
          <span className="text-xs text-gray-400 uppercase tracking-widest mt-1 block">
            Add seasonal percentage discounts or flat price cuts
          </span>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gold text-teal-dark font-bold text-xs uppercase tracking-widest px-6 py-3 rounded flex items-center space-x-1 hover:bg-gold-dark font-bold transition shadow"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>{showAddForm ? 'Close Form' : 'New Coupon'}</span>
        </button>
      </div>

      {/* Add Coupon Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="silk-card p-6 rounded-lg border border-gold/15 space-y-4 max-w-xl mx-auto">
          <h3 className="font-serif text-sm font-bold text-gold uppercase tracking-widest mb-3 flex items-center">
            <Tag className="h-4.5 w-4.5 mr-2" />
            <span>Create Promo Coupon</span>
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase text-gray-400 block mb-1">Coupon Code (Uppercase)</label>
              <input
                type="text"
                required
                placeholder="e.g. FESTIVE15"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-teal-dark border border-gold/20 text-white rounded p-2 focus:outline-none focus:border-gold uppercase"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-gray-400 block mb-1">Discount Scheme</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full bg-teal-dark border border-gold/20 text-gold rounded p-2 focus:outline-none"
              >
                <option value="percentage">Percentage Off (%)</option>
                <option value="flat">Flat Cash Cut (₹)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] uppercase text-gray-400 block mb-1">Discount Value</label>
              <input
                type="number"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full bg-teal-dark border border-gold/20 text-white rounded p-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-gray-400 block mb-1">Min Order Requirement</label>
              <input
                type="number"
                required
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                className="w-full bg-teal-dark border border-gold/20 text-white rounded p-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-gray-400 block mb-1">Max Cap Discount</label>
              <input
                type="number"
                value={maxDiscountAmount}
                disabled={discountType === 'flat'}
                onChange={(e) => setMaxDiscountAmount(e.target.value)}
                className="w-full bg-teal-dark border border-gold/20 text-white rounded p-2 focus:outline-none disabled:opacity-20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase text-gray-400 block mb-1">Starts At</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-teal-dark border border-gold/20 text-gold rounded p-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-gray-400 block mb-1">Expires At</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-teal-dark border border-gold/20 text-gold rounded p-2 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gold text-teal-dark font-bold uppercase tracking-widest py-3.5 rounded flex items-center justify-center space-x-1 font-semibold"
          >
            <Save className="h-4.5 w-4.5" />
            <span>Launch Coupon Code</span>
          </button>
        </form>
      )}

      {/* Coupon List */}
      {loading ? (
        <div className="h-64 bg-teal-dark rounded animate-pulse" />
      ) : coupons.length === 0 ? (
        <div className="text-center py-20 border border-gold/10 rounded bg-teal-dark/10">
          <Tag className="h-10 w-10 text-gold mx-auto mb-3" />
          <p className="font-serif text-base text-gold">No discount coupon campaigns active.</p>
        </div>
      ) : (
        <div className="silk-card rounded-lg border border-gold/15 p-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gold/10 text-gray-400 uppercase tracking-widest pb-3">
                  <th className="py-3">Coupon Code</th>
                  <th className="py-3">Type</th>
                  <th className="py-3">Discount Value</th>
                  <th className="py-3">Min Order Requirement</th>
                  <th className="py-3">Valid Dates</th>
                  <th className="py-3">Times Redeemed</th>
                  <th className="py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5 text-gray-300">
                {coupons.map(cop => {
                  const sDate = new Date(cop.startDate).toLocaleDateString();
                  const eDate = new Date(cop.endDate).toLocaleDateString();

                  return (
                    <tr key={cop._id} className="hover:bg-gold/5 transition-colors">
                      <td className="py-3.5 font-bold font-mono text-gold uppercase tracking-wider">{cop.code}</td>
                      <td className="py-3.5 capitalize">{cop.discountType}</td>
                      <td className="py-3.5 font-semibold text-white">
                        {cop.discountType === 'percentage' ? `${cop.discountValue}%` : `₹${cop.discountValue}`}
                      </td>
                      <td className="py-3.5">₹{cop.minOrderAmount}</td>
                      <td className="py-3.5">{sDate} &bull; {eDate}</td>
                      <td className="py-3.5">{cop.timesUsed} uses</td>
                      <td className="py-3.5 text-right">
                        <button 
                          onClick={() => handleDelete(cop._id)}
                          className="p-1 text-gray-500 hover:text-red-400 transition"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
