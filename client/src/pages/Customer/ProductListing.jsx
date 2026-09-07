import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import api from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import VisualFilters from '../../components/product/VisualFilters';

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filtersData, setFiltersData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Read filter state from query parameters or default
  const activeFilters = {
    search: searchParams.get('search') || '',
    fabric: searchParams.get('fabric') || '',
    weave: searchParams.get('weave') || '',
    occasion: searchParams.get('occasion') || '',
    color: searchParams.get('color') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
    page: searchParams.get('page') || '1'
  };

  useEffect(() => {
    // Fetch unique filters catalog once
    api.get('/products/filters')
      .then(res => setFiltersData(res.data.filters))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    setLoading(true);
    
    // Construct query parameters
    const params = new URLSearchParams();
    if (activeFilters.search) params.append('search', activeFilters.search);
    if (activeFilters.fabric) params.append('fabric', activeFilters.fabric);
    if (activeFilters.weave) params.append('weave', activeFilters.weave);
    if (activeFilters.occasion) params.append('occasion', activeFilters.occasion);
    if (activeFilters.color) params.append('color', activeFilters.color);
    if (activeFilters.maxPrice) params.append('maxPrice', activeFilters.maxPrice);
    if (activeFilters.sort) params.append('sort', activeFilters.sort);
    if (activeFilters.page) params.append('page', activeFilters.page);

    api.get(`/products?${params.toString()}`)
      .then(res => {
        setProducts(res.data.products);
        setPagination(res.data.pagination);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [searchParams]);

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    
    // Reset page on filter update
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams({ page: '1' }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-16">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 pb-6 border-b border-gold/10 gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-white font-bold tracking-widest uppercase">
            THE SAREE LOOKBOOK
          </h1>
          <span className="text-xs text-gray-400 uppercase tracking-widest mt-1 block">
            {loading ? 'Sifting weaves...' : `${pagination.total || 0} exquisite sarees discovered`}
          </span>
        </div>

        {/* Search bar & Sort Controls */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0 w-full md:w-64">
            <input 
              type="text" 
              placeholder="Search fabrics, weaves..."
              value={activeFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full bg-teal-dark/50 border border-gold/20 text-white rounded px-4 py-2 text-sm pl-10 focus:outline-none focus:border-gold"
            />
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gold" />
          </div>

          <select
            value={activeFilters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="bg-teal-dark border border-gold/20 text-gold rounded px-3 py-2 text-sm focus:outline-none focus:border-gold"
          >
            <option value="newest">New Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="popularity">Popularity</option>
          </select>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden p-2 border border-gold/25 text-gold hover:bg-gold/10 rounded"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left column: Visual filters (Desktop) */}
        <div className="hidden md:block lg:col-span-1">
          {filtersData && (
            <VisualFilters 
              filtersData={filtersData}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          )}
        </div>

        {/* Mobile Filter Slideover */}
        {showMobileFilters && filtersData && (
          <div className="fixed inset-0 bg-teal-dark/95 z-50 p-6 overflow-y-auto md:hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-lg font-bold text-gold">Filters</h3>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="text-xs text-gold border border-gold/30 rounded px-3 py-1 uppercase"
              >
                Close
              </button>
            </div>
            <VisualFilters 
              filtersData={filtersData}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>
        )}

        {/* Right column: Saree Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 6].map(idx => (
                <div key={idx} className="h-96 rounded-lg shimmer-loading" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination controls */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-12">
                  <button
                    disabled={pagination.page === 1}
                    onClick={() => handleFilterChange('page', String(pagination.page - 1))}
                    className="px-4 py-2 border border-gold/30 text-gold rounded text-xs disabled:opacity-30 disabled:pointer-events-none uppercase tracking-widest font-semibold hover:bg-gold/10 transition"
                  >
                    Prev
                  </button>
                  <span className="text-xs text-gray-400">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    disabled={pagination.page === pagination.pages}
                    onClick={() => handleFilterChange('page', String(pagination.page + 1))}
                    className="px-4 py-2 border border-gold/30 text-gold rounded text-xs disabled:opacity-30 disabled:pointer-events-none uppercase tracking-widest font-semibold hover:bg-gold/10 transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 border border-gold/10 rounded bg-teal-dark/10">
              <p className="font-serif text-lg text-gold tracking-wide">No weaves found matching your filters.</p>
              <button
                onClick={handleClearFilters}
                className="mt-4 text-xs border border-gold/45 text-gold px-6 py-2 uppercase tracking-wider hover:bg-gold hover:text-teal-dark transition"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
