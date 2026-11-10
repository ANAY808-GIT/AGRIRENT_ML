import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import VoiceSearchButton from '../../components/common/VoiceSearchButton';
import {
  Tractor,
  Search,
  MapPin,
  Trash2,
  Loader2,
  CheckCircle2,
  X,
  ShieldCheck
} from 'lucide-react';

export default function MachineryManagement() {
  const [machinery, setMachinery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  const fetchMachinery = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminMachinery();
      if (res.success) {
        setMachinery(res.machinery);
      }
    } catch (err) {
      console.error('Failed to load machinery for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachinery();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete machinery "${name}" from the system?`)) return;

    try {
      const res = await api.deleteMachinery(id);
      if (res.success) {
        setMessage(`Machinery "${name}" deleted.`);
        fetchMachinery();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete machinery.');
    }
  };

  const filtered = machinery.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.owner_name.toLowerCase().includes(search.toLowerCase()) ||
    m.location_district.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Machinery Fleet Moderation</h1>
          <p className="text-xs text-slate-500">Oversee equipment listings, verify compliance, and remove non-conforming machinery.</p>
        </div>

        {/* Search Bar with Voice Search */}
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
              title="Search machinery by voice"
            />
          </div>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-600">Retrieving platform fleet inventory...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Machinery</th>
                  <th className="px-6 py-4">Owner Name</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Daily Rate</th>
                  <th className="px-6 py-4">Availability</th>
                  <th className="px-6 py-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                          <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{m.name}</p>
                          <p className="text-[11px] text-slate-400">{m.category} • {m.model_year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{m.owner_name}</p>
                      <p className="text-slate-400 font-mono text-[11px]">{m.owner_mobile}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {m.location_district}, {m.location_state}
                    </td>
                    <td className="px-6 py-4 text-sm font-extrabold text-agri-dark">
                      ₹{Number(m.rental_price_per_day).toLocaleString('en-IN')}/day
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        m.availability_status === 'available'
                          ? 'bg-emerald-50 text-emerald-800'
                          : m.availability_status === 'in_use'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {m.availability_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(m.id, m.name)}
                        className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                        title="Remove Listing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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

