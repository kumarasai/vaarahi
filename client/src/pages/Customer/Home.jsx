import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import api from '../../services/api';
import ProductCard from '../../components/product/ProductCard';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);

  const lookbookImages = [
    {
      src: '/vaarahi_pochampally_lookbook.jpg',
      title: 'Heritage Pochampally Ikat',
      tag: 'LEGACY 01 / TELANGANA WEAVES',
      desc: 'Intricate hand-dyed geometric double-ikat patterns woven on pure mulberry silk.',
      link: '/shop?weave=Pochampally'
    },
    {
      src: '/vaarahi_gadwal_lookbook.jpg',
      title: 'Royal Gadwal Silk',
      tag: 'LEGACY 02 / DECCAN SILKS',
      desc: 'Traditional Gadwal sarees combining pure cotton body with rich silk contrast borders and heavy gold zari pallu.',
      link: '/shop?weave=Gadwal'
    },
    {
      src: '/vaarahi_dharmavaram_lookbook.jpg',
      title: 'Bridal Dharmavaram Silk',
      tag: 'LEGACY 03 / ANDHRA HERITAGE',
      desc: 'Royal bridal weaves featuring broad gold borders, rich contrast pallus, and traditional peacock and elephant motifs.',
      link: '/shop?weave=Dharmavaram'
    }
  ];

  useEffect(() => {
    // Fetch featured sarees
    api.get('/products?limit=4')
      .then(res => {
        if (res.data.products) {
          setFeaturedProducts(res.data.products.filter(p => p.isFeatured));
        }
      })
      .catch(err => console.error(err));

    // Automated lookbook slideshow timer
    const timer = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % lookbookImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="pb-16 pt-[72px]">
      
      {/* 1. Creative Editorial Hero Section - Sticky Left Text, Cross-Fade Right Pop Image */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-24 grid grid-cols-1 md:grid-cols-12 gap-12 items-center relative">
        
        {/* Left Sticky Column */}
        <div className="md:col-span-5 space-y-6 py-12 flex flex-col justify-center min-h-[50vh] md:min-h-[70vh]">
          <div className="flex items-center space-x-2 text-gold">
            <span className="h-px w-8 bg-gold" />
            <span className="text-xs uppercase tracking-widest font-bold font-sans">Crafting Luxury</span>
          </div>
          
          <h1 className="font-serif text-4xl md:text-6xl font-light text-teal-dark tracking-wide leading-[1.15]">
            Weaving <br />
            <span className="text-gold font-light italic tracking-normal block my-1">Heritage Silks</span>
            for Modern Souls
          </h1>
          
          <p className="text-gray-700 text-sm md:text-base leading-relaxed max-w-md">
            Step into the visual diary of the Deccan's finest handloom threads. Hand-woven thread by thread, Vaarahi connects you directly with Master Weavers in Pochampally, Gadwal, Venkatagiri, and Dharmavaram.
          </p>

          <div className="pt-6">
            <Link 
              to="/shop"
              className="inline-flex items-center space-x-2 bg-teal-dark text-gold font-bold font-sans text-xs uppercase tracking-widest px-8 py-4 border border-gold hover:bg-gold hover:text-teal-dark transition-all duration-300 shadow-lg"
            >
              <span>Explore Masterpieces</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Quick Stats / Visual thread counts */}
          <div className="pt-12 border-t border-gold/15 grid grid-cols-2 gap-6">
            <div>
              <span className="font-serif text-3xl font-bold text-gold">Zari</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block mt-1">100% Certified Purity</span>
            </div>
            <div>
              <span className="font-serif text-3xl font-bold text-gold">Drape</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block mt-1">Pre-Stitched Custom Sizing</span>
            </div>
          </div>
        </div>

        {/* Right Single Frame Slideshow Column */}
        <div className="md:col-span-7 relative rounded-lg overflow-hidden border border-gold/15 shadow-2xl aspect-[3/4] w-full bg-teal-dark">
          {lookbookImages.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                idx === activeIdx ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
              }`}
            >
              <img
                src={img.src}
                alt={img.title}
                className="w-full h-full object-cover object-top filter brightness-[0.95]"
              />
              {/* Dynamic details overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-teal-dark/95 via-teal-dark/15 to-transparent flex flex-col justify-end p-8 md:p-12">
                <span className="text-[10px] md:text-xs text-gold uppercase tracking-widest font-bold mb-2">
                  {img.tag}
                </span>
                <h3 className="font-serif text-2xl md:text-4xl font-bold text-white tracking-wide leading-tight mb-2">
                  {img.title}
                </h3>
                <p className="text-gray-300 text-xs md:text-sm max-w-sm mb-4 leading-relaxed">
                  {img.desc}
                </p>
                <Link to={img.link} className="text-xs text-gold font-bold uppercase tracking-widest flex items-center hover:text-white transition-colors border-b border-gold/30 pb-0.5 w-max">
                  <span>Explore this Weave</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Link>
              </div>
            </div>
          ))}
          
          {/* Slideshow dots indicator */}
          <div className="absolute bottom-6 right-8 flex space-x-2 z-20">
            {lookbookImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={`h-2 w-2 rounded-full transition-all ${
                  idx === activeIdx ? 'bg-gold w-6' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 2. Collection Hubs (Visual Weave Grid) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-widest text-gold font-bold">Curated Masterpieces</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-teal-dark tracking-widest mt-2">SHOP BY REGIONAL WEAVE</h2>
          <div className="h-0.5 w-24 bg-gold mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pochampally */}
          <Link to="/shop?weave=Pochampally" className="group relative aspect-[4/5] rounded overflow-hidden shadow-2xl border border-gold/10">
            <img 
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=500" 
              alt="Pochampally Weaves" 
              className="w-full h-full object-cover filter brightness-[0.5] group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-teal-dark/90 to-transparent">
              <span className="text-[10px] text-gold uppercase tracking-widest font-bold">Telangana</span>
              <h3 className="font-serif text-xl font-bold text-white tracking-wider mt-1">Pochampally Ikat</h3>
              <p className="text-xs text-gray-400 mt-2 flex items-center group-hover:text-gold transition-colors">
                <span>Explore handloom ikat</span>
                <ArrowRight className="h-3 w-3 ml-2" />
              </p>
            </div>
          </Link>

          {/* Gadwal */}
          <Link to="/shop?weave=Gadwal" className="group relative aspect-[4/5] rounded overflow-hidden shadow-2xl border border-gold/10">
            <img 
              src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=500" 
              alt="Gadwal Weaves" 
              className="w-full h-full object-cover filter brightness-[0.5] group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-teal-dark/90 to-transparent">
              <span className="text-[10px] text-gold uppercase tracking-widest font-bold">Telangana</span>
              <h3 className="font-serif text-xl font-bold text-white tracking-wider mt-1">Gadwal Silk</h3>
              <p className="text-xs text-gray-400 mt-2 flex items-center group-hover:text-gold transition-colors">
                <span>Explore temple borders</span>
                <ArrowRight className="h-3 w-3 ml-2" />
              </p>
            </div>
          </Link>

          {/* Venkatagiri */}
          <Link to="/shop?weave=Venkatagiri" className="group relative aspect-[4/5] rounded overflow-hidden shadow-2xl border border-gold/10">
            <img 
              src="https://images.unsplash.com/photo-1583391265517-35bbdad01209?q=80&w=500" 
              alt="Venkatagiri Handlooms" 
              className="w-full h-full object-cover filter brightness-[0.5] group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-teal-dark/90 to-transparent">
              <span className="text-[10px] text-gold uppercase tracking-widest font-bold">Andhra Pradesh</span>
              <h3 className="font-serif text-xl font-bold text-white tracking-wider mt-1">Venkatagiri Silk</h3>
              <p className="text-xs text-gray-400 mt-2 flex items-center group-hover:text-gold transition-colors">
                <span>Explore fine golden drapes</span>
                <ArrowRight className="h-3 w-3 ml-2" />
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Featured Products Hub */}
      <section className="bg-teal-dark/10 border-y border-gold/10 py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <span className="text-xs uppercase tracking-widest text-teal-dark font-bold">Bestsellers Selection</span>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-teal-dark tracking-wider mt-1">FEATURED WEDDING DRAPES</h2>
            </div>
            <Link to="/shop" className="text-xs uppercase tracking-widest text-teal-dark hover:text-gold flex items-center mt-4 md:mt-0 font-bold border-b border-teal-dark/40 pb-1">
              <span>View All Sarees</span>
              <ArrowRight className="h-3 w-3 ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.length > 0 ? (
              featuredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              // Loading fallback or placeholder cards
              [1, 2, 3, 4].map(idx => (
                <div key={idx} className="h-96 rounded-lg shimmer-loading" />
              ))
            )}
          </div>
        </div>
      </section>

      {/* 4. Fabric Story visual showcase */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center space-x-2 text-teal-dark">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-xs uppercase tracking-widest font-bold">Handloom Certified</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-teal-dark tracking-wide">WEAVING TRUST IN EVERY THREAD</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Every Vaarahi saree carries a certification verifying pure gold/silver zari content and genuine handloom authenticity. We partner directly with award-winning weaver cooperatives in Telangana and Andhra Pradesh, ensuring equitable profit sharing and preserving heritage crafting lineages.
            </p>
            <div className="pt-4 flex items-center space-x-8">
              <div>
                <span className="text-2xl font-serif text-teal-dark font-bold">100%</span>
                <span className="text-xs text-gray-600 uppercase tracking-wider block font-medium">Handcrafted</span>
              </div>
              <div className="w-[1px] h-10 bg-gold/30" />
              <div>
                <span className="text-2xl font-serif text-teal-dark font-bold">500+</span>
                <span className="text-xs text-gray-600 uppercase tracking-wider block font-medium">Weavers Active</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 gap-4">
            <img 
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400" 
              alt="Saree Crafting" 
              className="rounded shadow-2xl border border-gold/15 object-cover w-full aspect-square"
            />
            <img 
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400" 
              alt="Thread Details" 
              className="rounded shadow-2xl border border-gold/15 object-cover w-full aspect-square mt-8"
            />
          </div>

        </div>
      </section>

      {/* 5. Visual Testimonials */}
      <section className="bg-teal-dark border-t border-gold/15 py-20 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <span className="text-xs uppercase tracking-widest text-gold-light font-bold">Royal Feedbacks</span>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-gold tracking-wider mt-1 mb-10">REVIEWS FROM OUR PATRONS</h2>
          
          <div className="space-y-6">
            <div className="flex justify-center text-gold-light space-x-1">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-5 w-5 fill-gold" />)}
            </div>
            <p className="font-serif text-lg md:text-xl text-white/95 italic leading-relaxed">
              "The Dharmavaram Bridal Silk Saree I ordered for my wedding was breathtaking. The rich contrast pallu and the sheen of the gold zari felt incredibly royal. Vaarahi Silks made shopping for authentic Telugu handloom sarees online feel completely authentic and premium."
            </p>
            <div>
              <span className="text-xs uppercase tracking-widest text-gold-light font-bold">Sirisha Reddy</span>
              <span className="text-[10px] text-gray-300 block uppercase tracking-wider mt-0.5">Jubilee Hills, Hyderabad</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
