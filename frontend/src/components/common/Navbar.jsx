import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Tractor, 
  Menu, 
  X, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Sparkles, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleDashboardRedirect = () => {
    if (role === 'owner') navigate('/owner/dashboard');
    else if (role === 'farmer') navigate('/farmer/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
    else navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-agri-dark to-agri-medium flex items-center justify-center text-white shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform">
              <Tractor className="w-7 h-7 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-extrabold text-agri-dark tracking-tight">AgriRent</span>
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-md border border-emerald-300">
                  ML
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-wide">SMART MACHINERY & DEMAND PLATFORM</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-semibold text-slate-700 hover:text-agri-primary transition-colors">
              Home
            </Link>
            <a href="#marketplace" className="text-sm font-semibold text-slate-700 hover:text-agri-primary transition-colors">
              Machinery
            </a>
            <a href="#how-it-works" className="text-sm font-semibold text-slate-700 hover:text-agri-primary transition-colors">
              How It Works
            </a>
            <a href="#ml-demand" className="text-sm font-semibold text-slate-700 hover:text-agri-primary flex items-center gap-1.5 transition-colors">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              ML Prediction
            </a>
            <a href="#about" className="text-sm font-semibold text-slate-700 hover:text-agri-primary transition-colors">
              About Us
            </a>
            <a href="#contact" className="text-sm font-semibold text-slate-700 hover:text-agri-primary transition-colors">
              Contact
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDashboardRedirect}
                  className="btn-primary gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>
                    {role === 'owner' ? 'Owner Dashboard' : role === 'admin' ? 'Admin Panel' : 'Farmer Dashboard'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                    {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                  </div>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-agri-dark hover:text-agri-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Register Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            Home
          </Link>
          <a
            href="#marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            Machinery
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            How It Works
          </a>
          <a
            href="#ml-demand"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            ML Prediction
          </a>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleDashboardRedirect(); }}
                  className="btn-primary w-full text-center"
                >
                  Go to Dashboard ({role})
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); logout(); }}
                  className="btn-outline w-full text-center text-red-600 border-red-200 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-outline w-full text-center"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full text-center"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

