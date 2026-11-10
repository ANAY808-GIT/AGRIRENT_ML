import React from 'react';
import { Link } from 'react-router-dom';
import { Tractor, Sparkles, Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Synthetic Demonstration Disclaimer Banner */}
        <div className="mb-12 p-4 rounded-2xl bg-slate-800/80 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Academic & Demonstration Showcase</p>
              <p className="text-sm text-slate-300">
                Machine Learning models are trained on 1,200 synthetic demonstration records. Designed for collegiate showcase & platform validation.
              </p>
            </div>
          </div>
          <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 whitespace-nowrap">
            Scikit-Learn Regression & K-Means
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white">
                <Tractor className="w-6 h-6 text-emerald-100" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">AgriRent <span className="text-emerald-400">ML</span></span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering Indian farmers and machinery owners through an intelligent, decentralized farm equipment rental marketplace and predictive demand intelligence.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" /> Verified Equipment & Secure Payments
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
              <li><a href="#marketplace" className="hover:text-emerald-400 transition-colors">Find Machinery</a></li>
              <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</a></li>
              <li><a href="#ml-demand" className="hover:text-emerald-400 transition-colors">ML Demand Forecast</a></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">User Login</Link></li>
              <li><Link to="/register" className="hover:text-emerald-400 transition-colors">Create Account</Link></li>
            </ul>
          </div>

          {/* Col 3: Machinery Categories */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Popular Categories</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="text-slate-400">4WD Agricultural Tractors</span></li>
              <li><span className="text-slate-400">Combine Harvesters</span></li>
              <li><span className="text-slate-400">Multi-Speed Rotavators</span></li>
              <li><span className="text-slate-400">Precision Seed Drills</span></li>
              <li><span className="text-slate-400">Hydraulic Reversible Ploughs</span></li>
              <li><span className="text-slate-400">Tractor Mounted Boom Sprayers</span></li>
            </ul>
          </div>

          {/* Col 4: Contact & Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Support & Office</h4>
            <div className="space-y-3 text-sm text-slate-400">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Agricultural Innovation Hub, Mysuru & Pune Regional Centers, India</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+91 1800-AGRI-RENT (Toll Free)</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support@agrirentml.org</span>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} AgriRent ML Platform. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Designed for Modern Agriculture with <Heart className="w-3.5 h-3.5 text-red-500 fill-current" /> by the AgriRent Engineering Team
          </p>
        </div>

      </div>
    </footer>
  );
}

