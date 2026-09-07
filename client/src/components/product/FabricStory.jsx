import React from 'react';
import { ShieldCheck, Compass, Info, Award } from 'lucide-react';

export default function FabricStory({ fabric, weave, zariType, origin, careInstructions = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-teal-dark border border-gold/15 p-6 md:p-8 rounded-lg">
      
      {/* Story Column */}
      <div className="space-y-4 flex flex-col justify-center">
        <div className="flex items-center space-x-2 text-gold">
          <Award className="h-5 w-5" />
          <h3 className="font-serif text-lg font-bold uppercase tracking-wider">The Fabric Narrative</h3>
        </div>
        <p className="text-sm leading-relaxed text-gray-300">
          This masterpiece is handcrafted in <strong className="text-white">{origin || 'India'}</strong>, representing generations of skill. 
          Woven as a authentic <strong className="text-white">{weave}</strong> saree, its base is constructed from premium quality <strong className="text-white">{fabric}</strong> threads. 
          The metallic ornamentation uses certified <strong className="text-gold font-semibold">{zariType}</strong>, imparting a luxurious luster that captures light gracefully.
        </p>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-start space-x-2.5">
            <Compass className="h-4 w-4 text-gold mt-1 flex-shrink-0" />
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Weave Origin</span>
              <span className="text-sm text-white">{origin || 'Indian Handloom'}</span>
            </div>
          </div>
          <div className="flex items-start space-x-2.5">
            <ShieldCheck className="h-4 w-4 text-gold mt-1 flex-shrink-0" />
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Zari Authenticity</span>
              <span className="text-sm text-white">{zariType}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Care Details Column */}
      <div className="border-t md:border-t-0 md:border-l border-gold/10 pt-6 md:pt-0 md:pl-8 space-y-4">
        <div className="flex items-center space-x-2 text-gold">
          <Info className="h-5 w-5" />
          <h3 className="font-serif text-lg font-bold uppercase tracking-wider">Heritage & Wash Care</h3>
        </div>
        <p className="text-xs text-gray-400">
          Handloom textiles possess unique variations in weave and texture, which are signatures of pure human craftsmanship and not defects.
        </p>
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold text-gray-300 uppercase tracking-widest block">Care Instructions</span>
          {careInstructions.length > 0 ? (
            <ul className="space-y-2">
              {careInstructions.map((instruction, idx) => (
                <li key={idx} className="flex items-center space-x-2.5 text-sm text-gray-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center space-x-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                <span>Dry Clean Only is recommended to preserve silk luster</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                <span>Store wrapped in fine cotton/muslin fabric</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                <span>Iron only on low heat on the reverse side</span>
              </li>
            </ul>
          )}
        </div>
      </div>

    </div>
  );
}
