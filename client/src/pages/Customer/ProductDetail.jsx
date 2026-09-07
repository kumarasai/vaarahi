import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShieldAlert, ShoppingBag, Heart, ShieldCheck, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import DrapeVideo from '../../components/product/DrapeVideo';
import FabricStory from '../../components/product/FabricStory';
import ProductCard from '../../components/product/ProductCard';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';

export default function ProductDetail() {
  const { slug } = useParams();
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Blouse Customization State
  const [blouseSelected, setBlouseSelected] = useState(false);
  const [blouseSize, setBlouseSize] = useState('Unstitched');
  
  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/slug/${slug}`)
      .then(res => {
        setProduct(res.data.product);
        setReviews(res.data.reviews || []);
        
        // Fetch recommendations once product is fetched
        return api.get(`/products/similar/${res.data.product._id}`);
      })
      .then(res => {
        setSimilarProducts(res.data.products || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-32 space-y-8 animate-pulse">
        <div className="h-6 w-48 bg-teal-dark rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="h-[500px] bg-teal-dark rounded" />
          <div className="space-y-6">
            <div className="h-10 bg-teal-dark rounded w-3/4" />
            <div className="h-6 bg-teal-dark rounded w-1/4" />
            <div className="h-32 bg-teal-dark rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-32 text-center">
        <h2 className="font-serif text-2xl text-gold">Product not found.</h2>
        <Link to="/shop" className="mt-4 inline-block text-sm border border-gold text-gold px-6 py-2 uppercase">Back to shop</Link>
      </div>
    );
  }

  const discountedPrice = Math.round(product.price * (1 - (product.discountPercent / 100)));
  const isFavorite = isInWishlist(product._id);

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please log in to add items to cart');
      return;
    }
    const res = await addToCart(product._id, 1, blouseSelected, blouseSize);
    if (res.success) {
      alert('Saree added to cart successfully!');
    } else {
      alert(res.message);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      alert('Please log in to manage your wishlist');
      return;
    }
    await toggleWishlist(product._id);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment) return;

    setSubmittingReview(true);
    try {
      const res = await api.post(`/products/reviews/${product._id}`, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment
      });

      if (res.data.success) {
        setReviews([res.data.review, ...reviews]);
        setReviewTitle('');
        setReviewComment('');
        alert('Review submitted successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-16">
      
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs uppercase tracking-wider text-gray-500 mb-8">
        <Link to="/" className="hover:text-gold">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/shop" className="hover:text-gold">Sarees</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-300">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
        
        {/* Images Lookbook (Left Column) - occupies 6/12 */}
        <div className="lg:col-span-7 grid grid-cols-12 gap-4">
          {/* Thumbnails list */}
          <div className="col-span-2 flex flex-col space-y-3">
            {product.images?.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`aspect-[3/4] rounded overflow-hidden border-2 transition-all ${
                  idx === activeImage ? 'border-gold scale-105' : 'border-gold/15 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img.secure_url} alt="thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Active Zoom Image */}
          <div className="col-span-10 relative aspect-[3/4] rounded-lg overflow-hidden border border-gold/15 bg-teal-dark/30 group">
            <img 
              src={product.images?.[activeImage]?.secure_url} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-125 cursor-zoom-in"
            />
            {/* Authenticity Certificate Badge */}
            {product.zariType === 'Pure Zari' && (
              <div className="absolute top-4 left-4 bg-gold/90 text-teal-dark text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded shadow border border-white/10">
                Pure Weave Handloom
              </div>
            )}
          </div>
        </div>

        {/* Product Details (Right Column) - occupies 5/12 */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-gold font-bold block mb-1">
              {product.weave} Handloom &bull; {product.fabric}
            </span>
            <h1 className="font-serif text-3xl text-teal-dark font-bold tracking-wide leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center space-x-2.5 mt-3">
              <div className="flex text-gold">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i <= Math.round(product.ratings.average) ? 'fill-gold' : 'text-gray-600'}`} 
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400">({product.ratings.count} Verified Reviews)</span>
            </div>
          </div>

          {/* Price Container */}
          <div className="p-4 bg-teal-dark border border-gold/15 rounded flex items-center justify-between shadow-md">
            <div>
              <span className="text-[10px] text-gray-300 uppercase tracking-widest block mb-0.5 font-semibold">Price</span>
              <div className="flex items-baseline space-x-3">
                <span className="font-serif text-2xl font-bold text-gold-light">₹{discountedPrice}</span>
                {product.discountPercent > 0 && (
                  <>
                    <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
                    <span className="text-xs text-green-400 font-bold">Save {product.discountPercent}%</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-300 uppercase tracking-widest block mb-0.5 font-semibold">Availability</span>
              {product.stock > 0 ? (
                product.stock <= 3 ? (
                  <span className="text-xs text-orange-400 font-bold animate-pulse">Only {product.stock} weaves left!</span>
                ) : (
                  <span className="text-xs text-green-400 font-bold">In Weave Shop</span>
                )
              ) : (
                <span className="text-xs text-gray-400 font-bold">Sold Out</span>
              )}
            </div>
          </div>

          {/* Custom Blouse stitching options */}
          <div className="p-5 border border-gold/15 bg-teal-dark rounded-lg space-y-4 shadow-md">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="blouseToggle"
                  checked={blouseSelected}
                  onChange={(e) => {
                    setBlouseSelected(e.target.checked);
                    if (!e.target.checked) setBlouseSize('Unstitched');
                  }}
                  className="accent-gold h-4 w-4 rounded"
                />
                <label htmlFor="blouseToggle" className="text-sm font-bold text-white cursor-pointer">
                  Request Blouse Stitching (+ ₹1,200)
                </label>
              </div>
              <span className="text-[10px] bg-gold/20 text-gold px-2 py-0.5 rounded font-medium">Optional</span>
            </div>

            {blouseSelected && (
              <div className="space-y-2 pt-2 border-t border-gold/10">
                <span className="text-xs font-semibold text-gold uppercase tracking-wider block">Blouse Size (Bust Inches)</span>
                <div className="flex gap-2 flex-wrap">
                  {['34', '36', '38', '40', '42'].map(size => (
                    <button
                      key={size}
                      onClick={() => setBlouseSize(size)}
                      className={`text-xs px-3.5 py-1.5 rounded transition ${
                        blouseSize === size 
                          ? 'bg-gold text-teal-dark font-bold' 
                          : 'bg-teal-deep border border-gold/20 text-gray-300 hover:border-gold/50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Buy actions */}
          <div className="flex space-x-4">
            <button
              disabled={product.stock === 0}
              onClick={handleAddToCart}
              className="flex-1 bg-gold text-teal-dark font-bold hover:bg-gold-light hover:text-teal-deep text-center uppercase tracking-widest py-4.5 rounded transition flex items-center justify-center space-x-2.5 shadow-lg border border-gold disabled:opacity-30 disabled:pointer-events-none"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>Add to Lookbook Cart</span>
            </button>

            <button
              onClick={handleWishlistToggle}
              className="p-4.5 border border-gold text-gold hover:bg-gold/10 rounded transition"
              title="Add to wishlist"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-gold text-gold' : ''}`} />
            </button>
          </div>

          {/* Authenticity Pledge note */}
          <div className="flex items-start space-x-3 text-xs text-gray-700 bg-gold/5 border border-gold/15 p-4 rounded-lg">
            <ShieldCheck className="h-5 w-5 text-gold flex-shrink-0" />
            <p className="leading-relaxed">
              Handloom weaving yields unique, slightly uneven textiles. Dry wash to preserve fine silk sheen. Packaged securely in breathable cotton.
            </p>
          </div>

        </div>
      </div>

      {/* Drape looping Video & Fabric Story panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
        
        {/* Drape fall loop video container */}
        <div className="lg:col-span-5">
          {product.video?.secure_url ? (
            <DrapeVideo 
              videoUrl={product.video.secure_url} 
              posterUrl={product.images?.[0]?.secure_url}
            />
          ) : (
            <div className="aspect-[9/16] rounded-lg bg-teal-dark border border-gold/15 flex flex-col items-center justify-center p-6 text-center text-gray-300">
              <h4 className="font-serif text-sm font-semibold text-gold mb-2 uppercase">Woven Storytelling</h4>
              <p className="text-xs max-w-[200px] leading-relaxed">Weaver interview and saree draping video demo coming soon.</p>
            </div>
          )}
        </div>

        {/* Fabric care, region narratives */}
        <div className="lg:col-span-7">
          <FabricStory 
            fabric={product.fabric}
            weave={product.weave}
            zariType={product.zariType}
            origin={product.origin}
            careInstructions={product.careInstructions}
          />
        </div>

      </div>

      {/* Reviews & Ratings Section */}
      <section className="mb-20 border-t border-gold/10 pt-16">
        <h2 className="font-serif text-2xl text-teal-dark font-bold tracking-widest uppercase text-center mb-12">
          Customer Critiques & Ratings
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Write a critique card */}
          <div className="lg:col-span-4 bg-teal-dark border border-gold/15 p-6 rounded-lg h-fit shadow-md">
            <h3 className="font-serif text-lg font-bold text-gold mb-4">Write a Review</h3>
            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-gold block mb-1 font-semibold">Rating</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full bg-teal-deep border border-gold/20 text-gold rounded p-2 text-sm focus:outline-none focus:border-gold"
                  >
                    <option value="5">5 Stars - Exquisite</option>
                    <option value="4">4 Stars - Beautiful</option>
                    <option value="3">3 Stars - Good</option>
                    <option value="2">2 Stars - Average</option>
                    <option value="1">1 Star - Disappointed</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-gold block mb-1 font-semibold">Critique Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stunning Banarasi craft!"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full bg-teal-deep border border-gold/20 text-white rounded p-2 text-sm focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-gold block mb-1 font-semibold">Commentary</label>
                  <textarea
                    required
                    rows="4"
                    placeholder="Describe your drape experience..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-teal-deep border border-gold/20 text-white rounded p-2 text-sm focus:outline-none focus:border-gold"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-gold text-teal-dark font-bold uppercase tracking-widest py-3 rounded text-xs hover:bg-gold-light hover:text-teal-deep transition shadow border border-gold"
                >
                  {submittingReview ? 'Submitting...' : 'Post Critique'}
                </button>
              </form>
            ) : (
              <p className="text-sm text-gray-300 text-center py-4 leading-relaxed">
                Please <Link to="/login" className="text-gold hover:text-white underline font-semibold">log in</Link> to share your weave experience.
              </p>
            )}
          </div>

          {/* List of reviews */}
          <div className="lg:col-span-8 space-y-6">
            {reviews.length > 0 ? (
              reviews.map((rev) => (
                <div key={rev._id} className="p-5 border-b border-gold/15 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-sm text-teal-dark">{rev.userName}</span>
                      <div className="flex text-gold mt-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} className={`h-3 w-3 ${i <= rev.rating ? 'fill-gold text-gold' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-500 font-semibold">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-teal-dark">{rev.title}</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border border-gold/15 bg-gold/5 rounded-lg">
                <p className="text-sm text-teal-dark font-medium">No critiques posted for this saree yet. Be the first to share your review!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Similar Drape Recommendations Row */}
      {similarProducts.length > 0 && (
        <section className="border-t border-gold/10 pt-16">
          <h2 className="font-serif text-2xl text-teal-dark font-bold tracking-widest uppercase mb-10">
            SIMILAR DRAPE RECOMMENDATIONS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {similarProducts.map(prod => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
