import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Sprout,
  Tractor,
  CalendarCheck,
  Clock,
  CheckCircle2,
  CreditCard,
  Sparkles,
  ShoppingBag,
  Search,
  ArrowRight,
  MapPin,
  Star,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function FarmerOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_bookings: 0,
    pending_bookings: 0,
    active_rentals: 0,
    completed_rentals: 0,
    total_expenditure: 0,
    recommended_machinery: 'Harvester'
  });
  const [activeRental, setActiveRental] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [bRes, pRes, rRes] = await Promise.all([
          api.getFarmerBookings(),
          api.getPaymentHistory(),
          api.getSeasonalRecommendations({
            district: user?.district || 'Mysuru',
            state: user?.state || 'Karnataka',
            month: 10
          })
        ]);

        if (bRes.success) {
          const bookings = bRes.bookings;
          const pending = bookings.filter((b) => b.status === 'pending');
          const active = bookings.filter((b) => b.status === 'active');
          const completed = bookings.filter((b) => b.status === 'completed');

          const expenditure = pRes.success
            ? pRes.payments.reduce((acc, p) => acc + Number(p.amount), 0)
            : 0;

          setStats({
            total_bookings: bookings.length,
            pending_bookings: pending.length,
            active_rentals: active.length,
            completed_rentals: completed.length,
            total_expenditure: expenditure,
            recommended_machinery: rRes.success && rRes.recommendations.length > 0
              ? rRes.recommendations[0].machinery_type
              : 'Harvester'
          });

          if (active.length > 0) {
            setActiveRental(active[0]);
          }
        }

        if (rRes.success) {
          setRecommendations(rRes.recommendations.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load farmer overview:', err);
      } finally {
        setLoading(false);
      }
    };
    loadOverview();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading farmer dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0c3a1e] via-emerald-900 to-[#082b14] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Sprout className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-lime-300 bg-emerald-950/70 px-3 py-1 rounded-full border border-lime-400/30">
            Smart Field Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {user?.full_name || 'Farmer'}!
          </h1>
          <p className="text-sm text-emerald-100/90 leading-relaxed">
            Need equipment for upcoming land preparation or harvest? Browse verified machinery in{' '}
            <strong className="text-lime-300">{user?.district || 'Karnataka'}</strong> with guaranteed zero double-bookings.
          </p>
          <div className="pt-3 flex flex-wrap gap-3">
            <Link to="/farmer/marketplace" className="btn-primary text-xs py-2 px-3.5 gap-2 bg-lime-400 text-slate-950 hover:bg-lime-300 font-bold">
              <ShoppingBag className="w-4 h-4 text-emerald-950" /> Browse Machinery Marketplace
            </Link>
            <Link to="/farmer/ml-recommendations" className="btn-secondary text-xs py-2 px-3.5 gap-2 bg-white/10 text-white hover:bg-white/20 border-white/20">
              <Sparkles className="w-4 h-4 text-lime-300" /> Seasonal AI Recommendations
            </Link>
          </div>
        </div>
      </div>

      {/* 6 Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="card-agri p-4 border-l-4 border-l-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">Total Bookings</span>
            <CalendarCheck className="w-4 h-4 text-slate-700" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.total_bookings}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Reservations made</p>
        </div>

        <div className="card-agri p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">Pending</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700">{stats.pending_bookings}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Awaiting owner confirmation</p>
        </div>

        <div className="card-agri p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">Active Rentals</span>
            <Tractor className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-700">{stats.active_rentals}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Currently working in field</p>
        </div>

        <div className="card-agri p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{stats.completed_rentals}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Finished operations</p>
        </div>

        <div className="card-agri p-4 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">Total Spent</span>
            <CreditCard className="w-4 h-4 text-blue-700" />
          </div>
          <p className="text-2xl font-black text-blue-800">
            ₹{stats.total_expenditure.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Settled rental invoices</p>
        </div>

        <div className="card-agri p-4 border-l-4 border-l-lime-500 bg-lime-50/40">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase text-emerald-900">AI Top Pick</span>
            <Sparkles className="w-4 h-4 text-lime-600" />
          </div>
          <p className="text-xl font-black text-emerald-950 truncate">{stats.recommended_machinery}</p>
          <p className="text-[11px] text-emerald-700 mt-0.5">Peak seasonal demand</p>
        </div>

      </div>

      {/* Grid: Active Rental Live Alert & Seasonal ML Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Active Rental Card or Quick Search Shortcut (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">Active Field Rental Status</h3>
              <p className="text-xs text-slate-500">Live operational status of equipment working on your land</p>
            </div>
            {activeRental && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                In Progress
              </span>
            )}
          </div>

          {activeRental ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                  <img src={activeRental.machinery_image} alt={activeRental.machinery_name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">{activeRental.machinery_name}</h4>
                  <p className="text-xs text-slate-500">{activeRental.machinery_category} • Owned by {activeRental.owner_name}</p>
                  <p className="text-xs text-slate-700 font-medium mt-1">
                    Rental Dates: {activeRental.start_date} to {activeRental.end_date} ({activeRental.total_days} Days)
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                <div>
                  <p className="font-bold">Owner Contact Details</p>
                  <p className="text-slate-600 font-mono mt-0.5">{activeRental.owner_mobile} • {activeRental.owner_email}</p>
                </div>
                <Link to="/farmer/active-rentals" className="btn-primary text-xs py-1.5 px-3">
                  Details
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <Tractor className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">No active rental in progress.</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Need plowing, harrowing, or harvesting? Explore hundreds of machines nearby.
              </p>
              <Link to="/farmer/marketplace" className="btn-primary text-xs py-2 px-5 inline-flex gap-1.5">
                <Search className="w-3.5 h-3.5" />
                <span>Search Marketplace</span>
              </Link>
            </div>
          )}
        </div>

        {/* Seasonal ML Recommendations (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Seasonal ML Recommendations</span>
              </h3>
              <p className="text-xs text-slate-500">High-demand machinery in {user?.district || 'Mysuru'} for current window</p>
            </div>
            <Link to="/farmer/ml-recommendations" className="text-xs font-bold text-agri-primary hover:text-agri-dark flex items-center gap-1">
              <span>All Insights</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 transition-colors flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{rec.machinery_type}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rec.demand_level === 'High' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {rec.demand_level} Demand
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                    {rec.top_farmer_recommendation?.description || 'Optimal booking window open now.'}
                  </p>
                </div>

                <Link
                  to={`/farmer/marketplace?category=${encodeURIComponent(rec.machinery_type)}`}
                  className="btn-outline text-xs py-1.5 px-3 shrink-0"
                >
                  Find {rec.machinery_type}
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

