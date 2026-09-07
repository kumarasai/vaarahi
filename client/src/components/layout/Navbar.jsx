import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, Sun, Moon, Sparkles, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { cart, fetchCart } = useCartStore();
  const { products: wishlistItems, fetchWishlist } = useWishlistStore();
  
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Apply initial theme
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
    }
  }, [theme]);

  useEffect(() => {
    if (user) {
      fetchCart();
      fetchWishlist();
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    const root = document.documentElement;
    if (nextTheme === 'light') {
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartCount = cart.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'py-3 bg-teal-dark/95 border-b border-gold/15 shadow-lg' 
        : 'py-4 bg-teal-dark border-b border-gold/15'
    }`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
        
        {/* Brand Logo - Cinzel Elegance */}
        <Link to="/" className="flex items-center space-x-2 group">
          <span className="font-serif text-2xl md:text-3xl font-bold tracking-widest text-gold group-hover:text-white transition-colors duration-300">
            VAARAHI
          </span>
          <Sparkles className="h-4 w-4 text-gold animate-pulse" />
        </Link>

        {/* Navigation links */}
        <div className="hidden md:flex space-x-8 text-sm uppercase tracking-widest font-semibold text-gold">
          <Link to="/" className="hover:text-white transition-colors duration-200">Home</Link>
          <Link to="/shop" className="hover:text-white transition-colors duration-200">Sarees</Link>
          <Link to="/shop?weave=Pochampally" className="hover:text-white transition-colors duration-200">Pochampally</Link>
          <Link to="/shop?weave=Gadwal" className="hover:text-white transition-colors duration-200">Gadwal</Link>
          <Link to="/about" className="hover:text-white transition-colors duration-200">Our Story</Link>
        </div>

        {/* Quick Utilities */}
        <div className="flex items-center space-x-4 md:space-x-6">
          
          {/* Festive Light/Dark Toggle */}
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-gold/10 transition-colors text-gold hover:text-white"
            title="Toggle Festive Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Wishlist Icon */}
          <Link 
            to="/wishlist" 
            className="relative p-2 rounded-full hover:bg-gold/10 transition-colors text-gold hover:text-white"
          >
            <Heart className="h-5 w-5" />
            {wishlistItems.length > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 bg-maroon text-[10px] text-white flex items-center justify-center rounded-full border border-gold">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Cart Icon */}
          <Link 
            to="/cart" 
            className="relative p-2 rounded-full hover:bg-gold/10 transition-colors text-gold hover:text-white"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 bg-gold text-[10px] text-teal-dark flex items-center justify-center font-bold rounded-full border border-teal-dark">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth/Profile */}
          {user ? (
            <div className="relative group">
              <button className="flex items-center space-x-1 p-2 text-gold hover:text-white focus:outline-none">
                <User className="h-5 w-5" />
                <span className="hidden lg:inline text-xs max-w-[80px] truncate">{user.name}</span>
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-48 bg-teal-dark border border-gold/20 rounded shadow-xl py-2 hidden group-hover:block transition-all duration-300">
                <Link to="/profile" className="px-4 py-2 text-sm hover:bg-gold/10 hover:text-gold block">My Profile</Link>
                <Link to="/orders" className="px-4 py-2 text-sm hover:bg-gold/10 hover:text-gold block">My Orders</Link>
                {(user.role === 'admin' || user.role === 'sub-admin') && (
                  <Link to="/admin" className="px-4 py-2 text-sm hover:bg-gold/10 hover:text-gold flex items-center space-x-2 block border-t border-gold/10 pt-2 text-gold">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <button 
                  onClick={handleLogout} 
                  className="w-full text-left px-4 py-2 text-sm hover:bg-maroon/20 hover:text-white flex items-center space-x-2 block border-t border-gold/10 pt-2 text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="text-xs uppercase tracking-widest border border-gold/50 px-4 py-2 hover:bg-gold hover:text-teal-dark transition-all duration-300 text-gold"
            >
              Sign In
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
}
