import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  TrendingUp,
  Filter,
  BarChart2,
  AlertCircle,
  CheckCircle2,
  Layers,
  MapPin,
  Calendar,
  DollarSign,
  Loader2,
  Clock,
  ShieldAlert,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

export default function OwnerMLDemand() {
  const { user } = useAuth();

  const [options, setOptions] = useState(null);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Form selections
  const [machineryType, setMachineryType] = useState('Tractor');
  const [state, setState] = useState(user?.state || 'Karnataka');
  const [district, setDistrict] = useState(user?.district || 'Mysuru');
  const [month, setMonth] = useState(10);
  const [season, setSeason] = useState('Kharif');
  const [cropType, setCropType] = useState('Paddy');
  const [farmSize, setFarmSize] = useState(15.0);
  const [rentalPrice, setRentalPrice] = useState(1800);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('best');

  // Prediction State
  const [result, setResult] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await api.getMLOptions();
        if (res.success) {
          setOptions(res);
        }
      } catch (err) {
        console.error('Failed to load ML options:', err);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
    executePrediction('Tractor', district, 10, 'Kharif', 'Paddy', 15.0, 1800);
  }, []);

  const executePrediction = async (mtype, dist, mth, ssn, crop, fsize, price) => {
    setPredicting(true);
    setError('');
    try {
      const res = await api.predictDemand({
        machinery_type: mtype || machineryType,
        state: state,
        district: dist || district,
        month: Number(mth || month),
        season: ssn || season,
        crop_type: crop || cropType,
        farm_size_acres: Number(fsize || farmSize),
        rental_price_per_day_inr: Number(price || rentalPrice),
        algorithm: selectedAlgorithm
      });

      if (res.success) {
        setResult(res.data);
      }
    } catch (err) {
      setError(err.message || 'Prediction failed.');
    } finally {
      setPredicting(false);
    }
  };

  const handlePredictSubmit = (e) => {
    e.preventDefault();
    executePrediction(machineryType, district, month, season, cropType, farmSize, rentalPrice);
  };

  const handleMachineryChange = (newType) => {
    setMachineryType(newType);
    const defPrice = options?.machinery_price_defaults?.[newType]?.avg_price || 1500;
    setRentalPrice(defPrice);
    executePrediction(newType, district, month, season, cropType, farmSize, defPrice);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Actual Machine Learning Inference Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Agricultural Machinery Demand Prediction
          </h1>
          <p className="text-xs text-slate-500">
            Simulate monthly farmer demand to dynamically optimize rental rates and inventory allocations.
          </p>
        </div>

        {/* Academic Disclaimer Pill */}
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 max-w-md">
          <Info className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Trained on 1,200 synthetic demonstration records. Designed for collegiate showcase & validation.</span>
        </div>
      </div>

      {/* Main Grid: Form Inputs (5 cols) & Forecast Results (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Controls Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Forecast Parameters</span>
          </h3>

          <form onSubmit={handlePredictSubmit} className="space-y-4">
            
            {/* Machinery Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Machinery Type
              </label>
              <select
                value={machineryType}
                onChange={(e) => handleMachineryChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                {options?.machinery_types?.map((m) => (
                  <option key={m} value={m}>{m}</option>
                )) || <option value="Tractor">Tractor</option>}
              </select>
            </div>

            {/* State & District */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  State
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  {options?.states?.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  )) || <option value="Karnataka">Karnataka</option>}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  District
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  {(options?.districts_by_state?.[state] || ['Mysuru', 'Mandya', 'Pune', 'Guntur']).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Month & Season */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Month
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  <option value={1}>January</option>
                  <option value={2}>February</option>
                  <option value={3}>March</option>
                  <option value={4}>April</option>
                  <option value={5}>May</option>
                  <option value={6}>June</option>
                  <option value={7}>July</option>
                  <option value={8}>August</option>
                  <option value={9}>September</option>
                  <option value={10}>October</option>
                  <option value={11}>November</option>
                  <option value={12}>December</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Agricultural Season
                </label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  <option value="Kharif">Kharif</option>
                  <option value="Rabi">Rabi</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>
            </div>

            {/* Crop Type & Farm Size */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Dominant Crop
                </label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  {options?.crops?.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  )) || <option value="Paddy">Paddy</option>}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Farm Size (Acres)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={farmSize}
                  onChange={(e) => setFarmSize(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            {/* Rental Price */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Your Rental Price Rate (₹/day)
              </label>
              <input
                type="number"
                value={rentalPrice}
                onChange={(e) => setRentalPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* Algorithm Switcher */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Regression Algorithm
              </label>
              <select
                value={selectedAlgorithm}
                onChange={(e) => setSelectedAlgorithm(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="best">Automated Best Model (Linear Regression)</option>
                <option value="linear_regression">Linear Regression</option>
                <option value="random_forest">Random Forest Regressor</option>
                <option value="decision_tree">Decision Tree Regressor</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={predicting}
              className="btn-primary w-full py-3 text-xs gap-2 shadow-md mt-2"
            >
              {predicting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Computing Live Prediction...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Calculate Demand Forecast</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results Display (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <>
              {/* Primary Forecast Gauge Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                      Forecast Result
                    </span>
                    <h3 className="text-xl font-bold text-white mt-0.5">
                      {result.input_features.machinery_type} in {result.input_features.district}
                    </h3>
                  </div>

                  <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                    result.demand_level === 'High'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : result.demand_level === 'Medium'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-red-500/20 text-red-300 border-red-500/40'
                  }`}>
                    {result.demand_level} Demand
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                    <p className="text-xs text-slate-400 font-medium">Predicted Monthly Bookings</p>
                    <p className="text-4xl font-black text-white mt-1">
                      {result.predicted_demand}
                      <span className="text-sm font-normal text-slate-400 ml-1.5">units</span>
                    </p>
                    <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> High fleet utilization expected
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                    <p className="text-xs text-slate-400 font-medium">K-Means Cluster Profile</p>
                    <p className="text-xs font-bold text-emerald-300 mt-2 leading-relaxed">
                      {result.cluster_zone}
                    </p>
                  </div>
                </div>

                {/* Multi-Algorithm Model Comparison Side-by-Side */}
                {result.algorithm_comparisons && (
                  <div className="pt-2 border-t border-slate-800">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Multi-Algorithm Validation (Side-by-Side)
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
                        <p className="text-[10px] text-slate-400">Linear Regression</p>
                        <p className="text-base font-bold text-white mt-0.5">
                          {result.algorithm_comparisons.linear_regression} <span className="text-[10px] text-slate-400">units</span>
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
                        <p className="text-[10px] text-slate-400">Random Forest</p>
                        <p className="text-base font-bold text-white mt-0.5">
                          {result.algorithm_comparisons.random_forest} <span className="text-[10px] text-slate-400">units</span>
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
                        <p className="text-[10px] text-slate-400">Decision Tree</p>
                        <p className="text-base font-bold text-white mt-0.5">
                          {result.algorithm_comparisons.decision_tree} <span className="text-[10px] text-slate-400">units</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Machinery Comparison Chart across all categories */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Regional Machinery Demand Comparison</h3>
                    <p className="text-xs text-slate-500">Projected demand for all equipment types in {result.input_features.district}</p>
                  </div>
                </div>

                <div className="h-60 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.machinery_comparison} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                      <YAxis dataKey="machinery_type" type="category" stroke="#94a3b8" fontSize={11} width={90} />
                      <Tooltip
                        formatter={(val) => [`${val} Units`, 'Forecasted Demand']}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                      />
                      <Bar dataKey="predicted_demand" radius={[0, 8, 8, 0]}>
                        {result.machinery_comparison.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.is_current ? '#15803d' : '#94a3b8'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Owner Action Recommendations */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Fleet Strategy Recommendations For You</span>
                </h3>

                <div className="space-y-3 pt-1">
                  {result.recommendations.for_machinery_owners.map((rec, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-emerald-950">{rec.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200/70 text-emerald-900">
                          {rec.tag}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-900/90 leading-relaxed">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </div>

            </>
          )}

        </div>

      </div>

    </div>
  );
}

