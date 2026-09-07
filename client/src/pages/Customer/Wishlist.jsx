import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import ProductCard from '../../components/product/ProductCard';

export default function Wishlist() {
  const { user } = useAuthStore();
  const { products, fetchWishlist, loading } = useWishlistStore();

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-32 text-center">
        <Heart className="h-16 w-16 text-gold mx-auto mb-6" />
        <h2 className="font-serif text-2xl text-white">Your Saved Lookbook</h2>
        <p className="text-gray-400 text-sm mt-2 mb-6">Please log in to preserve your favorite weaves.</p>
        <Link to="/login" className="bg-gold text-teal-dark font-bold uppercase tracking-widest px-8 py-3.5 border border-gold hover:bg-gold-dark">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-16">
      <h1 className="font-serif text-2xl md:text-3xl text-white font-bold tracking-widest uppercase mb-10 text-center">
        YOUR SAVED WEAVES
      </h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-pulse">
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} className="h-96 bg-teal-dark rounded" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 border border-gold/10 rounded bg-teal-dark/10">
          <Heart className="h-12 w-12 text-gold mx-auto mb-4" />
          <p className="font-serif text-lg text-gold tracking-wide">Your saved list is empty.</p>
          <Link to="/shop" className="mt-4 inline-block text-xs border border-gold text-gold px-8 py-3 uppercase tracking-wider hover:bg-gold hover:text-teal-dark transition">
            Explore Sarees Lookbook
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
