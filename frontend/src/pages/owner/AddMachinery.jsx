import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Tractor,
  PlusCircle,
  MapPin,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Wrench,
  Fuel
} from 'lucide-react';

const PRESET_IMAGES = [
  { name: '4WD Tractor (Mahindra)', url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80' },
  { name: 'Combine Harvester', url: 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?auto=format&fit=crop&w=800&q=80' },
  { name: 'Rotavator / Rotary Tiller', url: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=800&q=80' },
  { name: 'Power Tiller', url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Boom Sprayer', url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80' },
  { name: 'Automatic Seed Drill', url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80' },
  { name: 'Hydraulic Mouldboard Plough', url: 'https://images.unsplash.com/photo-1595838725922-a8c88686f376?auto=format&fit=crop&w=800&q=80' },
  { name: 'John Deere Tractor', url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80' }
];

export default function AddMachinery() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Tractor');
  const [modelYear, setModelYear] = useState('2023');
  const [rentalPrice, setRentalPrice] = useState('1800');
  const [village, setVillage] = useState(user?.village || '');
  const [district, setDistrict] = useState(user?.district || 'Mysuru');
  const [state, setState] = useState(user?.state || 'Karnataka');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [availability, setAvailability] = useState('available');

  // Specs
  const [horsepower, setHorsepower] = useState('45 HP');
  const [fuelType, setFuelType] = useState('Diesel');
  const [condition, setCondition] = useState('Excellent');
  const [operatorAvailable, setOperatorAvailable] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !description || Number(rentalPrice) <= 0) {
      setError('Please provide machinery name, description, and a valid daily rate.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.addMachinery({
        name,
        category,
        model_year: modelYear,
        description,
        rental_price_per_day: Number(rentalPrice),
        location_village: village,
        location_district: district,
        location_state: state,
        image_url: imageUrl,
        availability_status: availability,
        specs: {
          horsepower,
          fuel_type: fuelType,
          condition,
          operator_available: operatorAvailable
        }
      });

      if (res.success) {
        setSuccess('Machinery added to your fleet successfully! Redirecting to fleet view...');
        setTimeout(() => {
          navigate('/owner/my-machinery');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to add machinery.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">List New Agricultural Machinery</h1>
        <p className="text-xs text-slate-500">Provide accurate details to attract reliable farmer bookings in your district.</p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
        
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-800 border-b border-slate-100 pb-2">
            1. Equipment Overview
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Machinery Name / Brand & Model *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mahindra 575 DI 4WD Tractor"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
              >
                <option value="Tractor">Tractor</option>
                <option value="Harvester">Combine Harvester</option>
                <option value="Rotavator">Rotavator / Rotary Tiller</option>
                <option value="Power Tiller">Power Tiller</option>
                <option value="Sprayer">Boom Sprayer</option>
                <option value="Seed Drill">Automatic Seed Drill</option>
                <option value="Plough">Hydraulic Reversible Plough</option>
                <option value="Thresher">Thresher</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Rental Price Per Day (₹ INR) *
              </label>
              <input
                type="number"
                required
                min={100}
                value={rentalPrice}
                onChange={(e) => setRentalPrice(e.target.value)}
                placeholder="1800"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Model Year
              </label>
              <input
                type="text"
                value={modelYear}
                onChange={(e) => setModelYear(e.target.value)}
                placeholder="2023"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Initial Status
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
              >
                <option value="available">Available Immediately</option>
                <option value="in_use">In Field / In Use</option>
                <option value="maintenance">Under Maintenance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Description *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe machine performance, recent servicing, included attachments, suitable soil conditions..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Section 2: Location */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-800 border-b border-slate-100 pb-2">
            2. Location of Equipment
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Village / Town
              </label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="e.g. Srirangapatna"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                District *
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
              >
                <option value="Mandya">Mandya</option>
                <option value="Mysuru">Mysuru</option>
                <option value="Hassan">Hassan</option>
                <option value="Pune">Pune</option>
                <option value="Guntur">Guntur</option>
                <option value="Coimbatore">Coimbatore</option>
                <option value="Erode">Erode</option>
                <option value="Warangal">Warangal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                State *
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
              >
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Telangana">Telangana</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Technical Specifications */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-800 border-b border-slate-100 pb-2">
            3. Technical Specifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Horsepower
              </label>
              <input
                type="text"
                value={horsepower}
                onChange={(e) => setHorsepower(e.target.value)}
                placeholder="e.g. 45 HP"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Fuel Type
              </label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
              >
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric / Battery</option>
                <option value="Petrol">Petrol</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
              >
                <option value="Brand New">Brand New</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good / Well Maintained</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Certified Operator
              </label>
              <select
                value={operatorAvailable ? 'yes' : 'no'}
                onChange={(e) => setOperatorAvailable(e.target.value === 'yes')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
              >
                <option value="yes">Operator Available</option>
                <option value="no">Machine Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Machinery Photo */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-800 border-b border-slate-100 pb-2">
            4. Machinery Photo
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Preset High-Res Photo or Enter Custom Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 mb-3"
            />

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {PRESET_IMAGES.map((img, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setImageUrl(img.url)}
                  className={`relative rounded-xl overflow-hidden h-16 border-2 transition-all ${
                    imageUrl === img.url ? 'border-emerald-600 ring-2 ring-emerald-500/40' : 'border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/owner/my-machinery')}
            className="btn-outline text-xs py-2.5 px-4"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary text-xs py-2.5 px-6 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Listing Equipment...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>List Machinery on AgriRent</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}

