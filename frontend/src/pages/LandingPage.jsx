import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import VoiceSearchButton from '../components/common/VoiceSearchButton';
import { api } from '../services/api';
import {
  Tractor,
  Sparkles,
  Search,
  CheckCircle2,
  Calendar,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Star,
  ArrowRight,
  Filter,
  BarChart2,
  Layers,
  ChevronRight,
  Clock,
  Award
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [machineryList, setMachineryList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');

  // Interactive Live ML Demo on Landing Page
  const [mlDemoMType, setMlDemoMType] = useState('Harvester');
  const [mlDemoDistrict, setMlDemoDistrict] = useState('Mysuru');
  const [mlDemoMonth, setMlDemoMonth] = useState(10);
  const [mlResult, setMlResult] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mRes, cRes] = await Promise.all([
          api.getMachinery(),
          api.getCategories()
        ]);
        if (mRes.success) setMachineryList(mRes.machinery);
        if (cRes.success) setCategories(cRes.categories);
      } catch (err) {
        console.error('Error loading landing page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    runLiveMlDemo('Harvester', 'Mysuru', 10);
  }, []);

  const runLiveMlDemo = async (mtype, district, month) => {
    setMlLoading(true);
    try {
      const res = await api.predictDemand({
        machinery_type: mtype,
        state: 'Karnataka',
        district: district,
        month: Number(month),
        season: Number(month) >= 6 && Number(month) <= 10 ? 'Kharif' : 'Rabi',
        crop_type: 'Paddy',
        farm_size_acres: 15,
        rental_price_per_day_inr: 2500
      });
      if (res.success) {
        setMlResult(res.data);
      }
    } catch (e) {
      console.warn('ML live preview failed:', e);
    } finally {
      setMlLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/farmer/marketplace?search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(selectedCategory !== 'All' ? selectedCategory : '')}&district=${encodeURIComponent(selectedDistrict !== 'All' ? selectedDistrict : '')}`);
  };

  const filteredFeatured = machineryList.filter((m) => {
    const matchCat = selectedCategory === 'All' || m.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchDist = selectedDistrict === 'All' || m.location_district.toLowerCase() === selectedDistrict.toLowerCase();
    const matchQ = !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchDist && matchQ;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfaf6]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-agri-dark via-[#124223] to-[#0a2e16] text-white pt-20 pb-28">
        {/* Subtle patterned overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#86efac_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading and CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>AI-Driven Demand Forecasting & Farm Equipment Rental</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
                Smart Agricultural <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-lime-300 to-green-200">
                  Machinery Rental
                </span> <br />
                & Demand Prediction
              </h1>

              <p className="text-lg text-emerald-100/90 max-w-2xl font-normal leading-relaxed">
                Connect directly with certified tractor and equipment owners in your district. Prevent seasonal machine shortages with our Machine Learning demand intelligence engine.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/farmer/marketplace"
                  className="px-6 py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-lime-400 to-emerald-400 hover:from-lime-300 hover:to-emerald-300 transition-all shadow-lg shadow-emerald-950/30 flex items-center gap-2 text-sm"
                >
                  <Search className="w-4 h-4" />
                  <span>Find & Rent Machinery</span>
                </Link>

                <Link
                  to="/owner/add-machinery"
                  className="px-6 py-3.5 rounded-xl font-bold text-white bg-emerald-800/80 hover:bg-emerald-700/80 border border-emerald-600/50 transition-all flex items-center gap-2 text-sm"
                >
                  <Tractor className="w-4 h-4" />
                  <span>List Your Equipment</span>
                </Link>

                <a
                  href="#ml-demand"
                  className="px-5 py-3.5 rounded-xl font-medium text-emerald-200 hover:text-white hover:bg-emerald-900/50 transition-colors text-sm flex items-center gap-1.5"
                >
                  <BarChart2 className="w-4 h-4" />
                  <span>Test ML Model</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-emerald-800/60 grid grid-cols-3 gap-6 text-emerald-100">
                <div>
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-xs text-emerald-300/80">Conflict-Free Bookings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">1,200</div>
                  <div className="text-xs text-emerald-300/80">ML Training Records</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">₹0</div>
                  <div className="text-xs text-emerald-300/80">Brokerage Fees</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500/20 shadow-2xl shadow-emerald-950/60 bg-gradient-to-tr from-emerald-900/40 to-slate-900/40 backdrop-blur-md p-3">
                <img
                  src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000&q=80"
                  alt="Modern Agricultural Tractor working in field"
                  className="w-full h-80 sm:h-96 object-cover rounded-2xl"
                />

                {/* Floating Overlay Badge: ML Forecast Live */}
                <div className="absolute top-6 left-6 p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 backdrop-blur-md shadow-xl text-white max-w-[240px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">ML Forecast</span>
                  </div>
                  <p className="text-sm font-semibold">Peak Kharif Demand</p>
                  <p className="text-xs text-slate-300 mt-0.5">Harvester demand projected +28% in Mysuru district</p>
                </div>

                {/* Floating Overlay Badge: Verified Machinery */}
                <div className="absolute bottom-6 right-6 p-3 rounded-2xl bg-white/95 border border-slate-200 text-slate-900 shadow-xl flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">100% Certified Fleet</p>
                    <p className="text-[11px] text-slate-500">Inspected & Maintained</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Quick Search Floating Section */}
      <section className="-mt-12 relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-center"
        >
          {/* Keyword Search with Voice Search */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-emerald-600" /> Machinery Search
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Mahindra 575, Harvester..."
                className="w-full pl-3.5 pr-11 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
              />
              <div className="absolute right-1.5 flex items-center">
                <VoiceSearchButton
                  onTranscript={(text) => setSearchQuery(text)}
                  title="Search machinery by voice"
                />
              </div>
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" /> Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
            >
              <option value="All">All Categories</option>
              <option value="Tractor">Tractor</option>
              <option value="Harvester">Harvester</option>
              <option value="Rotavator">Rotavator</option>
              <option value="Power Tiller">Power Tiller</option>
              <option value="Sprayer">Sprayer</option>
              <option value="Seed Drill">Seed Drill</option>
              <option value="Plough">Plough</option>
              <option value="Thresher">Thresher</option>
            </select>
          </div>

          {/* District Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Location / District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
            >
              <option value="All">All Districts</option>
              <option value="Mandya">Mandya (Karnataka)</option>
              <option value="Mysuru">Mysuru (Karnataka)</option>
              <option value="Pune">Pune (Maharashtra)</option>
              <option value="Guntur">Guntur (Andhra Pradesh)</option>
              <option value="Coimbatore">Coimbatore (Tamil Nadu)</option>
              <option value="Warangal">Warangal (Telangana)</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="pt-2 md:pt-5">
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-white bg-agri-dark hover:bg-agri-primary transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Search Equipment</span>
            </button>
          </div>
        </form>
      </section>

      {/* Featured Machinery Section */}
      <section id="marketplace" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <Tractor className="w-3.5 h-3.5" /> Direct From Local Owners
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Featured Agricultural Machinery</h2>
            <p className="text-sm text-slate-500 mt-1">
              Inspected tractors, combine harvesters, rotavators, and implements available for daily rental.
            </p>
          </div>

          <Link
            to="/farmer/marketplace"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-agri-primary hover:text-agri-dark group"
          >
            <span>Explore All Equipment</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Machinery Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filteredFeatured.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <Tractor className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-700">No machinery matching your filter.</p>
            <button
              onClick={() => { setSelectedCategory('All'); setSelectedDistrict('All'); setSearchQuery(''); }}
              className="mt-3 text-sm text-emerald-700 underline font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredFeatured.slice(0, 8).map((machinery) => (
              <div
                key={machinery.id}
                className="card-agri overflow-hidden flex flex-col group border border-slate-200/80 hover:border-emerald-300"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={machinery.image_url}
                    alt={machinery.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-white/95 text-slate-800 shadow-sm border border-slate-200">
                      {machinery.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold shadow-sm ${
                      machinery.availability_status === 'available'
                        ? 'bg-emerald-600 text-white'
                        : machinery.availability_status === 'in_use'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-600 text-white'
                    }`}>
                      {machinery.availability_status === 'available' ? 'Available' : machinery.availability_status === 'in_use' ? 'In Use' : 'Servicing'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        {machinery.location_district}, {machinery.location_state}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {machinery.avg_rating || 4.8}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 group-hover:text-agri-primary transition-colors line-clamp-1">
                      {machinery.name}
                    </h3>

                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {machinery.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Rental Rate</p>
                      <p className="text-lg font-extrabold text-agri-dark">
                        ₹{Number(machinery.rental_price_per_day).toLocaleString('en-IN')}
                        <span className="text-xs font-normal text-slate-500"> / day</span>
                      </p>
                    </div>

                    <Link
                      to={`/machinery/${machinery.id}`}
                      className="btn-primary text-xs py-2 px-3 gap-1 shadow-none"
                    >
                      <span>Book</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Machine Learning Demand Prediction Section */}
      <section id="ml-demand" className="py-20 bg-gradient-to-b from-[#f2f7f2] to-[#e6f0e6] border-y border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-200/60 border border-emerald-300 text-emerald-900 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-700" /> Machine Learning Demand Engine
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Predict Agricultural Machinery Demand
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Trained on our synthetic agricultural dataset (1,200 records), our predictive algorithms compare Linear Regression, Random Forest, Decision Tree, and K-Means Clustering to forecast monthly machinery needs.
            </p>
            <p className="text-xs text-amber-800 bg-amber-100/80 px-4 py-1.5 rounded-lg border border-amber-300/80 inline-block">
              Notice: Synthetic demonstration data. Used for academic demonstration and simulation.
            </p>
          </div>

          {/* Interactive ML Simulator Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-100 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Controls */}
              <div className="lg:col-span-5 space-y-4">
                <h4 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-emerald-600" /> Simulation Parameters
                </h4>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Machinery Type</label>
                  <select
                    value={mlDemoMType}
                    onChange={(e) => {
                      setMlDemoMType(e.target.value);
                      runLiveMlDemo(e.target.value, mlDemoDistrict, mlDemoMonth);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="Harvester">Combine Harvester</option>
                    <option value="Tractor">Agricultural Tractor</option>
                    <option value="Rotavator">Rotavator / Rotary Tiller</option>
                    <option value="Power Tiller">Power Tiller</option>
                    <option value="Sprayer">Boom Sprayer</option>
                    <option value="Seed Drill">Automatic Seed Drill</option>
                    <option value="Plough">Hydraulic Reversible Plough</option>
                    <option value="Thresher">Thresher</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">District / Region</label>
                  <select
                    value={mlDemoDistrict}
                    onChange={(e) => {
                      setMlDemoDistrict(e.target.value);
                      runLiveMlDemo(mlDemoMType, e.target.value, mlDemoMonth);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="Mysuru">Mysuru (Karnataka)</option>
                    <option value="Mandya">Mandya (Karnataka)</option>
                    <option value="Pune">Pune (Maharashtra)</option>
                    <option value="Guntur">Guntur (Andhra Pradesh)</option>
                    <option value="Coimbatore">Coimbatore (Tamil Nadu)</option>
                    <option value="Warangal">Warangal (Telangana)</option>
                    <option value="Hassan">Hassan (Karnataka)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Farming Month</label>
                  <select
                    value={mlDemoMonth}
                    onChange={(e) => {
                      setMlDemoMonth(Number(e.target.value));
                      runLiveMlDemo(mlDemoMType, mlDemoDistrict, Number(e.target.value));
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value={10}>October (Kharif Harvest)</option>
                    <option value={11}>November (Post-Harvest / Rabi Sowing)</option>
                    <option value={2}>February (Rabi Tillage)</option>
                    <option value={4}>April (Summer Preparation)</option>
                    <option value={6}>June (Monsoon Sowing)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => runLiveMlDemo(mlDemoMType, mlDemoDistrict, mlDemoMonth)}
                    disabled={mlLoading}
                    className="w-full btn-primary text-xs py-2.5"
                  >
                    {mlLoading ? 'Computing ML Forecast...' : 'Recalculate Prediction'}
                  </button>
                </div>
              </div>

              {/* Right Prediction Output Box */}
              <div className="lg:col-span-7 bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">Live Scikit-Learn Inference</span>
                    <h3 className="text-xl font-bold text-white mt-0.5">{mlDemoMType} in {mlDemoDistrict}</h3>
                  </div>
                  {mlResult && (
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border ${
                      mlResult.demand_level === 'High'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : mlResult.demand_level === 'Medium'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-red-500/20 text-red-300 border-red-500/40'
                    }`}>
                      {mlResult.demand_level} Demand
                    </span>
                  )}
                </div>

                {/* Big Metric Display */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                    <p className="text-xs text-slate-400 font-medium">Predicted Monthly Bookings</p>
                    <p className="text-3xl font-extrabold text-white mt-1">
                      {mlResult ? mlResult.predicted_demand : '--'}
                      <span className="text-sm font-normal text-slate-400 ml-1">units/mo</span>
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                    <p className="text-xs text-slate-400 font-medium">Agricultural Zone Cluster</p>
                    <p className="text-xs font-semibold text-emerald-300 mt-2 line-clamp-2">
                      {mlResult ? mlResult.cluster_zone : 'K-Means Segment'}
                    </p>
                  </div>
                </div>

                {/* Recommendations */}
                {mlResult && mlResult.recommendations && (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
                      <p className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" /> Owner Strategy Recommendation
                      </p>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {mlResult.recommendations.for_machinery_owners[0]?.description}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/40">
                      <p className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Farmer Booking Advisory
                      </p>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {mlResult.recommendations.for_farmers[0]?.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">How AgriRent ML Works</h2>
          <p className="text-sm text-slate-500">
            A seamless bridge between field farmers needing equipment and machinery owners looking to maximize rental yield.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              step: '01',
              title: 'Discover & Compare',
              desc: 'Search verified tractors, harvesters, and rotavators by village, district, daily price, and availability.',
              icon: Search
            },
            {
              step: '02',
              title: 'Conflict-Free Booking',
              desc: 'Select rental dates with automated double-booking prevention. Submit direct booking requests to owners.',
              icon: Calendar
            },
            {
              step: '03',
              title: 'Owner Approval & Pay',
              desc: 'Owners review and accept requests. Secure simulated checkout with instant downloadable GST invoices.',
              icon: CreditCard
            },
            {
              step: '04',
              title: 'Fieldwork & Reviews',
              desc: 'Operate machinery on schedule. Complete rental, record history, and publish transparent feedback.',
              icon: CheckCircle2
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm relative group hover:border-emerald-500 transition-colors"
              >
                <div className="text-3xl font-black text-emerald-100 group-hover:text-emerald-200 transition-colors mb-4">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why Choose AgriRent ML */}
      <section id="about" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-700">
                Why Choose AgriRent ML
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Empowering Rural Mechanization With Data-Driven Reliability
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Small and marginal farmers often struggle to afford high-cost machinery, while tractor owners experience seasonal underutilization. AgriRent ML creates a transparent, technology-enabled rental marketplace with predictive demand intelligence.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  { title: 'Zero Overlapping Bookings', desc: 'Guaranteed calendar date checks prevent double bookings and disputes.' },
                  { title: 'Machine Learning Insights', desc: 'Predict high-demand seasons to schedule preventative maintenance or secure advance rentals.' },
                  { title: 'Verified Profiles & Ratings', desc: 'Two-sided rating system builds high-trust farming communities across districts.' },
                  { title: 'Simulated Invoicing & Accounting', desc: 'Instant itemized proforma and tax invoices for transparent expense tracking.' }
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{feat.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1594771804886-a933bb2d609b?auto=format&fit=crop&w=600&q=80"
                alt="Combine Harvester"
                className="rounded-2xl h-56 w-full object-cover shadow-lg"
              />
              <img
                src="https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=600&q=80"
                alt="Rotavator Tiller"
                className="rounded-2xl h-56 w-full object-cover shadow-lg mt-8"
              />
              <img
                src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80"
                alt="Power Tiller"
                className="rounded-2xl h-56 w-full object-cover shadow-lg"
              />
              <img
                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80"
                alt="Automatic Seed Drill"
                className="rounded-2xl h-56 w-full object-cover shadow-lg mt-8"
              />
            </div>

          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Get In Touch
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-3">Ready to transform your farm operations?</h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Have questions regarding machinery listings, operator verification, or our ML demand model? Our agricultural support team is ready to assist.
            </p>

            <div className="mt-8 space-y-4 text-sm text-slate-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  📞
                </div>
                <div>
                  <p className="text-xs text-slate-400">Toll Free Helpline</p>
                  <p className="font-bold text-slate-900">1800-AGRI-RENT (9 AM - 7 PM IST)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  ✉️
                </div>
                <div>
                  <p className="text-xs text-slate-400">Direct Email</p>
                  <p className="font-bold text-slate-900">support@agrirentml.org</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#fbfaf6] p-6 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="font-bold text-base text-slate-900">Send an Inquiry</h4>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Your Name</label>
              <input type="text" placeholder="e.g. Ramesh Kumar" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Mobile / Email</label>
              <input type="text" placeholder="+91 98000 00000" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Message</label>
              <textarea rows={3} placeholder="Tell us about your machinery rental needs..." className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white" />
            </div>
            <button
              onClick={() => alert('Thank you for contacting AgriRent ML! We have received your message.')}
              className="btn-primary w-full text-xs py-2.5"
            >
              Submit Message
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

