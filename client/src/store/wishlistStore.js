import { create } from 'zustand';
import api from '../services/api';

export const useWishlistStore = create((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchWishlist: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/wishlist');
      set({ products: res.data.wishlist.products, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  toggleWishlist: async (productId) => {
    try {
      const res = await api.post(`/wishlist/${productId}`);
      
      const products = get().products;
      const isExist = products.some(p => p._id === productId);
      
      let updatedProducts;
      if (isExist) {
        updatedProducts = products.filter(p => p._id !== productId);
      } else {
        // Fetch product from server or add custom. We just fetch the updated list
        const detailRes = await api.get('/wishlist');
        updatedProducts = detailRes.data.wishlist.products;
      }
      
      set({ products: updatedProducts });
      return { success: true, action: res.data.action };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  isInWishlist: (productId) => {
    return get().products.some(p => p._id === productId);
  }
}));
