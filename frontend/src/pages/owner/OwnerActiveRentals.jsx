import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Clock,
  CheckCircle2,
  Calendar,
  User,
  Phone,
  MapPin,
  Tractor,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function OwnerActiveRentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadActive = async () => {
    try {
      const res = await api.getOwnerBookings();
      if (res.success) {
        // Active and accepted
        const activeRentals = res.bookings.filter((b) => b.status === 'active' || b.status === 'accepted');
        setRentals(activeRentals);
      }
    } catch (err) {
      console.error('Failed to load active rentals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActive();
  }, []);

  const handleComplete = async (bookingId) => {
    if (!window.confirm('Mark this rental as completed? Machinery will be returned to available status and archived in Rental History.')) return;

    setActionLoading(true);
    try {
      const res = await api.completeBooking(bookingId);
      if (res.success) {
        setMessage('Rental marked as Completed and moved to Rental History.');
        loadActive();
      }
    } catch (err) {
      alert(err.message || 'Failed to complete rental.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600">Checking active field deployments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Active Field Deployments</h1>
        <p className="text-xs text-slate-500">Track equipment currently working in farmer fields or confirmed for immediate mobilization.</p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {rentals.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Clock className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Active Deployments</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            None of your machinery is currently rented in the field. Accept pending requests to activate new rentals.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rentals.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl p-6 border-2 border-emerald-500/20 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                      <img src={r.machinery_image} alt={r.machinery_name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{r.machinery_name}</h3>
                      <p className="text-xs text-slate-500">{r.machinery_category}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border ${
                    r.status === 'active'
                      ? 'bg-purple-100 text-purple-800 border-purple-300'
                      : 'bg-blue-100 text-blue-800 border-blue-300'
                  }`}>
                    {r.status === 'active' ? '● In Field' : '● Confirmed'}
                  </span>
                </div>

                {/* Details */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-600" /> Farmer:
                    </span>
                    <strong className="text-slate-900">{r.farmer_name}</strong>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" /> Contact:
                    </span>
                    <strong className="text-slate-900 font-mono">{r.farmer_mobile}</strong>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Period:
                    </span>
                    <strong className="text-slate-900">{r.start_date} to {r.end_date} ({r.total_days} Days)</strong>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 text-emerald-950 font-semibold">
                    <span>Rental Revenue:</span>
                    <strong className="text-base text-agri-dark font-extrabold">₹{Number(r.total_price).toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {r.status === 'active' ? 'Fieldwork in progress' : 'Awaiting payment/mobilization'}
                </span>
                <button
                  onClick={() => handleComplete(r.id)}
                  disabled={actionLoading}
                  className="btn-primary text-xs py-2 px-4 gap-1.5 shadow-none"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark as Completed</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

