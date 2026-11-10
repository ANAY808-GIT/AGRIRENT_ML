import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Star,
  MessageSquare,
  Tractor,
  Calendar,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export default function FarmerReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.getFarmerReviews();
        if (res.success) {
          setReviews(res.reviews);
        }
      } catch (err) {
        console.error('Failed to load farmer reviews:', err);
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
        <p className="text-sm font-semibold text-slate-600">Loading your feedback submissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Equipment Reviews</h1>
        <p className="text-xs text-slate-500">Ratings and field performance feedback you have shared with equipment owners.</p>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Reviews Published Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once you conclude a machinery rental, you can rate the equipment's condition and operator reliability from the My Bookings page.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                    <img src={r.machinery_image} alt={r.machinery_name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{r.machinery_name}</h4>
                    <p className="text-[11px] text-slate-500">Owner: {r.owner_name}</p>
                  </div>
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

              <p className="text-xs text-slate-700 leading-relaxed italic">
                "{r.comment}"
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Verified Fieldwork</span>
                <span>{r.created_at ? r.created_at.split(' ')[0] : 'Concluded'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

