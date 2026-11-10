mport React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import VoiceSearchButton from '../../components/common/VoiceSearchButton';
import {
  Search,
  Filter,
  MapPin,
  Star,
  Tractor,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
  Loader2,
  X
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Tractor',
  'Harvester',
  'Rotavator',
  'Power Tiller',
  'Sprayer',
  'Seed Drill',
  'Plough',
  'Thresher'
];

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [machinery, setMachinery] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [district, setDistrict] = useState(searchParams.get('district') || 'All');
  const [maxPrice, setMaxPrice] = useState(5000);
  const [availableOnly, setAvailableOnly] = useState(false);

  useEffect(() => {
    // Synchronize url params if changed
    const urlCat = searchParams.get('category');
    const urlSearch = searchParams.get('search');
    const urlDist = searchParams.get('district');
    if (urlCat) setCategory(urlCat);
    if (urlSearch) setSearch(urlSearch);
    if (urlDist) setDistrict(urlDist);
  }, [searchParams]);

  const fetchMachinery = async () => {
    setLoading(true);
    try {
      const res = await api.getMachinery({
        category: category !== 'All' ? category : '',
        search: search,
        district: district !== 'All' ? district : '',
        max_price: maxPrice,
        availability: availableOnly ? 'available' : ''
      });
      if (res.success) {
        setMachinery(res.machinery);
      }
    } catch (err) {
      console.error('Failed to query marketplace:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachinery();
  }, [category, district, maxPrice, availableOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMachinery();
  };

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      if (cat === 'All') updated.delete('category');
      else updated.set('category', cat);
      return updated;
    });
  };

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Agricultural Machinery Marketplace</h1>
        <p className="text-xs text-slate-500">Rent high-performance tractors, harvesters, and tools directly from verified owners.</p>
      </div>

      {/* Category Horizontal Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategorySelect(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${category.toLowerCase() === cat.toLowerCase()
                ? 'bg-agri-dark text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
          >
            {cat === 'All' ? '🚜 All Categories' : cat}
          </button>
        ))}
      </div>

      {/* Advanced Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">

          <div className="lg:col-span-5 relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by brand, tractor model, or specifications..."
              className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
            <div className="absolute right-1.5 flex items-center">
              <VoiceSearchButton
                onTranscript={(text) => setSearch(text)}
                title="Search equipment by voice"
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="All">All Locations & Districts</option>
              <option value="Mandya">Mandya (Karnataka)</option>
              <option value="Mysuru">Mysuru (Karnataka)</option>
              <option value="Hassan">Hassan (Karnataka)</option>
              <option value="Pune">Pune (Maharashtra)</option>
              <option value="Guntur">Guntur (Andhra Pradesh)</option>
              <option value="Coimbatore">Coimbatore (Tamil Nadu)</option>
              <option value="Warangal">Warangal (Telangana)</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <button
              type="button"
              onClick={() => setAvailableOnly(!availableOnly)}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${availableOnly ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-white border-slate-200 text-slate-600'
                }`}
            >
              <span className={`w-2 h-2 rounded-full ${availableOnly ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span>Available Only</span>
            </button>
          </div>

          <div className="lg:col-span-2">
            <button
              type="submit"
              className="btn-primary w-full text-xs py-2 shadow-none"
            >
              Apply Filter
            </button>
          </div>
        </form>

        {/* Price Slider Bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700">Max Daily Rate:</span>
            <input
              type="range"
              min={500}
              max={6000}
              step={100}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-40 sm:w-60 accent-emerald-700"
            />
            <span className="font-bold text-agri-dark font-mono">₹{maxPrice}/day</span>
          </div>

          <div className="text-slate-400 text-[11px]">
            Showing {machinery.length} agricultural machines
          </div>
        </div>
      </div>

      {/* Machinery Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-600">Querying equipment catalogue...</p>
        </div>
      ) : machinery.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Tractor className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Machinery Matches Your Filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try broadening your search keywords, location district, or adjusting the maximum rental price slider.
          </p>
          <button
            onClick={() => { setCategory('All'); setDistrict('All'); setSearch(''); setMaxPrice(6000); setAvailableOnly(false); }}
            className="btn-outline text-xs py-2 px-4"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {machinery.map((item) => (
            <div
              key={item.id}
              className="card-agri overflow-hidden flex flex-col justify-between border border-slate-200/80 hover:border-emerald-400 group"
            >
              <div>
                {/* Photo & Availability */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-white/95 text-slate-800 shadow-sm border border-slate-200">
                      {item.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold shadow-sm ${item.availability_status === 'available'
                        ? 'bg-emerald-600 text-white'
                        : item.availability_status === 'in_use'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-600 text-white'
                      }`}>
                      {item.availability_status === 'available' ? 'Available' : item.availability_status === 'in_use' ? 'In Use' : 'Servicing'}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      {item.location_district}, {item.location_state}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {item.avg_rating || 4.8}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 group-hover:text-agri-primary transition-colors line-clamp-1">
                    {item.name}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-600 border-t border-slate-100">
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Owner: <strong>{item.owner_name}</strong>
                    </span>
                    <span className="font-semibold text-slate-700">{item.specs?.horsepower || 'Diesel'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Rate & Book Link */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Rate</p>
                  <p className="text-lg font-black text-agri-dark">
                    ₹{Number(item.rental_price_per_day).toLocaleString('en-IN')}
                    <span className="text-xs font-normal text-slate-500"> / day</span>
                  </p>
                </div>

                <Link
                  to={`/machinery/${item.id}`}
                  className="btn-primary text-xs py-2 px-3.5 gap-1.5 shadow-none"
                >
                  <span>Book Equipment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

