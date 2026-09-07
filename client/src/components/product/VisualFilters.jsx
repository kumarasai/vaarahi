import React from 'react';
import { X } from 'lucide-react';

export default function VisualFilters({ 
  filtersData, 
  activeFilters, 
  onFilterChange, 
  onClearFilters 
}) {
  const { fabrics = [], weaves = [], occasions = [], colors = [], maxPrice = 100000 } = filtersData || {};

  const handleToggle = (type, value) => {
    if (activeFilters[type] === value) {
      onFilterChange(type, ''); // Clear filter if clicked again
    } else {
      onFilterChange(type, value);
    }
  };

  const hasActiveFilters = Object.values(activeFilters).some(val => val !== '');

  return (
    <div className="space-y-8 bg-teal-dark/35 border border-gold/15 p-6 rounded-lg backdrop-blur-md">
      <div className="flex justify-between items-center pb-4 border-b border-gold/10">
        <h3 className="font-serif text-lg font-bold text-gold tracking-wider">Filters</h3>
        {hasActiveFilters && (
          <button 
            onClick={onClearFilters}
            className="text-xs text-red-400 hover:text-white flex items-center space-x-1 uppercase tracking-wider"
          >
            <X className="h-3 w-3" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Weave Filters */}
      <div>
        <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-3">Weave / Region</h4>
        <div className="flex flex-wrap gap-2">
          {weaves.map(w => (
            <button
              key={w}
              onClick={() => handleToggle('weave', w)}
              className={`text-xs px-3.5 py-1.5 rounded transition-all duration-300 border ${
                activeFilters.weave === w
                  ? 'bg-gold text-teal-dark border-gold font-bold shadow-lg'
                  : 'bg-teal-dark/50 text-gray-300 border-gold/15 hover:border-gold/50'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Fabric Filters */}
      <div>
        <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-3">Fabric</h4>
        <div className="flex flex-wrap gap-2">
          {fabrics.map(f => (
            <button
              key={f}
              onClick={() => handleToggle('fabric', f)}
              className={`text-xs px-3.5 py-1.5 rounded transition-all duration-300 border ${
                activeFilters.fabric === f
                  ? 'bg-gold text-teal-dark border-gold font-bold shadow-lg'
                  : 'bg-teal-dark/50 text-gray-300 border-gold/15 hover:border-gold/50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Occasion Filters */}
      <div>
        <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-3">Occasion</h4>
        <div className="flex flex-wrap gap-2">
          {occasions.map(o => (
            <button
              key={o}
              onClick={() => handleToggle('occasion', o)}
              className={`text-xs px-3.5 py-1.5 rounded transition-all duration-300 border ${
                activeFilters.occasion === o
                  ? 'bg-gold text-teal-dark border-gold font-bold shadow-lg'
                  : 'bg-teal-dark/50 text-gray-300 border-gold/15 hover:border-gold/50'
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Color Swatches */}
      <div>
        <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-3">Color Swatch</h4>
        <div className="flex flex-wrap gap-3">
          {colors.map(col => (
            <button
              key={col.name}
              onClick={() => handleToggle('color', col.name)}
              className={`group relative h-8 w-8 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                activeFilters.color === col.name
                  ? 'border-gold scale-110 shadow-lg ring-1 ring-gold/40'
                  : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: col.hex }}
              title={col.name}
            >
              <span className="absolute bottom-full mb-1 bg-teal-dark text-[10px] text-white px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {col.name}
              </span>
              {activeFilters.color === col.name && (
                <span className="h-2 w-2 rounded-full bg-white shadow-sm" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price Slider */}
      <div>
        <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-3">Price Range</h4>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max={maxPrice}
            value={activeFilters.maxPrice || maxPrice}
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
            className="w-full accent-gold bg-teal-dark h-1 rounded"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>₹0</span>
            <span className="text-gold font-semibold">Under ₹{activeFilters.maxPrice || maxPrice}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
