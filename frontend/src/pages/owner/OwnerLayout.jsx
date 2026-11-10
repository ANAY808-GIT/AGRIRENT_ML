import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Tractor,
  LayoutDashboard,
  PlusCircle,
  Wrench,
  Inbox,
  Clock,
  History,
  TrendingUp,
  Sparkles,
  Star,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight
} from 'lucide-react';

const ownerNavItems = [
  { name: 'Dashboard', path: '/owner/dashboard', icon: LayoutDashboard },
  { name: 'Add Machinery', path: '/owner/add-machinery', icon: PlusCircle },
  { name: 'My Machinery', path: '/owner/my-machinery', icon: Wrench },
  { name: 'Booking Requests', path: '/owner/booking-requests', icon: Inbox },
  { name: 'Active Rentals', path: '/owner/active-rentals', icon: Clock },
  { name: 'Rental History', path: '/owner/rental-history', icon: History },
  { name: 'Earnings', path: '/owner/earnings', icon: TrendingUp },
  { name: 'ML Demand Prediction', path: '/owner/ml-demand', icon: Sparkles, highlight: true },
  { name: 'Customer Reviews', path: '/owner/customer-reviews', icon: Star },
  { name: 'My Profile', path: '/owner/profile', icon: User },
];

export default function OwnerLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] flex flex-col md:flex-row">
      
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between bg-agri-dark text-white px-4 py-3 sticky top-0 z-40 shadow">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
            <Tractor className="w-5 h-5 text-emerald-200" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight">AgriRent ML</span>
            <span className="ml-1.5 text-[10px] font-semibold bg-emerald-800 text-emerald-200 px-1.5 py-0.5 rounded">Owner</span>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-emerald-100 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 bg-gradient-to-b from-agri-dark via-[#103d1f] to-[#0b2b16] text-white flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-emerald-900/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center shadow-inner">
              <Tractor className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-white">AgriRent</span>
                <span className="text-xs font-extrabold px-1.5 py-0.5 rounded bg-emerald-400 text-emerald-950">ML</span>
              </div>
              <p className="text-[11px] font-medium text-emerald-300/80">MACHINERY OWNER SUITE</p>
            </div>
          </div>

          {/* User quick badge */}
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shadow">
              {user?.full_name ? user.full_name[0].toUpperCase() : 'O'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.full_name || 'Machinery Owner'}</p>
              <p className="text-[11px] text-emerald-300 truncate">{user?.district || 'Karnataka, India'}</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {ownerNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/30 font-semibold'
                      : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                <span className="flex-1">{item.name}</span>
                {item.highlight && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-400 text-emerald-950 uppercase tracking-wide">
                    AI
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* Logout Action */}
          <div className="pt-4 mt-2 border-t border-emerald-900/60">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:bg-red-950/40 hover:text-red-200 transition-colors"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-emerald-950/80 text-[11px] text-emerald-400/60 text-center">
          AgriRent ML v1.0 • Owner Portal
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar for desktop */}
        <header className="hidden md:flex items-center justify-between bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-20 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Owner Operations Console</h2>
            <p className="text-xs text-slate-500">Manage fleet listings, booking approvals, and demand optimization</p>
          </div>

          <div className="flex items-center gap-4">
            <NavLink
              to="/owner/ml-demand"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>ML Demand Forecast</span>
            </NavLink>

            <div className="h-6 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-slate-600">Owner System Online</span>
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </div>
      </main>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-20 md:hidden"
        />
      )}
    </div>
  );
}

