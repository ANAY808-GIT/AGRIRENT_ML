import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import VoiceSearchButton from '../../components/common/VoiceSearchButton';
import {
  BookOpen,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  Loader2
} from 'lucide-react';

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await api.getAdminBookings();
        if (res.success) {
          setBookings(res.bookings);
        }
      } catch (err) {
        console.error('Failed to load admin bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filtered = bookings.filter((b) => {
    const matchStatus = !statusFilter || b.status === statusFilter;
    const matchSearch = !search ||
      b.machinery_name.toLowerCase().includes(search.toLowerCase()) ||
      b.farmer_name.toLowerCase().includes(search.toLowerCase()) ||
      b.owner_name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Central Booking Registry</h1>
          <p className="text-xs text-slate-500">Track end-to-end machinery reservation lifecycles across the platform.</p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['', 'pending', 'accepted', 'active', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {st === '' ? 'All Statuses' : st.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar with Voice Search */}
      <div className="relative max-w-md flex items-center">
        <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by equipment, farmer, or owner..."
          className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        />
        <div className="absolute right-1 flex items-center">
          <VoiceSearchButton
            onTranscript={(text) => setSearch(text)}
            title="Search bookings by voice"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-600">Retrieving platform booking transactions...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Booking ID</th>
                  <th className="px-6 py-4">Equipment</th>
                  <th className="px-6 py-4">Farmer</th>
                  <th className="px-6 py-4">Owner</th>
                  <th className="px-6 py-4">Rental Duration</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      #AGRI-{String(b.id).padStart(4, '0')}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{b.machinery_name}</p>
                      <p className="text-[11px] text-slate-400">{b.machinery_category}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{b.farmer_name}</p>
                      <p className="text-slate-400 font-mono text-[11px]">{b.farmer_mobile}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{b.owner_name}</p>
                      <p className="text-slate-400 font-mono text-[11px]">{b.owner_mobile}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{b.start_date} to {b.end_date}</p>
                      <p className="text-slate-500">{b.total_days} Days</p>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-agri-dark text-sm">
                      ₹{Number(b.total_price).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        b.status === 'active'
                          ? 'bg-purple-100 text-purple-800'
                          : b.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'accepted'
                          ? 'bg-blue-100 text-blue-800'
                          : b.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
