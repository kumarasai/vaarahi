import React, { useEffect, useState } from 'react';
import { Star, ShieldAlert, CheckCircle, Trash2 } from 'lucide-react';
import api from '../../services/api';

export default function ReviewMgmt() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = () => {
    setLoading(true);
    api.get('/admin/reviews')
      .then(res => {
        setReviews(res.data.reviews || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const toggleApproval = async (id) => {
    try {
      const res = await api.put(`/admin/reviews/${id}/approve`);
      if (res.data.success) {
        alert('Review approval status toggled.');
        fetchReviews();
      }
    } catch (err) {
      alert('Error updating review status.');
    }
  };

  return (
    <div className="space-y-8 pt-4 text-xs">
      
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl md:text-3xl text-white font-bold tracking-widest uppercase">
          CUSTOMER CRITIQUE MODERATION
        </h1>
        <span className="text-xs text-gray-400 uppercase tracking-widest mt-1 block">
          Verify product critiques and control public feedback visibility
        </span>
      </div>

      {loading ? (
        <div className="h-64 bg-teal-dark rounded animate-pulse" />
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 border border-gold/10 rounded bg-teal-dark/10">
          <Star className="h-10 w-10 text-gold mx-auto mb-3" />
          <p className="font-serif text-base text-gold">No critiques recorded in the ledger books yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(rev => {
            const dateStr = new Date(rev.createdAt).toLocaleDateString();

            return (
              <div key={rev._id} className="silk-card p-5 rounded-lg border border-gold/15 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                
                <div className="space-y-2 flex-grow">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-bold text-white text-sm">{rev.userName}</span>
                    <span className="text-[10px] text-gray-500">{dateStr}</span>
                    <span className="text-[10px] text-gold uppercase tracking-wider">
                      Product: {rev.productId?.name || 'Deleted Product'}
                    </span>
                  </div>
                  
                  {/* Stars */}
                  <div className="flex text-gold">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className={`h-3 w-3 ${i <= rev.rating ? 'fill-gold text-gold' : 'text-gray-700'}`} />
                    ))}
                  </div>

                  <h4 className="font-bold text-gold text-xs">{rev.title}</h4>
                  <p className="text-gray-300 text-xs leading-relaxed max-w-2xl">{rev.comment}</p>
                </div>

                <div className="flex-shrink-0 self-end md:self-auto flex items-center space-x-3">
                  <button
                    onClick={() => toggleApproval(rev._id)}
                    className={`px-3 py-1.5 rounded font-bold uppercase tracking-wider text-[9px] border transition ${
                      rev.isApproved 
                        ? 'bg-green-950 text-green-400 border-green-500/30 hover:bg-green-900/30' 
                        : 'bg-orange-950 text-orange-400 border-orange-500/30 hover:bg-orange-900/30'
                    }`}
                  >
                    {rev.isApproved ? 'Approved (Public)' : 'Concealed (Moderated)'}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
