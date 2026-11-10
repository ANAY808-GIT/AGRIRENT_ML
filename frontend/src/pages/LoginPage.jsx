import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Tractor,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles,
  UserCheck
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'owner') {
        navigate('/owner/dashboard');
      } else if (user.role === 'farmer') {
        navigate('/farmer/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf8] via-[#eef6ee] to-[#e4eee4] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      {/* Top Brand Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-agri-dark to-agri-medium flex items-center justify-center text-white shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform">
            <Tractor className="w-7 h-7 text-emerald-100" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-extrabold text-agri-dark tracking-tight">AgriRent</span>
              <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-md border border-emerald-300">
                ML
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">SMART MACHINERY & DEMAND PLATFORM</p>
          </div>
        </Link>
        <h2 className="mt-6 text-2xl font-extrabold text-slate-900 tracking-tight">
          Sign In to Your Account
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Access your Machinery Owner or Farmer operations console
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-slate-100 space-y-6">
          
          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 gap-2 text-sm shadow-md mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Buttons (College Showcase Feature) */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
              1-Click Demo Login (College Evaluation)
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('owner@agrirent.com', 'owner123')}
                className="w-full text-left p-2.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/80 transition-colors flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Tractor className="w-3.5 h-3.5 text-emerald-700" /> Ramesh Patel (Machinery Owner)
                  </p>
                  <p className="text-[10px] text-emerald-800/80">owner@agrirent.com • owner123</p>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                  Fill →
                </span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('farmer@agrirent.com', 'farmer123')}
                className="w-full text-left p-2.5 rounded-xl bg-lime-50/70 hover:bg-lime-100/70 border border-lime-200/80 transition-colors flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-bold text-lime-950 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-lime-700" /> Suresh Gowda (Farmer Member)
                  </p>
                  <p className="text-[10px] text-lime-800/80">farmer@agrirent.com • farmer123</p>
                </div>
                <span className="text-[10px] font-semibold text-lime-700 group-hover:translate-x-0.5 transition-transform">
                  Fill →
                </span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('admin@agrirent.com', 'admin123')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-700" /> Platform Super Administrator
                  </p>
                  <p className="text-[10px] text-slate-600">admin@agrirent.com • admin123</p>
                </div>
                <span className="text-[10px] font-semibold text-slate-700 group-hover:translate-x-0.5 transition-transform">
                  Fill →
                </span>
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-agri-primary hover:text-agri-dark underline">
                Register as Owner or Farmer
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Reset Credentials</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              In this demonstration environment, default credentials are initialized automatically:
            </p>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 font-mono text-slate-700">
              <p>Owner: owner@agrirent.com / owner123</p>
              <p>Farmer: farmer@agrirent.com / farmer123</p>
              <p>Admin: admin@agrirent.com / admin123</p>
            </div>
            <p className="text-xs text-slate-500">
              You can also create a brand new account anytime from the registration page.
            </p>
            <button
              onClick={() => setShowForgotModal(false)}
              className="btn-primary w-full text-xs py-2.5"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

