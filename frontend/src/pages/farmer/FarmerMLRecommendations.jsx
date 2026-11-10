import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  TrendingUp,
  Clock,
  MapPin,
  Calendar,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Info
} from 'lucide-react';

export default function FarmerMLRecommendations() {
  const { user } = useAuth();

  const [state, setState] = useState(user?.state || 'Karnataka');
  const [district, setDistrict] = useState(user?.district || 'Mysuru');
  const [month, setMonth] = useState(10);
  const [season, setSeason] = useState('Kharif');

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = async (dist, st, mth, ssn) => {
    setLoading(true);
    try {
      const res = await api.getSeasonalRecommendations({
        district: dist || district,
        state: st || state,
        month: Number(mth || month),
        season: ssn || season
      });
      if (res.success) {
        setRecommendations(res.recommendations);
      }
    } catch (err) {
      console.error('Failed to load seasonal recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(district, state, month, season);
  }, []);

  const handleFilterChange = (newDist, newMonth) => {
    setDistrict(newDist);
    setMonth(newMonth);
    const newSeason = newMonth >= 6 && newMonth <= 10 ? 'Kharif' : newMonth <= 3 ? 'Rabi' : 'Summer';
    setSeason(newSeason);
    fetchRecommendations(newDist, state, newMonth, newSeason);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-100 text-lime-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-lime-700" />
            <span>Farmer Demand Intelligence</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Machine Learning Equipment Advisory
          </h1>
          <p className="text-xs text-slate-500">
            AI-driven demand forecasts tailored to your district to prevent equipment shortages and lock in optimal rates.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 max-w-sm">
          <Info className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Trained on 1,200 synthetic demonstration records. Designed for collegiate showcase & validation.</span>
        </div>
      </div>

      {/* District & Timing Selector Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Your Farm District
          </label>
          <select
            value={district}
            onChange={(e) => handleFilterChange(e.target.value, month)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="Mysuru">Mysuru (Karnataka)</option>
            <option value="Mandya">Mandya (Karnataka)</option>
            <option value="Hassan">Hassan (Karnataka)</option>
            <option value="Belagavi">Belagavi (Karnataka)</option>
            <option value="Pune">Pune (Maharashtra)</option>
            <option value="Guntur">Guntur (Andhra Pradesh)</option>
            <option value="Coimbatore">Coimbatore (Tamil Nadu)</option>
            <option value="Warangal">Warangal (Telangana)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Farming Window / Month
          </label>
          <select
            value={month}
            onChange={(e) => handleFilterChange(district, Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value={10}>October (Kharif Harvest Window)</option>
            <option value={11}>November (Post-Harvest / Rabi Sowing)</option>
            <option value={2}>February (Rabi Land Preparation)</option>
            <option value={4}>April (Summer Pre-Monsoon Tillage)</option>
            <option value={6}>June (Monsoon Sowing & Puddling)</option>
          </select>
        </div>

        <div className="sm:pt-5">
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
            Current Season: <strong>{season} Season</strong>
          </div>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-600">Generating AI seasonal recommendations...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">#0{idx + 1} Equipment Rank</span>
                    <h3 className="font-extrabold text-lg text-slate-900 mt-0.5">{rec.machinery_type}</h3>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wide ${rec.badge_class}`}>
                    {rec.demand_level} Demand
                  </span>
                </div>

                <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="text-xs text-slate-500 font-medium">Forecasted Monthly Utilization:</p>
                  <p className="text-2xl font-black text-slate-900">
                    {rec.predicted_demand} <span className="text-xs font-normal text-slate-500">units in {district}</span>
                  </p>
                </div>

                {/* Farmer Strategy Advisory */}
                <div className="mt-4 space-y-2">
                  <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 text-xs text-emerald-950 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-emerald-900">
                      <Clock className="w-3.5 h-3.5 text-emerald-700" />
                      {rec.top_farmer_recommendation?.title || 'Optimal Booking Window'}
                    </p>
                    <p className="text-emerald-900/80 leading-relaxed text-[11px]">
                      {rec.top_farmer_recommendation?.description || 'Reserve early to prevent seasonal machine bottlenecks.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-100">
                <Link
                  to={`/farmer/marketplace?category=${encodeURIComponent(rec.machinery_type)}&district=${encodeURIComponent(district)}`}
                  className="btn-primary w-full text-xs py-2.5 gap-1.5 shadow-none"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Browse Available {rec.machinery_type}s</span>
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

