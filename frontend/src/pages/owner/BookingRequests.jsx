import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';

export default function BookingRequests() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('pending'); // 'pending' or 'all'

  // Reject Modal State
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadBookings = async () => {
    try {
      const res = await api.getOwnerBookings();
      if (res.success) {
        setBookings(res.bookings);
      }
    } catch (err) {
      console.error('Failed to load owner bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleAccept = async (bookingId) => {
    setActionLoading(true);
    setMessage('');
    try {
      const res = await api.updateBookingStatus(bookingId, 'accepted');
      if (res.success) {
        setMessage(`Booking #${bookingId} accepted successfully! The farmer has been notified.`);
        loadBookings();
      }
    } catch (err) {
      alert(err.message || 'Failed to accept booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectId) return;

    setActionLoading(true);
    try {
      const res = await api.updateBookingStatus(rejectId, 'rejected', rejectReason);
      if (res.success) {
        setMessage(`Booking #${rejectId} rejected.`);
        setRejectId(null);
        setRejectReason('');
        loadBookings();
      }
    } catch (err) {
      alert(err.message || 'Failed to reject booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const displayedBookings = bookings.filter((b) => {
    if (filter === 'pending') return b.status === 'pending';
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading booking requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Farmer Booking Requests</h1>
          <p className="text-xs text-slate-500">Review, approve, or decline incoming machinery rental reservations.</p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'pending' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending Only
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'all' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Requests ({bookings.length})
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {displayedBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            {filter === 'pending' ? 'No Pending Booking Requests' : 'No Booking Requests Found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {filter === 'pending'
              ? 'You have addressed all pending farmer requests! New requests will appear here in real-time.'
              : 'Requests will show here once farmers submit booking inquiries.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                    <img src={b.machinery_image} alt={b.machinery_name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">{b.machinery_name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {b.machinery_category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Booking Reference #AGRI-{String(b.id).padStart(4, '0')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${
                    b.status === 'pending'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : b.status === 'accepted'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : b.status === 'active'
                      ? 'bg-purple-100 text-purple-800 border border-purple-300'
                      : b.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    {b.status}
                  </span>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Total Amount</p>
                    <p className="text-lg font-extrabold text-agri-dark">
                      ₹{Number(b.total_price).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Farmer and Rental Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                
                {/* Farmer Info */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Farmer Contact</p>
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" /> {b.farmer_name}
                  </p>
                  <p className="text-slate-600 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {b.farmer_mobile}
                  </p>
                  <p className="text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {b.farmer_village ? `${b.farmer_village}, ` : ''}{b.farmer_district}
                  </p>
                </div>

                {/* Dates & Duration */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Rental Period</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" /> {b.start_date} to {b.end_date}
                  </p>
                  <p className="text-slate-600 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Duration: <strong>{b.total_days} Days</strong>
                  </p>
                  <p className="text-slate-600">
                    Daily Rate: ₹{Number(b.daily_price).toLocaleString('en-IN')}/day
                  </p>
                </div>

                {/* Farmer Notes */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Farmer Request Notes</p>
                  <p className="text-slate-700 italic leading-relaxed">
                    "{b.farmer_notes || 'No specific notes provided.'}"
                  </p>
                </div>

              </div>

              {/* Action Buttons for Pending */}
              {b.status === 'pending' && (
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    onClick={() => { setRejectId(b.id); setRejectReason(''); }}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Decline Request</span>
                  </button>
                  <button
                    onClick={() => handleAccept(b.id)}
                    disabled={actionLoading}
                    className="btn-primary text-xs py-2 px-5 gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Accept Booking</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Decline Booking #{rejectId}</h3>
            <p className="text-xs text-slate-500">Provide an optional reason so the farmer understands why this reservation could not be fulfilled.</p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Machine undergoing scheduled overhaul, conflicting field commitment..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectId(null)}
                  className="btn-outline text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                >
                  Confirm Decline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
