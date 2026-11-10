import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Tractor,
  Clock,
  Calendar,
  Phone,
  User,
  MapPin,
  CheckCircle2,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function FarmerActiveRentals() {
  const [activeRentals, setActiveRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await api.getFarmerBookings();
        if (res.success) {
          const active = res.bookings.filter((b) => b.status === 'active' || b.status === 'accepted');
          setActiveRentals(active);
        }
      } catch (err) {
        console.error('Failed to load active rentals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActive();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600">Checking your active field operations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Active Machinery in Field</h1>
        <p className="text-xs text-slate-500">Live rentals currently operating on your land or confirmed for mobilization.</p>
      </div>

      {activeRentals.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Clock className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Active Rentals In Field</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You do not currently have any active machinery working on your fields. Browse the marketplace when you are ready to rent.
          </p>
          <Link to="/farmer/marketplace" className="btn-primary text-xs py-2.5 px-6 inline-flex">
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeRentals.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl p-6 border-2 border-emerald-500/30 shadow-sm space-y-4 flex flex-col justify-between"
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
                  <span className="px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-purple-100 text-purple-800 border border-purple-300">
                    ● Active in Field
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-600" /> Equipment Owner:
                    </span>
                    <strong className="text-slate-900">{r.owner_name}</strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" /> Owner Contact:
                    </span>
                    <strong className="text-slate-900 font-mono">{r.owner_mobile}</strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Scheduled Duration:
                    </span>
                    <strong className="text-slate-900">{r.start_date} to {r.end_date} ({r.total_days} Days)</strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-950 flex items-center justify-between font-semibold">
                    <span>Total Rental Amount:</span>
                    <strong className="text-base text-agri-dark font-extrabold">₹{Number(r.total_price).toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Insurance & Operator Verified
                </span>
                <Link
                  to="/farmer/payments"
                  className="btn-outline text-xs py-1.5 px-3 gap-1"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Invoice</span>
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

