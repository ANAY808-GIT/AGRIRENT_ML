import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import VoiceSearchButton from '../../components/common/VoiceSearchButton';
import {
  History,
  CheckCircle2,
  Calendar,
  User,
  MapPin,
  Tractor,
  Loader2,
  Search,
  FileText
} from 'lucide-react';

export default function OwnerRentalHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.getOwnerBookings();
        if (res.success) {
          const completed = res.bookings.filter((b) => b.status === 'completed');
          setHistory(completed);
        }
      } catch (err) {
        console.error('Failed to load rental history:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  const filtered = history.filter((h) =>
    h.machinery_name.toLowerCase().includes(search.toLowerCase()) ||
    h.farmer_name.toLowerCase().includes(search.toLowerCase())
  );

  const totalHistoricalRevenue = filtered.reduce((acc, h) => acc + Number(h.total_price), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading rental archives...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Rental History Archives</h1>
          <p className="text-xs text-slate-500">Record of all completed machinery rentals, billing settlements, and field operations.</p>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-right">
          <p className="text-[10px] uppercase font-bold text-emerald-800">Completed Volume</p>
          <p className="text-xl font-black text-agri-dark">
            ₹{totalHistoricalRevenue.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Search Input with Voice Search */}
      <div className="relative max-w-md flex items-center">
        <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by machinery or farmer name..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        />
        <div className="absolute right-1.5 flex items-center">
          <VoiceSearchButton
            onTranscript={(text) => setSearch(text)}
            title="Filter rental history by voice"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <History className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Concluded Rentals Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once active field rentals reach their return date and are marked complete, they are preserved in this historical ledger.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Machinery</th>
                  <th className="px-6 py-4">Farmer Details</th>
                  <th className="px-6 py-4">Rental Duration</th>
                  <th className="px-6 py-4">Total Settled</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                          <img src={h.machinery_image} alt={h.machinery_name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{h.machinery_name}</p>
                          <p className="text-[11px] text-slate-500">{h.machinery_category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{h.farmer_name}</p>
                      <p className="text-slate-500">{h.farmer_village ? `${h.farmer_village}, ` : ''}{h.farmer_district}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{h.start_date} to {h.end_date}</p>
                      <p className="text-slate-500">{h.total_days} days @ ₹{Number(h.daily_price).toLocaleString('en-IN')}/day</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-extrabold text-agri-dark">
                        ₹{Number(h.total_price).toLocaleString('en-IN')}
                      </p>
                      <span className="text-[10px] text-emerald-700 font-semibold">Payment Settled</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
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

