import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import VoiceSearchButton from '../../components/common/VoiceSearchButton';
import {
  History,
  CheckCircle2,
  Calendar,
  User,
  Star,
  FileText,
  Loader2,
  Search
} from 'lucide-react';

export default function FarmerRentalHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.getFarmerBookings();
        if (res.success) {
          const completed = res.bookings.filter((b) => b.status === 'completed');
          setHistory(completed);
        }
      } catch (err) {
        console.error('Failed to load farmer history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filtered = history.filter((h) =>
    h.machinery_name.toLowerCase().includes(search.toLowerCase()) ||
    h.owner_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600">Retrieving past rental history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Rental History & Field Archives</h1>
          <p className="text-xs text-slate-500">Historical records of equipment rented, operating durations, and payment invoices.</p>
        </div>

        <div className="relative max-w-xs w-full flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search equipment or owner..."
            className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
          <div className="absolute right-1 flex items-center">
            <VoiceSearchButton
              onTranscript={(text) => setSearch(text)}
              title="Search past rentals by voice"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <History className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Past Rentals Recorded</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once active equipment rentals reach their completion date, their archival details appear here for tax & farm budgeting purposes.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Machinery</th>
                  <th className="px-6 py-4">Owner</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Amount Paid</th>
                  <th className="px-6 py-4">Review</th>
                  <th className="px-6 py-4">Action</th>
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
                      <p className="font-bold text-slate-900">{h.owner_name}</p>
                      <p className="text-slate-400 font-mono">{h.owner_mobile}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{h.start_date} to {h.end_date}</p>
                      <p className="text-slate-500">{h.total_days} days</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-extrabold text-agri-dark">
                      ₹{Number(h.total_price).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      {h.review_rating ? (
                        <div className="flex items-center text-amber-500">
                          {[...Array(h.review_rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No review left</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to="/farmer/payments"
                        className="btn-outline text-xs py-1.5 px-3 inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Invoice</span>
                      </Link>
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

