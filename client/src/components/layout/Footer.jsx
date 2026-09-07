import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-teal-dark border-t border-gold/15 pt-16 pb-8 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        
        {/* About Column */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-serif text-2xl font-bold tracking-widest text-gold">VAARAHI</span>
            <Sparkles className="h-4 w-4 text-gold" />
          </Link>
          <p className="text-sm leading-relaxed text-gray-400">
            Weaving heritage and luxury. Vaarahi curates Telugu heritage and luxury handloom sarees directly from Master Weavers in Telangana and Andhra Pradesh. Empowering crafts, designing experiences.
          </p>
          <div className="flex space-x-4 pt-2">
            <a href="https://instagram.com" className="text-gold hover:text-white transition-colors duration-200" aria-label="Instagram">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="https://facebook.com" className="text-gold hover:text-white transition-colors duration-200" aria-label="Facebook">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
          </div>
        </div>

        {/* Shop Collections */}
        <div>
          <h4 className="font-serif text-lg text-gold font-bold mb-4 tracking-wider">Collections</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/shop?weave=Pochampally" className="hover:text-gold transition-colors duration-200">Pochampally Ikat</Link></li>
            <li><Link to="/shop?weave=Gadwal" className="hover:text-gold transition-colors duration-200">Gadwal Silk</Link></li>
            <li><Link to="/shop?weave=Venkatagiri" className="hover:text-gold transition-colors duration-200">Venkatagiri Handloom</Link></li>
            <li><Link to="/shop?weave=Dharmavaram" className="hover:text-gold transition-colors duration-200">Dharmavaram Bridal</Link></li>
          </ul>
        </div>

        {/* Policy links */}
        <div>
          <h4 className="font-serif text-lg text-gold font-bold mb-4 tracking-wider">Services & Policies</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-gold transition-colors duration-200">Our Heritage</Link></li>
            <li><Link to="/policies/shipping" className="hover:text-gold transition-colors duration-200">Shipping Policy</Link></li>
            <li><Link to="/policies/returns" className="hover:text-gold transition-colors duration-200">Return & Refund Policy</Link></li>
            <li><Link to="/policies/terms" className="hover:text-gold transition-colors duration-200">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Contact info */}
        <div>
          <h4 className="font-serif text-lg text-gold font-bold mb-4 tracking-wider">Contact Us</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center space-x-3">
              <MapPin className="h-4 w-4 text-gold flex-shrink-0" />
              <span>Plot 45, Road No 36, Jubilee Hills, Hyderabad, Telangana - 500033</span>
            </li>
            <li className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-gold flex-shrink-0" />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-gold flex-shrink-0" />
              <span>care@vaarahi.com</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 border-t border-gold/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} Vaarahi Saree Co. All Rights Reserved.</p>
        <p className="flex items-center space-x-1 mt-2 md:mt-0">
          <span>Secured payment with</span>
          <span className="text-gold font-bold tracking-wider">RAZORPAY</span>
        </p>
      </div>
    </footer>
  );
}
