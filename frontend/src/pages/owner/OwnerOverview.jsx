import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Tractor,
  CheckCircle2,
  Clock,
  Inbox,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  Sparkles,
  ChevronRight,
  User,
  Calendar,
  XCircle,
  ArrowUpRight,
  Loader2
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

export default function OwnerOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_machinery: 0,
    available_machinery: 0,
    booked_machinery: 0,
    pending_requests: 0,
    active_rentals: 0,
    monthly_earnings: 0
  });
  const [bookingRequests, setBookingRequests] = useState([]);
  const [earningsData, setEarningsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const loadDashboard = async () => {
    try {
      const [mRes, bRes, eRes] = await Promise.all([
        api.getMachinery({ owner_id: user?.id }),
        api.getOwnerBookings(),
        api.getOwnerEarnings()
      ]);

      if (mRes.success) {
        const total = mRes.machinery.length;
        const avail = mRes.machinery.filter((m) => m.availability_status === 'available').length;
        const inUse = mRes.machinery.filter((m) => m.availability_status === 'in_use').length;

        const allBookings = bRes.success ? bRes.bookings : [];
        const pending = allBookings.filter((b) => b.status === 'pending');
        const active = allBookings.filter((b) => b.status === 'active');

        setStats({
          total_machinery: total,
          available_machinery: avail,
          booked_machinery: inUse,
          pending_requests: pending.length,
          active_rentals: active.length,
          monthly_earnings: eRes.success ? eRes.total_earnings : 0
        });

        setBookingRequests(pending.slice(0, 5));
      }

      if (eRes.success && eRes.monthly_breakdown) {
        setEarningsData(
          eRes.monthly_breakdown.map((item) => ({
            month: item.month_key,
            earnings: Number(item.monthly_amount)
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load owner overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user]);

  const handleBookingAction = async (bookingId, status) => {
    setActionLoading(true);
    setActionMessage('');
    try {
      const res = await api.updateBookingStatus(bookingId, status);
      if (res.success) {
        setActionMessage(`Booking #${bookingId} successfully ${status}!`);
        await loadDashboard();
      }
    } catch (err) {
      alert(err.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600">Gathering fleet and earnings metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-agri-dark via-emerald-800 to-green-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Tractor className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-600/40">
            Machinery Fleet Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Namaste, {user?.full_name || 'Owner'}!
          </h1>
          <p className="text-sm text-emerald-100/90 leading-relaxed">
            You have <strong className="text-white">{stats.pending_requests} pending booking requests</strong> and{' '}
            <strong className="text-white">{stats.active_rentals} active machinery rentals</strong> currently in field.
          </p>
          <div className="pt-3 flex flex-wrap gap-3">
            <Link to="/owner/add-machinery" className="btn-primary text-xs py-2 px-3.5 gap-2 bg-emerald-600 hover:bg-emerald-500">
              <PlusCircle className="w-4 h-4" /> Add New Machinery
            </Link>
            <Link to="/owner/ml-demand" className="btn-secondary text-xs py-2 px-3.5 gap-2 bg-white/10 text-white hover:bg-white/20 border-white/20">
              <Sparkles className="w-4 h-4 text-emerald-300" /> Run Demand Forecast
            </Link>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* 6 Core Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="card-agri p-4 border-l-4 border-l-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">Total Fleet</span>
            <Tractor className="w-4 h-4 text-slate-700" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.total_machinery}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Registered machines</p>
        </div>

        <div className="card-agri p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">Available</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{stats.available_machinery}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Ready for booking</p>
        </div>

        <div className="card-agri p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">Booked / In Field</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700">{stats.booked_machinery}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Occupied machinery</p>
        </div>

        <div className="card-agri p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">Pending</span>
            <Inbox className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-700">{stats.pending_requests}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Awaiting decision</p>
        </div>

        <div className="card-agri p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">Active Rentals</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-700">{stats.active_rentals}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Ongoing operations</p>
        </div>

        <div className="card-agri p-4 border-l-4 border-l-green-600">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-green-700" />
          </div>
          <p className="text-2xl font-black text-green-800">
            ₹{stats.monthly_earnings.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Paid rental revenue</p>
        </div>

      </div>

      {/* Main Grid: Pending Bookings & Revenue Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Pending Requests Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Pending Booking Requests</h3>
              <p className="text-xs text-slate-500">Farmers awaiting your rental confirmation</p>
            </div>
            <Link to="/owner/booking-requests" className="text-xs font-bold text-agri-primary hover:text-agri-dark flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {bookingRequests.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-xs font-medium">All caught up! No pending booking requests right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookingRequests.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{b.machinery_name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {b.total_days} Days
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <strong>{b.farmer_name}</strong> ({b.farmer_village || b.farmer_district})
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {b.start_date} to {b.end_date}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                    <p className="text-base font-extrabold text-agri-dark">
                      ₹{Number(b.total_price).toLocaleString('en-IN')}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleBookingAction(b.id, 'accepted')}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button
                        onClick={() => handleBookingAction(b.id, 'rejected')}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue Analytics Visual (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Revenue Performance</h3>
                <p className="text-xs text-slate-500">Monthly rental income distribution</p>
              </div>
              <Link to="/owner/earnings" className="text-xs font-bold text-agri-primary hover:text-agri-dark flex items-center gap-1">
                <span>Details</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="h-60 w-full pt-4">
              {earningsData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No payment records yet to plot.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={earningsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Bar dataKey="earnings" fill="#15803d" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-emerald-950">Maximize Fleet Revenue</p>
              <p className="text-[11px] text-emerald-800">
                Use our Scikit-Learn demand model to optimize machinery pricing ahead of harvest.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

