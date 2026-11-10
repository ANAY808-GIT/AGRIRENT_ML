import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  CreditCard,
  FileText,
  Download,
  Printer,
  CheckCircle2,
  Calendar,
  MapPin,
  Tractor,
  Loader2,
  X,
  Receipt
} from 'lucide-react';

export default function FarmerPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.getPaymentHistory();
        if (res.success) {
          setPayments(res.payments);
        }
      } catch (err) {
        console.error('Failed to load farmer payments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const openInvoiceModal = async (bookingId) => {
    setInvoiceLoading(true);
    try {
      const res = await api.getInvoice(bookingId);
      if (res.success) {
        setSelectedInvoice(res.invoice);
      }
    } catch (err) {
      alert(err.message || 'Failed to load invoice.');
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading payment vouchers and receipts...</p>
      </div>
    );
  }

  const totalSpent = payments.reduce((acc, p) => acc + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Payments & Invoices</h1>
          <p className="text-xs text-slate-500">View electronic receipts, tax breakdowns, and transaction IDs for all machinery rentals.</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-right">
          <p className="text-[10px] uppercase font-bold text-emerald-800">Total Machinery Expenditure</p>
          <p className="text-xl font-black text-agri-dark">
            ₹{totalSpent.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Invoices Generated Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once you confirm and complete payments for approved bookings, all tax invoices and transaction records will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4">Machinery Details</th>
                  <th className="px-6 py-4">Equipment Owner</th>
                  <th className="px-6 py-4">Rental Duration</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 font-mono">{p.invoice_number}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{p.transaction_id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{p.machinery_name}</p>
                      <p className="text-slate-500">{p.machinery_category}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{p.owner_name}</p>
                      <p className="text-slate-400 font-mono">{p.owner_mobile}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{p.start_date} to {p.end_date}</p>
                      <p className="text-slate-500">{p.total_days} Days</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-extrabold text-agri-dark">
                      ₹{Number(p.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openInvoiceModal(p.booking_id)}
                        disabled={invoiceLoading}
                        className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-none"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span>View Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-10 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-6 my-8 print:m-0 print:p-0 print:border-none print:shadow-none">
            
            {/* Invoice Top Controls */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Tax Invoice & Rental Receipt</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Document */}
            <div className="space-y-6">
              
              {/* Brand and Invoice Meta */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Tractor className="w-6 h-6 text-emerald-700" />
                    <span className="text-xl font-black text-agri-dark tracking-tight">AgriRent ML</span>
                  </div>
                  <p className="text-xs text-slate-500">Decentralized Agricultural Equipment Network</p>
                  <p className="text-[11px] text-slate-400">GSTIN: 29AGRIRENT2026M1Z4</p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tax Invoice</p>
                  <p className="text-base font-extrabold text-slate-900 font-mono mt-0.5">{selectedInvoice.invoice_number}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Date: {selectedInvoice.paid_at || new Date().toISOString().split('T')[0]}</p>
                  <p className="text-[11px] font-mono text-emerald-700 font-bold">{selectedInvoice.transaction_id}</p>
                </div>
              </div>

              {/* Two-Sided Addresses: Owner & Farmer */}
              <div className="grid grid-cols-2 gap-6 text-xs border-b border-slate-200 pb-6">
                <div>
                  <p className="font-bold text-slate-400 uppercase text-[10px] mb-1">Service Provider (Machinery Owner):</p>
                  <p className="font-bold text-slate-900 text-sm">{selectedInvoice.owner_name}</p>
                  <p className="text-slate-600">{selectedInvoice.owner_village ? `${selectedInvoice.owner_village}, ` : ''}{selectedInvoice.owner_district}, {selectedInvoice.owner_state}</p>
                  <p className="text-slate-500 font-mono">Mobile: {selectedInvoice.owner_mobile}</p>
                </div>

                <div>
                  <p className="font-bold text-slate-400 uppercase text-[10px] mb-1">Billed To (Farmer / Field Owner):</p>
                  <p className="font-bold text-slate-900 text-sm">{selectedInvoice.farmer_name}</p>
                  <p className="text-slate-600">{selectedInvoice.farmer_village ? `${selectedInvoice.farmer_village}, ` : ''}{selectedInvoice.farmer_district}, {selectedInvoice.farmer_state}</p>
                  <p className="text-slate-500 font-mono">Mobile: {selectedInvoice.farmer_mobile}</p>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="p-3">Equipment Description</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Daily Rate</th>
                      <th className="p-3 text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{selectedInvoice.machinery_name}</p>
                        <p className="text-[11px] text-slate-500">{selectedInvoice.machinery_category} • {selectedInvoice.model_year || '2023'}</p>
                      </td>
                      <td className="p-3 text-slate-700">
                        {selectedInvoice.total_days} Days ({selectedInvoice.start_date} to {selectedInvoice.end_date})
                      </td>
                      <td className="p-3 text-slate-700 font-mono">
                        ₹{Number(selectedInvoice.daily_price).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900">
                        ₹{Number(selectedInvoice.amount).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Calculation & GST */}
              <div className="flex justify-end text-xs">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Base Rental Subtotal:</span>
                    <span className="font-mono">₹{Number(selectedInvoice.subtotal || selectedInvoice.amount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Agricultural GST (5% Concessional):</span>
                    <span className="font-mono">₹{Number(selectedInvoice.gst_amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-sm text-agri-dark">
                    <span>Grand Total Paid:</span>
                    <span className="font-mono">₹{Number(selectedInvoice.grand_total || selectedInvoice.amount).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-500 text-center border border-slate-200">
                This computer-generated tax invoice is issued by the AgriRent ML digital platform.
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

