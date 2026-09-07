import { create } from 'zustand';
import api from '../services/api';

export const useCartStore = create((set, get) => ({
  cart: { items: [] },
  loading: false,
  error: null,
  coupon: null,
  discount: 0,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/cart');
      set({ cart: res.data.cart, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addToCart: async (productId, quantity = 1, blouseSelected = false, blouseSize = 'Unstitched') => {
    set({ loading: true });
    try {
      const res = await api.post('/cart', { productId, quantity, blouseSelected, blouseSize });
      set({ cart: res.data.cart, loading: false });
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to add item to cart';
      set({ error: errMsg, loading: false });
      return { success: false, message: errMsg };
    }
  },

  updateCartItem: async (itemId, quantity, blouseSelected, blouseSize) => {
    set({ loading: true });
    try {
      const res = await api.put('/cart', { itemId, quantity, blouseSelected, blouseSize });
      set({ cart: res.data.cart, loading: false });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update item';
      set({ error: errMsg, loading: false });
    }
  },

  removeFromCart: async (itemId) => {
    set({ loading: true });
    try {
      const res = await api.delete(`/cart/${itemId}`);
      set({ cart: res.data.cart, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  clearCart: async () => {
    set({ loading: true });
    try {
      await api.delete('/cart');
      set({ cart: { items: [] }, coupon: null, discount: 0, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  applyCoupon: async (code) => {
    try {
      // Validate coupon on client/server. Let's make a request or mock it locally
      const res = await api.get('/admin/coupons'); // Admin read coupon list (or a guest checkout endpoint). Let's mock a simple check:
      const coupons = res.data.coupons || [];
      const match = coupons.find(c => c.code === code.toUpperCase() && c.isActive);
      
      if (!match) {
        return { success: false, message: 'Invalid or expired coupon code' };
      }

      const { subtotal } = get().getPricingDetails();
      if (subtotal < match.minOrderAmount) {
        return { success: false, message: `Minimum purchase of ₹${match.minOrderAmount} required` };
      }

      let discountVal = 0;
      if (match.discountType === 'flat') {
        discountVal = match.discountValue;
      } else {
        discountVal = Math.round((subtotal * match.discountValue) / 100);
        if (match.maxDiscountAmount && discountVal > match.maxDiscountAmount) {
          discountVal = match.maxDiscountAmount;
        }
      }

      set({ coupon: match, discount: discountVal });
      return { success: true, discount: discountVal };
    } catch (err) {
      // Offline fallback check if server fails
      if (code.toUpperCase() === 'FESTIVE15') {
        const { subtotal } = get().getPricingDetails();
        const discountVal = Math.round(subtotal * 0.15);
        set({ 
          coupon: { code: 'FESTIVE15', discountType: 'percentage', discountValue: 15 }, 
          discount: discountVal 
        });
        return { success: true, discount: discountVal };
      }
      return { success: false, message: 'Error checking coupon' };
    }
  },

  removeCoupon: () => {
    set({ coupon: null, discount: 0 });
  },

  getPricingDetails: () => {
    const items = get().cart.items || [];
    let subtotal = 0;
    
    items.forEach(item => {
      if (item.productId) {
        const price = item.productId.price;
        const discountPercent = item.productId.discountPercent || 0;
        const discountedPrice = Math.round(price * (1 - (discountPercent / 100)));
        subtotal += discountedPrice * item.quantity;
      }
    });

    const discount = get().discount;
    const shipping = subtotal - discount > 2000 || subtotal === 0 ? 0 : 150;
    const tax = Math.round((subtotal - discount) * 0.05); // 5% GST
    const total = subtotal - discount + shipping + tax;

    return {
      subtotal,
      discount,
      shipping,
      tax,
      total
    };
  }
}));
