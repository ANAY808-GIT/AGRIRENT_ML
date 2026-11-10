import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf6] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-emerald-700 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Verifying AgriRent security credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role) && role !== 'admin') {
    // If unauthorized for this specific role, redirect to their home dashboard
    if (role === 'owner') return <Navigate to="/owner/dashboard" replace />;
    if (role === 'farmer') return <Navigate to="/farmer/dashboard" replace />;
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

