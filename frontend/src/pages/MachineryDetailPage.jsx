import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Tractor,
  MapPin,
  Calendar,
  Star,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Share2,
  User,
  Wrench,
  Fuel,
  Info
} from 'lucide-react';

export default function MachineryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isFarmer } = useAuth();

  const [machinery, setMachinery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking Form State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await api.getMachineryById(id);
        if (res.success) {
          setMachinery(res.machinery);
        } else {
          setError('Machinery not found.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load machinery details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  // Calculate days & price
  let totalDays = 0;
  let totalPrice = 0;
  if (startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (e >= s) {
      totalDays = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
      totalPrice = totalDays * (machinery?.rental_price_per_day || 0);
    }
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess(null);

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/machinery/${id}` } });
      return;
    }

    if (totalDays <= 0) {
      setBookingError('Please select valid start and end dates.');
      return;
    }

    setBookingLoading(true);
    try {
      const res = await api.createBooking({
        machinery_id: Number(id),
        start_date: startDate,
        end_date: endDate,
        farmer_notes: notes
      });

      if (res.success) {
        setBookingSuccess({
          message: res.message,
          booking_id: res.booking_id,
          total_price: res.total_price
        });
        // Clear dates
        setStartDate('');
        setEndDate('');
        setNotes('');
      }
    } catch (err) {
      setBookingError(err.message || 'Failed to submit booking request.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf6] flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading equipment specifications...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !machinery) {
    return (
      <div className="min-h-screen bg-[#fbfaf6] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-2xl mx-auto py-20 px-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Equipment Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">{error || 'This machinery listing may have been removed or updated.'}</p>
          <Link to="/" className="btn-primary text-xs py-2.5">
            Return to Marketplace
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfaf6]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Breadcrumb navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/farmer/marketplace"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-agri-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </Link>
          <span className="text-xs text-slate-400 font-mono">Listing ID #{machinery.id}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Image, Details & Specs (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Machinery Banner Card */}
            <div className="rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-md">
              <div className="relative h-80 sm:h-96 w-full bg-slate-100">
                <img
                  src={machinery.image_url}
                  alt={machinery.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-white/95 text-slate-800 shadow-sm border border-slate-200">
                    {machinery.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold shadow-sm ${
                    machinery.availability_status === 'available'
                      ? 'bg-emerald-600 text-white'
                      : machinery.availability_status === 'in_use'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-600 text-white'
                  }`}>
                    {machinery.availability_status === 'available' ? 'Available for Rent' : machinery.availability_status === 'in_use' ? 'Currently In Field' : 'Under Maintenance'}
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>{machinery.location_village ? `${machinery.location_village}, ` : ''}{machinery.location_district}, {machinery.location_state}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-bold text-amber-600">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{machinery.avg_rating || 4.8}</span>
                    <span className="text-xs text-slate-400 font-normal">({machinery.review_count || 1} verified review)</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {machinery.name}
                </h1>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {machinery.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Specifications Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-600" />
                <span>Technical Specifications & Features</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Model Year</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">{machinery.model_year || '2023'}</p>
                </div>

                {machinery.specs && Object.entries(machinery.specs).map(([key, val]) => (
                  <div key={key} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider capitalize">
                      {key.replace('_', ' ')}
                    </p>
                    <p className="text-sm font-bold text-slate-800 mt-1">
                      {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Owner Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-700 to-green-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
                  {machinery.owner_name ? machinery.owner_name[0].toUpperCase() : 'O'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-slate-900">{machinery.owner_name}</h4>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Owner
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {machinery.owner_district}, {machinery.owner_state} • Member since 2024
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                  <span>Customer Reviews ({machinery.reviews?.length || 0})</span>
                </h3>
                <span className="text-xs text-slate-500">Average Rating: {machinery.avg_rating || 4.8} / 5</span>
              </div>

              {machinery.reviews && machinery.reviews.length > 0 ? (
                <div className="space-y-4 pt-2">
                  {machinery.reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{rev.farmer_name}</span>
                        <div className="flex items-center text-amber-500">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-3">No reviews submitted yet for this machinery.</p>
              )}
            </div>

          </div>

          {/* Right Column: Booking Form Widget (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/30 shadow-xl space-y-6">
              
              {/* Daily rate header */}
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rental Price</p>
                  <p className="text-3xl font-extrabold text-agri-dark mt-0.5">
                    ₹{Number(machinery.rental_price_per_day).toLocaleString('en-IN')}
                    <span className="text-xs font-medium text-slate-500"> / day</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    Transparent Daily Rate
                  </span>
                </div>
              </div>

              {/* Success Notification */}
              {bookingSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <p className="text-xs font-bold">Booking Request Confirmed!</p>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    {bookingSuccess.message}
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/farmer/my-bookings"
                      className="btn-primary text-xs py-2 px-3 w-full text-center"
                    >
                      View in My Bookings
                    </Link>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {bookingError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Existing Booked Dates Warning (Double booking prevention) */}
              {machinery.booked_dates && machinery.booked_dates.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Info className="w-3.5 h-3.5 text-amber-600" />
                    <span>Unavailable Dates (Already Reserved):</span>
                  </div>
                  <div className="space-y-0.5 text-[11px] text-amber-900 font-mono">
                    {machinery.booked_dates.map((b, idx) => (
                      <p key={idx}>• {b.start_date} to {b.end_date}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Booking Form */}
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Starting Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Ending Date
                  </label>
                  <input
                    type="date"
                    required
                    min={startDate || new Date().toISOString().split('T')[0]}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Rental Notes / Crop Tillage Details
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Paddy field preparation, need delivery by 7 AM, approx 15 acres..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 bg-white"
                  />
                </div>

                {/* Calculation Summary */}
                {totalDays > 0 && (
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Rental Duration:</span>
                      <span className="font-bold text-slate-800">{totalDays} Day{totalDays > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Daily Rate:</span>
                      <span>₹{Number(machinery.rental_price_per_day).toLocaleString('en-IN')} / day</span>
                    </div>
                    <div className="pt-2 border-t border-emerald-200/60 flex justify-between text-sm font-extrabold text-agri-dark">
                      <span>Total Rental Amount:</span>
                      <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="btn-primary w-full py-3.5 text-sm gap-2 shadow-lg shadow-emerald-950/20"
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Rental Booking Request</span>
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero advance deposit required • Pay upon owner confirmation</span>
              </div>

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

