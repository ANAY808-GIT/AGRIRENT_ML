import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Star,
  User,
  MapPin,
  Calendar,
  MessageSquare,
  Loader2,
  Award,
  ThumbsUp
} from 'lucide-react';

export default function OwnerReviews() {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(5.0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.getOwnerReviews();
        if (res.success) {
          setReviews(res.reviews);
          setAvgRating(res.avg_rating);
        }
      } catch (err) {
        console.error('Failed to load owner reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading farmer ratings and reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Customer Reviews & Ratings</h1>
          <p className="text-xs text-slate-500">Feedback submitted by farmers following completed machinery rentals.</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Fleet Rating</p>
            <p className="text-xl font-black text-amber-950">{avgRating} <span className="text-xs font-normal text-amber-800">/ 5.0 ({reviews.length} reviews)</span></p>
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Reviews Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once farmers conclude machinery rentals, their submitted ratings and condition comments will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{r.machinery_name}</h4>
                    <p className="text-[11px] text-slate-500">{r.machinery_category}</p>
                  </div>

                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < r.rating ? 'fill-current text-amber-500' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-700 mt-3 leading-relaxed italic">
                  "{r.comment || 'Smooth operation, equipment was well maintained.'}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  {r.farmer_name} ({r.farmer_district})
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {r.created_at ? r.created_at.split(' ')[0] : 'Verified Rental'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

