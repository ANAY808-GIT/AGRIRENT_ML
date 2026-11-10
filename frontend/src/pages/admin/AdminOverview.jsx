import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Users,
  Tractor,
  BookOpen,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart3,
  Loader2,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [sRes, aRes, bRes] = await Promise.all([
          api.getAdminStats(),
          api.getAdminAnalytics(),
          api.getAdminBookings()
        ]);
        if (sRes.success) setStats(sRes.stats);
        if (aRes.success) setAnalytics(aRes);
        if (bRes.success) setRecentBookings(bRes.bookings.slice(0, 5));
      } catch (err) {
        console.error('Failed to load admin overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading central platform statistics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-700">
            Platform Master Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            System Administration & Analytics
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Real-time control over user accounts, machinery moderation, booking workflows, and machine learning models.
          </p>
          <div className="pt-3 flex flex-wrap gap-3">
            <Link to="/admin/users" className="btn-primary text-xs py-2 px-3.5 bg-emerald-600 hover:bg-emerald-500">
              Manage Users ({stats?.total_users})
            </Link>
            <Link to="/admin/ml-reports" className="btn-secondary text-xs py-2 px-3.5 bg-slate-800 text-white hover:bg-slate-700 border-slate-700">
              <Sparkles className="w-4 h-4 text-emerald-400" /> ML Model Performance
            </Link>
          </div>
        </div>
      </div>

      {/* 6 Admin Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm border-l-4 border-l-slate-800">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats?.total_users || 0}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Platform members</p>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm border-l-4 border-l-lime-600">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Farmers</p>
          <p className="text-2xl font-black text-lime-700 mt-1">{stats?.total_farmers || 0}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Field renters</p>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm border-l-4 border-l-emerald-600">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fleet Owners</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{stats?.total_owners || 0}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Machinery providers</p>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm border-l-4 border-l-blue-600">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Machinery</p>
          <p className="text-2xl font-black text-blue-700 mt-1">{stats?.total_machinery || 0}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{stats?.available_machinery || 0} currently available</p>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm border-l-4 border-l-purple-600">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Bookings</p>
          <p className="text-2xl font-black text-purple-700 mt-1">{stats?.total_bookings || 0}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{stats?.active_bookings || 0} active in field</p>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm border-l-4 border-l-green-600">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Volume</p>
          <p className="text-2xl font-black text-green-800 mt-1">₹{stats?.total_revenue?.toLocaleString('en-IN') || 0}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Processed rentals</p>
        </div>

      </div>

      {/* Grid: Category Analytics Visual & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Category Analytics (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">Machinery Category Activity</h3>
              <p className="text-xs text-slate-500">Fleet inventory distribution by category</p>
            </div>
            <Link to="/admin/analytics" className="text-xs font-bold text-agri-primary hover:text-agri-dark flex items-center gap-1">
              <span>Full Analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.category_analytics || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  formatter={(val, name) => [val, name === 'machinery_count' ? 'Machinery Count' : 'Bookings']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="machinery_count" fill="#15803d" radius={[8, 8, 0, 0]} name="Fleet Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Bookings (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">Recent Platform Bookings</h3>
              <p className="text-xs text-slate-500">Live rental transactions across farmers and owners</p>
            </div>
            <Link to="/admin/bookings" className="text-xs font-bold text-agri-primary hover:text-agri-dark flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentBookings.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900">{b.machinery_name}</p>
                  <p className="text-slate-500">
                    Farmer: <strong>{b.farmer_name}</strong> • Owner: <strong>{b.owner_name}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{b.start_date} to {b.end_date}</p>
                </div>

                <div className="text-right">
                  <p className="font-extrabold text-agri-dark">₹{Number(b.total_price).toLocaleString('en-IN')}</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1 ${
                    b.status === 'active' ? 'bg-purple-100 text-purple-800' : b.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

