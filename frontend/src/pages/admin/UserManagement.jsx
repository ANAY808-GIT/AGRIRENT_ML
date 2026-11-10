import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import VoiceSearchButton from '../../components/common/VoiceSearchButton';
import {
  Users,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  Trash2,
  Loader2,
  CheckCircle2,
  X
} from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminUsers({
        role: roleFilter,
        search: search
      });
      if (res.success) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (userId) => {
    try {
      const res = await api.toggleUserStatus(userId);
      if (res.success) {
        setMessage(res.message);
        fetchUsers();
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle status.');
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Permanently delete user "${name}"? This action cannot be reversed.`)) return;

    try {
      const res = await api.deleteUser(userId);
      if (res.success) {
        setMessage(`User "${name}" deleted successfully.`);
        fetchUsers();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Platform User Management</h1>
          <p className="text-xs text-slate-500">Monitor registered accounts, suspend access, or manage roles.</p>
        </div>

        <div className="flex items-center gap-2">
          {['', 'farmer', 'owner', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                roleFilter === r
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {r === '' ? 'All Users' : r === 'farmer' ? 'Farmers' : r === 'owner' ? 'Owners' : 'Admins'}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Search Bar with Voice Search */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
        <div className="relative flex-1 flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or district..."
            className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
          <div className="absolute right-1 flex items-center">
            <VoiceSearchButton
              onTranscript={(text) => setSearch(text)}
              title="Search users by voice"
            />
          </div>
        </div>
        <button type="submit" className="btn-primary text-xs py-2 px-4">
          Search
        </button>
      </form>

      {/* Users Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-600">Retrieving user roster...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 text-sm">{u.full_name}</p>
                      <p className="text-slate-400 font-mono text-[11px]">{u.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : u.role === 'owner'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-lime-100 text-lime-900 border border-lime-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono">
                      {u.mobile}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {u.village ? `${u.village}, ` : ''}{u.district}, {u.state}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        u.is_active ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-600' : 'bg-red-600'}`} />
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'admin' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(u.id)}
                            title={u.is_active ? 'Suspend Account' : 'Reactivate Account'}
                            className={`p-1.5 rounded-lg border text-xs font-semibold ${
                              u.is_active ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                            }`}
                          >
                            {u.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.full_name)}
                            title="Delete User"
                            className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
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

