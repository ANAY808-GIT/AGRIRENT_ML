import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Tractor,
  PlusCircle,
  Edit2,
  Trash2,
  MapPin,
  CheckCircle2,
  Clock,
  Wrench,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';

export default function MyMachinery() {
  const { user } = useAuth();
  const [machinery, setMachinery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Edit Modal State
  const [editItem, setEditItem] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStatus, setEditStatus] = useState('available');
  const [editDesc, setEditDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const loadMachinery = async () => {
    try {
      const res = await api.getMachinery({ owner_id: user?.id });
      if (res.success) {
        setMachinery(res.machinery);
      }
    } catch (err) {
      setError(err.message || 'Failed to load your machinery.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMachinery();
  }, [user]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from your fleet?`)) return;

    try {
      const res = await api.deleteMachinery(id);
      if (res.success) {
        setMessage(`Machinery "${name}" removed successfully.`);
        loadMachinery();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete machinery.');
    }
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setEditPrice(item.rental_price_per_day);
    setEditStatus(item.availability_status);
    setEditDesc(item.description);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editItem) return;

    setSaving(true);
    try {
      const res = await api.updateMachinery(editItem.id, {
        ...editItem,
        rental_price_per_day: Number(editPrice),
        availability_status: editStatus,
        description: editDesc
      });
      if (res.success) {
        setMessage('Machinery updated successfully.');
        setEditItem(null);
        loadMachinery();
      }
    } catch (err) {
      alert(err.message || 'Failed to update machinery.');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatusChange = async (item, newStatus) => {
    try {
      const res = await api.updateMachinery(item.id, {
        ...item,
        availability_status: newStatus
      });
      if (res.success) {
        loadMachinery();
      }
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600">Retrieving fleet inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Machinery Fleet</h1>
          <p className="text-xs text-slate-500">Manage, edit rates, and control availability of your listed equipment.</p>
        </div>
        <Link to="/owner/add-machinery" className="btn-primary text-xs py-2.5 px-4 gap-2">
          <PlusCircle className="w-4 h-4" />
          <span>Add New Equipment</span>
        </Link>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {machinery.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
          <Tractor className="w-16 h-16 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Machinery Listed Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't listed any farm machinery yet. Start earning daily rental revenue by adding your tractors, harvesters, or implements.
          </p>
          <Link to="/owner/add-machinery" className="btn-primary text-xs py-2.5 px-6 inline-flex">
            Add Your First Machine
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {machinery.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Photo & Status */}
                <div className="relative h-48 w-full bg-slate-100">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-white/95 text-slate-800 shadow-sm border border-slate-200">
                      {item.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold shadow-sm ${
                      item.availability_status === 'available'
                        ? 'bg-emerald-600 text-white'
                        : item.availability_status === 'in_use'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-600 text-white'
                    }`}>
                      {item.availability_status === 'available' ? 'Available' : item.availability_status === 'in_use' ? 'In Use' : 'Maintenance'}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center text-xs text-slate-500 gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{item.location_village ? `${item.location_village}, ` : ''}{item.location_district}</span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 line-clamp-1">{item.name}</h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-2 flex items-baseline justify-between border-t border-slate-100">
                    <span className="text-xs text-slate-400">Daily Rate:</span>
                    <span className="text-base font-extrabold text-agri-dark">
                      ₹{Number(item.rental_price_per_day).toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">/ day</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Selector & Actions Bar */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <select
                  value={item.availability_status}
                  onChange={(e) => handleQuickStatusChange(item, e.target.value)}
                  className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none"
                >
                  <option value="available">🟢 Available</option>
                  <option value="in_use">🟡 In Field</option>
                  <option value="maintenance">🔴 Maintenance</option>
                </select>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(item)}
                    title="Edit Machinery"
                    className="p-2 rounded-lg bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    title="Delete Machinery"
                    className="p-2 rounded-lg bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Edit Machinery Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Edit Equipment Details</h3>
              <button onClick={() => setEditItem(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Equipment Name</label>
                <input
                  type="text"
                  disabled
                  value={editItem.name}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Daily Rental Price (₹ INR)</label>
                <input
                  type="number"
                  required
                  min={100}
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Availability Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value="available">Available for Rent</option>
                  <option value="in_use">In Field / In Use</option>
                  <option value="maintenance">Under Maintenance / Service</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="btn-outline text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs py-2 px-5"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

