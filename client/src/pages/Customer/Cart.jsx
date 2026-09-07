import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, ShieldCheck, Ticket } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { cart, fetchCart, updateCartItem, removeFromCart, applyCoupon, removeCoupon, coupon, getPricingDetails } = useCartStore();
  
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-32 text-center">
        <ShoppingBag className="h-16 w-16 text-gold mx-auto mb-6 animate-bounce" />
        <h2 className="font-serif text-2xl text-white">Your Lookbook Cart</h2>
        <p className="text-gray-400 text-sm mt-2 mb-6">Please log in to view and configure your selections.</p>
        <Link to="/login" className="bg-gold text-teal-dark font-bold uppercase tracking-widest px-8 py-3.5 border border-gold hover:bg-gold-dark">
          Sign In
        </Link>
      </div>
    );
  }

  const items = cart.items || [];
  const { subtotal, discount, shipping, tax, total } = getPricingDetails();

  const handleQtyChange = (item, direction) => {
    const newQty = direction === 'inc' ? item.quantity + 1 : item.quantity - 1;
    if (newQty < 1) return;
    updateCartItem(item._id, newQty, item.blouseSelected, item.blouseSize);
  };

  const handleSizeChange = (item, size) => {
    updateCartItem(item._id, item.quantity, item.blouseSelected, size);
  };

  const handleBlouseToggle = (item, isChecked) => {
    updateCartItem(item._id, item.quantity, isChecked, isChecked ? '38' : 'Unstitched');
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    if (!couponCode) return;
    
    const res = await applyCoupon(couponCode);
    if (res.success) {
      setCouponSuccess(`Coupon code applied! Saved ₹${res.discount}`);
    } else {
      setCouponError(res.message);
    }
  };

  const handleCheckoutRedirect = () => {
    if (items.length === 0) return;
    navigate('/checkout');
  };

  // Delivery date estimate (3 to 5 business days)
  const getDeliveryEstimate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 4);
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-16">
      <h1 className="font-serif text-2xl md:text-3xl text-white font-bold tracking-widest uppercase mb-10 text-center">
        YOUR LOOKBOOK CART
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20 border border-gold/10 rounded bg-teal-dark/10">
          <ShoppingBag className="h-12 w-12 text-gold mx-auto mb-4" />
          <p className="font-serif text-lg text-gold tracking-wide">Your cart is currently empty.</p>
          <Link to="/shop" className="mt-4 inline-block text-xs border border-gold text-gold px-8 py-3 uppercase tracking-wider hover:bg-gold hover:text-teal-dark transition">
            Explore Weaves Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Cart Items list (Left) - 8 columns */}
          <div className="lg:col-span-8 space-y-6">
            {items.map(item => {
              const product = item.productId;
              if (!product) return null;

              const discPrice = Math.round(product.price * (1 - (product.discountPercent / 100)));

              return (
                <div key={item._id} className="silk-card p-5 rounded-lg flex flex-col md:flex-row gap-5 border border-gold/10 items-stretch">
                  {/* Photo */}
                  <div className="w-full md:w-32 aspect-[3/4] rounded overflow-hidden flex-shrink-0 bg-teal-dark/50">
                    <img src={product.images?.[0]?.secure_url} alt={product.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Info details */}
                  <div className="flex-grow flex flex-col justify-between space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-gold uppercase tracking-widest font-semibold">{product.weave} &bull; {product.fabric}</span>
                        <h3 className="font-serif text-base text-white font-bold tracking-wide mt-0.5 line-clamp-1">{product.name}</h3>
                        <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                          <span>Color: {product.color?.name}</span>
                          <span className="h-3 w-3 rounded-full border border-white/20" style={{ backgroundColor: product.color?.hex }} />
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item._id)}
                        className="text-gray-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Stitching request controls */}
                    <div className="p-3 border border-gold/10 bg-teal-dark/15 rounded text-xs space-y-2.5">
                      <div className="flex justify-between items-center">
                        <label className="flex items-center space-x-2 text-gray-300 font-medium">
                          <input 
                            type="checkbox" 
                            checked={item.blouseSelected} 
                            onChange={(e) => handleBlouseToggle(item, e.target.checked)}
                            className="accent-gold h-3.5 w-3.5"
                          />
                          <span>Request Blouse Stitching (+ ₹1,200)</span>
                        </label>
                      </div>
                      {item.blouseSelected && (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Blouse Size (Bust):</span>
                          <select
                            value={item.blouseSize}
                            onChange={(e) => handleSizeChange(item, e.target.value)}
                            className="bg-teal-dark text-gold border border-gold/20 rounded px-2 py-0.5 font-bold focus:outline-none"
                          >
                            {['34', '36', '38', '40', '42'].map(sz => (
                              <option key={sz} value={sz}>{sz} Inches</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Quantity and Price Row */}
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center space-x-3 border border-gold/15 bg-teal-dark/40 rounded p-1">
                        <button 
                          onClick={() => handleQtyChange(item, 'dec')}
                          className="p-1 text-gold hover:text-white"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold text-white px-2">{item.quantity}</span>
                        <button 
                          onClick={() => handleQtyChange(item, 'inc')}
                          className="p-1 text-gold hover:text-white"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-serif text-base font-bold text-gold">₹{(discPrice + (item.blouseSelected ? 1200 : 0)) * item.quantity}</span>
                        <span className="text-[10px] text-gray-500 block">₹{discPrice} each</span>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing summary card (Right) - 4 columns */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Promo Code Form */}
            <div className="bg-teal-dark/30 border border-gold/15 p-5 rounded-lg">
              <h3 className="font-serif text-sm font-semibold text-gold uppercase tracking-widest mb-3 flex items-center">
                <Ticket className="h-4 w-4 mr-2" />
                <span>Promo Coupon</span>
              </h3>
              {coupon ? (
                <div className="flex justify-between items-center p-2.5 bg-gold/10 border border-gold/30 rounded">
                  <div>
                    <span className="text-xs font-bold text-gold uppercase tracking-widest">{coupon.code}</span>
                    <span className="text-[10px] text-green-400 block">Applied successfully</span>
                  </div>
                  <button 
                    onClick={removeCoupon}
                    className="text-xs text-red-400 underline uppercase"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCouponSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. FESTIVE15)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-grow bg-teal-dark text-white border border-gold/20 rounded p-2 text-xs focus:outline-none uppercase"
                  />
                  <button
                    type="submit"
                    className="bg-gold text-teal-dark font-bold text-xs uppercase px-4 rounded hover:bg-gold-dark"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[10px] text-red-400 mt-2">{couponError}</p>}
              {couponSuccess && <p className="text-[10px] text-green-400 mt-2">{couponSuccess}</p>}
            </div>

            {/* Price breakdown */}
            <div className="bg-teal-dark/30 border border-gold/15 p-6 rounded-lg space-y-4">
              <h3 className="font-serif text-sm font-bold text-gold uppercase tracking-widest border-b border-gold/10 pb-3">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-xs text-gray-300">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Coupon Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Delivery Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5% Handloom Tax)</span>
                  <span>₹{tax}</span>
                </div>
              </div>

              <div className="border-t border-gold/15 pt-4 flex justify-between items-baseline">
                <span className="font-serif text-sm font-bold text-white uppercase tracking-wider">Total Value</span>
                <span className="font-serif text-xl font-bold text-gold">₹{total}</span>
              </div>

              <div className="text-[10px] text-gray-400 text-center py-1">
                Estimated Delivery by: <strong className="text-white">{getDeliveryEstimate()}</strong>
              </div>

              <button
                onClick={handleCheckoutRedirect}
                className="w-full bg-gold text-teal-dark font-bold hover:bg-gold-dark text-center uppercase tracking-widest py-3.5 rounded transition flex items-center justify-center space-x-2 shadow-lg border border-gold text-sm font-semibold"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-500 pt-2">
                <ShieldCheck className="h-4 w-4 text-gold" />
                <span>Original products. Handloom authentic.</span>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
