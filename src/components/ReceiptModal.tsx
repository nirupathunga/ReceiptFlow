import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/csvParser';
import { X, Printer, ShieldCheck } from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const { inspectedReceipt, setInspectedReceipt } = useFinance();

  if (!inspectedReceipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setInspectedReceipt(null)}
    >
      <div
        className="relative w-full max-w-md max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Top Controls */}
        <div className="w-full flex items-center justify-between pb-3 text-stone-200">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Digital Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="Print Receipt"
              className="p-1.5 rounded-lg bg-stone-800/90 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => setInspectedReceipt(null)}
              title="Close"
              className="p-1.5 rounded-lg bg-stone-800/90 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Paper Receipt Container */}
        <div className="w-full bg-[#fdfbf7] text-stone-900 rounded-lg shadow-2xl shadow-stone-950/50 overflow-hidden flex flex-col max-h-[80vh] border border-stone-300/80">
          {/* Top Perforation Zigzag Edge */}
          <div className="w-full h-3 bg-stone-900/10 flex overflow-hidden">
            <svg className="w-full h-3 text-[#fdfbf7] fill-current" preserveAspectRatio="none" viewBox="0 0 400 12">
              <path d="M0,0 L10,12 L20,0 L30,12 L40,0 L50,12 L60,0 L70,12 L80,0 L90,12 L100,0 L110,12 L120,0 L130,12 L140,0 L150,12 L160,0 L170,12 L180,0 L190,12 L200,0 L210,12 L220,0 L230,12 L240,0 L250,12 L260,0 L270,12 L280,0 L290,12 L300,0 L310,12 L320,0 L330,12 L340,0 L350,12 L360,0 L370,12 L380,0 L390,12 L400,0 L400,12 L0,12 Z" />
            </svg>
          </div>

          {/* Receipt Scrollable Body */}
          <div className="p-6 overflow-y-auto space-y-4 font-mono-num text-xs selection:bg-amber-200">
            {/* Merchant Header */}
            <div className="text-center space-y-1 border-b border-dashed border-stone-300 pb-4">
              <div className="inline-block px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-stone-200/80 text-stone-700 mb-1 font-sans">
                Verified Purchase
              </div>
              <h2 id="receipt-modal-title" className="font-display font-bold text-lg text-stone-900 tracking-tight">
                {inspectedReceipt.merchantName}
              </h2>
              {inspectedReceipt.address && (
                <p className="text-[11px] text-stone-500 font-sans">{inspectedReceipt.address}</p>
              )}
              <div className="flex items-center justify-center gap-3 text-[11px] text-stone-500 pt-1 font-sans">
                <span>Date: {inspectedReceipt.date}</span>
                <span>•</span>
                <span>ID: #{inspectedReceipt.id.slice(0, 12)}</span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2 py-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-wider pb-1 border-b border-stone-200 font-sans">
                <span>Item / Description</span>
                <span>Amount</span>
              </div>

              {inspectedReceipt.items.map((item, idx) => (
                <div key={item.id || idx} className="flex items-start justify-between gap-3 text-stone-800 leading-tight">
                  <div className="flex-1">
                    <p className="font-medium text-[12px]">{item.name}</p>
                    {item.category && (
                      <p className="text-[10px] text-stone-500 font-sans">
                        Category: {item.category}
                      </p>
                    )}
                  </div>
                  <div className="text-right font-semibold text-[12px]">
                    {formatCurrency(item.price)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Calculation */}
            <div className="border-t border-dashed border-stone-300 pt-3 space-y-1.5 font-sans">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-mono-num font-medium">{formatCurrency(inspectedReceipt.subtotal)}</span>
              </div>
              {inspectedReceipt.taxAmount > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>Taxes / Surcharge</span>
                  <span className="font-mono-num font-medium">{formatCurrency(inspectedReceipt.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-900 font-bold text-sm pt-2 border-t border-stone-200">
                <span>Total Amount Paid</span>
                <span className="font-mono-num text-emerald-800">
                  {formatCurrency(inspectedReceipt.totalAmount)}
                </span>
              </div>
            </div>

            {/* Payment & Security Footer */}
            <div className="border-t border-dashed border-stone-300 pt-3 space-y-1 text-[11px] text-stone-500 font-sans">
              <div className="flex justify-between">
                <span>Payment Mode</span>
                <span className="font-medium text-stone-800">{inspectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Record Status</span>
                <span className="font-medium text-stone-800">Cleared & Audited</span>
              </div>
            </div>

            {/* Barcode representation */}
            <div className="pt-4 flex flex-col items-center justify-center space-y-1">
              <div className="flex items-center gap-[2px] h-9">
                {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 1, 3, 4, 2, 1, 3, 2].map((w, i) => (
                  <div key={i} className="bg-stone-900 h-full" style={{ width: `${w}px` }} />
                ))}
              </div>
              <span className="text-[10px] text-stone-400 font-mono-num tracking-widest uppercase">
                REC-AUTH-VERIFIED
              </span>
            </div>
          </div>

          {/* Bottom Zigzag Edge */}
          <div className="w-full h-3 bg-stone-900/10 flex overflow-hidden">
            <svg className="w-full h-3 text-[#fdfbf7] fill-current rotate-180" preserveAspectRatio="none" viewBox="0 0 400 12">
              <path d="M0,0 L10,12 L20,0 L30,12 L40,0 L50,12 L60,0 L70,12 L80,0 L90,12 L100,0 L110,12 L120,0 L130,12 L140,0 L150,12 L160,0 L170,12 L180,0 L190,12 L200,0 L210,12 L220,0 L230,12 L240,0 L250,12 L260,0 L270,12 L280,0 L290,12 L300,0 L310,12 L320,0 L330,12 L340,0 L350,12 L360,0 L370,12 L380,0 L390,12 L400,0 L400,12 L0,12 Z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
