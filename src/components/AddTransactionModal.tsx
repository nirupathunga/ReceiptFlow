import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TransactionType, ReceiptData } from '../types';
import { formatCurrency } from '../utils/csvParser';
import {
  X,
  Scan,
  Edit3,
  Upload,
  CheckCircle,
  Sparkles,
  Receipt as ReceiptIcon,
  Layers,
  Calendar,
  CreditCard,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const SAMPLE_OCR_TEMPLATES = [
  {
    title: 'Kirana Store & Grocery Mart',
    amount: 340,
    category: 'Food',
    subcategory: 'Grocery',
    items: [
      { id: 'kr1', name: 'Wheat Atta 5kg', price: 210, quantity: 1 },
      { id: 'kr2', name: 'Fresh Milk 1L', price: 70, quantity: 1 },
      { id: 'kr3', name: 'Table Butter 100g', price: 60, quantity: 1 },
    ],
    tax: 0,
    method: 'Cash',
  },
  {
    title: 'Suburban Railway Station',
    amount: 50,
    category: 'Transportation',
    subcategory: 'Train',
    items: [
      { id: 'rw1', name: 'Return Commute Ticket', price: 50, quantity: 1 },
    ],
    tax: 0,
    method: 'Cash',
  },
  {
    title: 'Mobile Service Recharge',
    amount: 199,
    category: 'subscription',
    subcategory: 'Mobile Service Provider',
    items: [
      { id: 'mb1', name: 'Monthly Data & Calling Pack', price: 199, quantity: 1 },
    ],
    tax: 0,
    method: 'Saving Bank account 1',
  },
  {
    title: 'Local Medical & Pharmacy',
    amount: 285,
    category: 'Health',
    subcategory: 'Medicine',
    items: [
      { id: 'ph1', name: 'Essential Vitamin Complex', price: 185, quantity: 1 },
      { id: 'ph2', name: 'Electrolyte Powder', price: 100, quantity: 1 },
    ],
    tax: 0,
    method: 'Credit Card',
  },
];

export const AddTransactionModal: React.FC = () => {
  const { isAddModalOpen, setIsAddModalOpen, categories, addTransaction } = useFinance();
  const [activeMode, setActiveMode] = useState<'scan' | 'manual'>('scan');

  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedResult, setScannedResult] = useState<ReceiptData | null>(null);
  const [detectedCategory, setDetectedCategory] = useState<string>('Food');

  // Manual form state
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('Food');
  const [subcategory, setSubcategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [notes, setNotes] = useState('');
  const [tagInput, setTagInput] = useState('');

  if (!isAddModalOpen) return null;

  const triggerScanSimulation = (preset?: typeof SAMPLE_OCR_TEMPLATES[0]) => {
    const template = preset || SAMPLE_OCR_TEMPLATES[Math.floor(Math.random() * SAMPLE_OCR_TEMPLATES.length)];
    setIsScanning(true);
    setScanProgress(15);
    setScannedResult(null);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setIsScanning(false);
          setDetectedCategory(template.category);

          setScannedResult({
            id: `rcpt-scan-${Date.now()}`,
            merchantName: template.title,
            date: new Date().toISOString().split('T')[0],
            subtotal: template.amount,
            taxAmount: template.tax,
            totalAmount: template.amount,
            paymentMethod: template.method,
            confidenceScore: 0.99,
            items: template.items.map((i) => ({ ...i, category: template.category })),
            notes: `${template.subcategory} entry parsed by OCR`,
          });
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  const handleSaveScannedReceipt = () => {
    if (!scannedResult) return;

    addTransaction({
      date: scannedResult.date,
      rawDate: new Date().toLocaleDateString('en-GB'),
      merchant: scannedResult.merchantName,
      amount: scannedResult.totalAmount,
      type: 'expense',
      category: detectedCategory,
      subcategory: scannedResult.items[0]?.category,
      paymentMethod: scannedResult.paymentMethod,
      status: 'cleared',
      notes: scannedResult.notes,
      isSubscription: detectedCategory.toLowerCase() === 'subscription',
      tags: [detectedCategory.toLowerCase(), 'receipt-ocr'],
      receipt: scannedResult,
      currency: 'INR',
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });

    setIsAddModalOpen(false);
    setScannedResult(null);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const tags = tagInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    addTransaction({
      date,
      rawDate: date,
      merchant: merchant.trim() || category,
      amount: parsedAmount,
      type,
      category,
      subcategory: subcategory.trim() || undefined,
      paymentMethod,
      status: 'cleared',
      notes: notes.trim() || undefined,
      isSubscription: category.toLowerCase() === 'subscription',
      tags: tags.length > 0 ? tags : [category.toLowerCase()],
      currency: 'INR',
    });

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
    });

    setIsAddModalOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setIsAddModalOpen(false)}
    >
      <div
        className="bg-white text-stone-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ReceiptIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 id="add-modal-title" className="font-display font-bold text-base text-stone-900">
                Capture Record or Scan Receipt
              </h2>
              <p className="text-[11px] text-stone-500">Add an audited ledger transaction or simulated OCR extraction</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(false)}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex border-b border-stone-200 bg-stone-50 p-1.5 gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setActiveMode('scan')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'scan' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Scan className="w-3.5 h-3.5 text-emerald-600" />
            <span>Digital OCR Simulator</span>
          </button>
          <button
            onClick={() => setActiveMode('manual')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'manual' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Manual Ledger Entry</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {activeMode === 'scan' ? (
            <div className="space-y-4">
              {/* Scan Trigger Stage */}
              {!scannedResult && !isScanning && (
                <div className="space-y-4">
                  <div
                    onClick={() => triggerScanSimulation()}
                    className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/70 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 group-hover:scale-110 text-emerald-600 flex items-center justify-center mx-auto transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="font-semibold text-xs text-stone-800">
                      Click to simulate Camera OCR Scanner
                    </p>
                    <p className="text-[11px] text-stone-500 max-w-xs mx-auto">
                      Instantly parses line-items, merchant information, taxes, and amounts.
                    </p>
                  </div>

                  {/* Preset Quick Chips */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                      Or Choose a Quick Sample:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {SAMPLE_OCR_TEMPLATES.map((tmpl, idx) => (
                        <button
                          key={idx}
                          onClick={() => triggerScanSimulation(tmpl)}
                          className="p-2.5 rounded-xl border border-stone-200 hover:border-emerald-400 text-left bg-stone-50/60 hover:bg-emerald-50/30 transition-all cursor-pointer"
                        >
                          <p className="font-semibold text-xs text-stone-900 truncate">{tmpl.title}</p>
                          <p className="text-[11px] text-stone-500 font-mono-num font-medium">
                            {formatCurrency(tmpl.amount)} • {tmpl.category}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {isScanning && (
                <div className="py-8 text-center space-y-3">
                  <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-stone-800">
                    Running Client-Side OCR Extraction... ({scanProgress}%)
                  </p>
                  <p className="text-[11px] text-stone-500">Recognizing items, amounts, and dates</p>
                </div>
              )}

              {/* Extracted Receipt Preview */}
              {scannedResult && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded">
                          OCR 99% Confidence
                        </span>
                        <h4 className="font-bold text-sm text-stone-900 mt-1">{scannedResult.merchantName}</h4>
                      </div>
                      <span className="font-mono-num font-bold text-base text-stone-900">
                        {formatCurrency(scannedResult.totalAmount)}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      {scannedResult.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-stone-700">
                          <span>{item.name}</span>
                          <span className="font-mono-num font-medium">{formatCurrency(item.price)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs">
                      <span className="text-stone-500">Category Tag:</span>
                      <select
                        value={detectedCategory}
                        onChange={(e) => setDetectedCategory(e.target.value)}
                        className="bg-white border border-stone-300 rounded-lg px-2 py-1 text-xs font-semibold"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveScannedReceipt}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                    >
                      Confirm & Add to Ledger
                    </button>
                    <button
                      onClick={() => setScannedResult(null)}
                      className="px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Rescan
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Manual Entry Form */
            <form onSubmit={handleManualSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Merchant / Payee Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kirana Store, Train Station, Electricity"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Amount (₹ INR)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-mono-num focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as TransactionType)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="expense">Expense (Outflow)</option>
                    <option value="income">Income (Inflow)</option>
                    <option value="transfer">Asset Transfer (Savings/PPF)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Cash">Cash</option>
                  <option value="Saving Bank account 1">Saving Bank account 1</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Saving Bank account 2">Saving Bank account 2</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Notes / Itemization (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 1kg atta, 2 tickets, data booster"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm transition-all cursor-pointer mt-2"
              >
                Save Record to Ledger
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
