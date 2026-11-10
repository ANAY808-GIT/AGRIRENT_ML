import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  Star,
  MapPin,
  Calendar,
  AlertCircle,
  Loader2,
  X,
  FileText
} from 'lucide-react';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Payment Checkout Modal State
  const [payBooking, setPayBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Simulated UPI (GooglePay)');
  const [paying, setPaying] = useState(false);

  // Review Modal State
  const [reviewBooking, setReviewBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadBookings = async () => {
    try {
      const res = await api.getFarmerBookings();
      if (res.success) {
        setBookings(res.bookings);
      }
    } catch (err) {
      console.error('Failed to load farmer bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) return;
    setActionLoading(true);
    try {
      const res = await api.cancelBooking(id);
      if (res.success) {
        setMessage('Booking cancelled successfully.');
        loadBookings();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!payBooking) return;

    setPaying(true);
    try {
      const res = await api.processPayment({
        booking_id: payBooking.id,
        payment_method: paymentMethod
      });
      if (res.success) {
        setMessage(`Payment successful! Transaction ID: ${res.transaction_id}. Your rental is now Active.`);
        setPayBooking(null);
        loadBookings();
      }
    } catch (err) {
      alert(err.message || 'Payment processing failed.');
    } finally {
      setPaying(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewBooking) return;

    setSubmittingReview(true);
    try {
      const res = await api.submitReview({
        booking_id: reviewBooking.id,
        rating: rating,
        comment: comment
      });
      if (res.success) {
        setMessage('Thank you! Your feedback has been recorded.');
        setReviewBooking(null);
        setComment('');
        loadBookings();
      }
    } catch (err) {
      alert(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600">Retrieving your machinery reservations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Machinery Bookings</h1>
          <p className="text-xs text-slate-500">Track approvals, complete simulated checkout, and manage field rentals.</p>
        </div>
        <Link to="/farmer/marketplace" className="btn-primary text-xs py-2 px-4">
          + Book Another Machine
        </Link>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Machinery Bookings Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't requested any machinery rentals yet. Browse the marketplace to find tractors, harvesters, or implements nearby.
          </p>
          <Link to="/farmer/marketplace" className="btn-primary text-xs py-2.5 px-6 inline-flex">
            Explore Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow transition-all space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                    <img src={b.machinery_image} alt={b.machinery_name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">{b.machinery_name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {b.machinery_category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Owner: {b.owner_name} • Location: {b.machinery_district}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border ${
                    b.status === 'pending'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : b.status === 'accepted'
                      ? 'bg-blue-50 text-blue-800 border-blue-300 animate-pulse'
                      : b.status === 'active'
                      ? 'bg-purple-50 text-purple-800 border-purple-300'
                      : b.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-red-50 text-red-800 border-red-300'
                  }`}>
                    {b.status === 'accepted' ? 'Approved - Awaiting Payment' : b.status}
                  </span>

                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Total Price</p>
                    <p className="text-lg font-extrabold text-agri-dark">
                      ₹{Number(b.total_price).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 space-y-0.5">
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Rental Duration</p>
                  <p className="font-bold text-slate-800">{b.start_date} to {b.end_date}</p>
                  <p className="text-slate-500">{b.total_days} Day(s) @ ₹{Number(b.daily_price).toLocaleString('en-IN')}/day</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 space-y-0.5">
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Owner Response</p>
                  <p className="text-slate-800 italic">
                    {b.owner_response_notes || (b.status === 'pending' ? 'Owner is reviewing your reservation...' : 'No additional response notes.')}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 space-y-0.5">
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Payment & Invoice</p>
                  <p className="font-semibold text-slate-800">
                    Status: <span className="font-bold uppercase text-emerald-700">{b.payment_status || (b.status === 'completed' || b.status === 'active' ? 'Paid' : 'Unpaid')}</span>
                  </p>
                  {b.transaction_id && (
                    <p className="text-[10px] font-mono text-slate-500 truncate">Txn: {b.transaction_id}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons depending on status */}
              <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100">
                {b.status === 'pending' && (
                  <button
                    onClick={() => handleCancelBooking(b.id)}
                    disabled={actionLoading}
                    className="px-3.5 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all"
                  >
                    Cancel Booking
                  </button>
                )}

                {b.status === 'accepted' && (
                  <button
                    onClick={() => setPayBooking(b)}
                    className="btn-primary text-xs py-2 px-5 gap-1.5 shadow-md bg-emerald-600 hover:bg-emerald-500 animate-bounce"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Proceed to Pay ₹{Number(b.total_price).toLocaleString('en-IN')} (Simulated Checkout)</span>
                  </button>
                )}

                {(b.status === 'active' || b.status === 'completed') && (
                  <Link
                    to={`/farmer/payments`}
                    className="btn-outline text-xs py-1.5 px-3.5 gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>View / Download Invoice</span>
                  </Link>
                )}

                {b.status === 'completed' && !b.review_rating && (
                  <button
                    onClick={() => { setReviewBooking(b); setRating(5); setComment(''); }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>Leave Review</span>
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Simulated Payment Modal */}
      {payBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Simulated Payment Checkout</h3>
              <button onClick={() => setPayBooking(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
              <p className="text-xs text-emerald-800 font-bold">{payBooking.machinery_name}</p>
              <p className="text-xs text-slate-600">{payBooking.total_days} Days ({payBooking.start_date} to {payBooking.end_date})</p>
              <p className="text-xl font-black text-agri-dark mt-2">₹{Number(payBooking.total_price).toLocaleString('en-IN')}</p>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Simulated Payment Channel
                </label>
                <div className="space-y-2 text-xs">
                  {[
                    'Simulated UPI (GooglePay / PhonePe)',
                    'Simulated Net Banking (State Bank of India)',
                    'Simulated Kisan Credit Card (KCC / RuPay)',
                    'Simulated Debit Card (Visa / Mastercard)'
                  ].map((method) => (
                    <label
                      key={method}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                        paymentMethod === method ? 'border-emerald-600 bg-emerald-50/50 font-bold text-emerald-950' : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="method"
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                        className="accent-emerald-700"
                      />
                      <span>{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                Notice: Simulated demonstration transaction for evaluation purposes. No real money will be charged.
              </p>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayBooking(null)}
                  className="btn-outline text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paying}
                  className="btn-primary text-xs py-2 px-5 gap-1.5"
                >
                  {paying ? 'Verifying Transaction...' : `Confirm & Pay ₹${Number(payBooking.total_price).toLocaleString('en-IN')}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Review Equipment Rental</h3>
              <button onClick={() => setReviewBooking(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              How was your experience renting <strong>{reviewBooking.machinery_name}</strong>?
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${star <= rating ? 'fill-current text-amber-500' : 'text-slate-200'}`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{rating} Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Your Feedback / Equipment Condition
                </label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Tractor delivered on time, engine ran smoothly, plowing finished ahead of schedule..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewBooking(null)}
                  className="btn-outline text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-primary text-xs py-2 px-5"
                >
                  {submittingReview ? 'Submitting...' : 'Publish Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

