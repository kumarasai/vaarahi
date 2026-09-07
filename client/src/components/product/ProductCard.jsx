import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

export default function ProductCard({ product }) {
  const { user } = useAuthStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();

  const isFavorite = isInWishlist(product._id);
  const discountedPrice = Math.round(product.price * (1 - (product.discountPercent / 100)));

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please log in to manage your wishlist');
      return;
    }
    await toggleWishlist(product._id);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please log in to add items to cart');
      return;
    }
    const res = await addToCart(product._id, 1, false, 'Unstitched');
    if (res.success) {
      // Small feedback alert or toast can go here
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="group relative silk-card rounded-lg overflow-hidden flex flex-col h-full">
      {/* Product Image Container */}
      <Link to={`/product/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-teal-dark/50">
        <img 
          src={product.images?.[0]?.secure_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400'} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Shimmer Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-gold/0 via-gold/10 to-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Authenticity Certificate Badge */}
        {product.zariType === 'Pure Zari' && (
          <span className="absolute top-3 left-3 bg-gold/90 text-teal-dark text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded shadow-lg border border-white/20">
            Handloom Authenticated
          </span>
        )}

        {/* Low Stock Indicator */}
        {product.stock <= 3 && product.stock > 0 && (
          <span className="absolute bottom-3 left-3 bg-maroon/90 text-white text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border border-gold/30">
            Only {product.stock} Weaves Left
          </span>
        )}
        
        {product.stock === 0 && (
          <span className="absolute inset-0 bg-teal-dark/80 backdrop-blur-[2px] flex items-center justify-center text-gold text-xs uppercase tracking-widest font-bold">
            Out of Weave
          </span>
        )}
      </Link>

      {/* Heart Wishlist Toggle */}
      <button 
        onClick={handleWishlistToggle}
        className="absolute top-3 right-3 p-2 bg-teal-dark/70 hover:bg-gold/20 text-gold hover:text-white rounded-full transition-all duration-300 z-10 border border-gold/25"
      >
        <Heart className={`h-4.5 w-4.5 ${isFavorite ? 'fill-gold text-gold' : ''}`} />
      </button>

      {/* Info Container */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <span className="text-[10px] text-gold uppercase tracking-widest font-semibold block mb-1">
            {product.weave} &bull; {product.fabric}
          </span>
          <Link to={`/product/${product.slug}`} className="hover:text-gold transition-colors duration-200">
            <h3 className="font-serif text-base text-gray-200 font-semibold tracking-wide line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mt-4 pt-3 border-t border-gold/10 flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="font-serif text-lg font-bold text-gold">₹{discountedPrice}</span>
            {product.discountPercent > 0 && (
              <>
                <span className="text-xs text-gray-500 line-through">₹{product.price}</span>
                <span className="text-[10px] text-green-400 font-semibold">({product.discountPercent}% Off)</span>
              </>
            )}
          </div>

          {product.stock > 0 && (
            <button 
              onClick={handleAddToCart}
              className="p-2 bg-gold/15 hover:bg-gold text-gold hover:text-teal-dark rounded transition-colors duration-300 border border-gold/20"
              title="Add one piece to cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
