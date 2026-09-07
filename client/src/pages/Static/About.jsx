import React from 'react';
import { Sparkles, Heart, Compass } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 pt-24 pb-16 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-widest text-gold font-bold">The Vaarahi Saga</span>
        <h1 className="font-serif text-3xl md:text-4xl text-white font-bold tracking-widest uppercase mt-2">
          OUR WEAVER HERITAGE
        </h1>
        <div className="h-0.5 w-24 bg-gold mx-auto mt-4" />
      </div>

      {/* Main Image */}
      <div className="relative aspect-[21/9] rounded-lg overflow-hidden border border-gold/15 shadow-2xl bg-teal-dark/50">
        <img 
          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000" 
          alt="Weaver's loom" 
          className="w-full h-full object-cover filter brightness-[0.4]"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-serif text-lg md:text-2xl text-gold italic tracking-widest text-center px-4">
            "Preserving the thread of Indian handloom heritage."
          </span>
        </div>
      </div>

      {/* Story Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm leading-relaxed text-gray-300">
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-gold flex items-center">
            <Compass className="h-5 w-5 mr-2" />
            <span>The Loom Origins</span>
          </h3>
          <p>
            Vaarahi was founded in Hyderabad with a simple yet ambitious vision: to build a modern lookbook portal that connects master silk weavers of Telangana and Andhra Pradesh directly with saree connoisseurs worldwide. 
          </p>
          <p>
            Traditional handlooms are delicate cultural relics. Each Pochampally geometric layout, Gadwal temple border, and Dharmavaram pattern represents hours of meticulous loom-draping, a craft passed down through generations.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-gold flex items-center">
            <Heart className="h-5 w-5 mr-2" />
            <span>Our Weaver Promise</span>
          </h3>
          <p>
            By eliminating intermediaries, we return 85% of profits directly to our partner cooperatives. This economic empowerment ensures the survival of traditional Telugu handloom weaving lineages in the age of fast-fashion duplication.
          </p>
          <p>
            Every warp and weft of a Vaarahi saree carries a guarantee of authenticity. When you drape a Vaarahi, you drape a story.
          </p>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-teal-dark/25 p-6 border border-gold/10 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="space-y-2">
          <span className="text-gold font-serif text-lg font-bold block">100% PURE SILK</span>
          <p className="text-xs text-gray-400">Mulberry silk threads and authenticated metallic zari gold dust overlays.</p>
        </div>
        <div className="space-y-2 border-t md:border-t-0 md:border-x border-gold/10 py-4 md:py-0">
          <span className="text-gold font-serif text-lg font-bold block">DIRECT FAIR-TRADE</span>
          <p className="text-xs text-gray-400">Direct cooperative partnerships offering ethical earnings for weavers.</p>
        </div>
        <div className="space-y-2">
          <span className="text-gold font-serif text-lg font-bold block">7-DAY RETURN WINDOW</span>
          <p className="text-xs text-gray-400">Hassle-free shipping and returns with full money back guarantee.</p>
        </div>
      </div>

    </div>
  );
}
