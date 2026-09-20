import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { X, Download, Upload, RotateCcw, FileText, Database, Check } from 'lucide-react';

export const DataExportImportModal: React.FC = () => {
  const {
    isExportImportOpen,
    setIsExportImportOpen,
    transactions,
    categories,
    importData,
    resetToDefaults,
  } = useFinance();

  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isExportImportOpen) return null;

  const handleExportJSON = () => {
    const data = {
      app: 'ReceiptFlow',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      transactions,
      categories,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receiptflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Merchant', 'Amount', 'Type', 'Category', 'PaymentMethod', 'Status', 'HasReceipt', 'Notes'];
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      `"${t.merchant.replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
      t.type,
      t.category,
      t.paymentMethod,
      t.status,
      t.receipt ? 'Yes' : 'No',
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receiptflow-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.transactions && Array.isArray(parsed.transactions)) {
          importData(parsed.transactions, parsed.categories);
          setImportStatus('Successfully imported ' + parsed.transactions.length + ' records!');
          setTimeout(() => {
            setImportStatus(null);
            setIsExportImportOpen(false);
          }, 1200);
        } else if (Array.isArray(parsed)) {
          importData(parsed);
          setImportStatus('Successfully imported ' + parsed.length + ' transactions!');
          setTimeout(() => {
            setImportStatus(null);
            setIsExportImportOpen(false);
          }, 1200);
        } else {
          alert('Invalid format. Expecting JSON backup from ReceiptFlow.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="data-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setIsExportImportOpen(false)}
    >
      <div
        className="w-full max-w-md bg-stone-900 text-stone-100 rounded-2xl shadow-2xl border border-stone-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/50">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <h2 id="data-modal-title" className="font-display font-bold text-base text-white">
              Data Management & Backup
            </h2>
          </div>
          <button
            onClick={() => setIsExportImportOpen(false)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <p className="text-stone-300">
            ReceiptFlow operates with 100% private, client-side storage. You own all your data. Export your receipts and ledger anytime, or restore from a backup.
          </p>

          {importStatus && (
            <div className="p-3 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{importStatus}</span>
            </div>
          )}

          {/* Export Options */}
          <div className="space-y-2 pt-1">
            <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Export Data</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-2 p-3 bg-stone-800 hover:bg-stone-750 border border-stone-700 rounded-xl text-stone-200 font-medium hover:border-emerald-500/40 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handleExportJSON}
                className="flex items-center justify-center gap-2 p-3 bg-stone-800 hover:bg-stone-750 border border-stone-700 rounded-xl text-stone-200 font-medium hover:border-emerald-500/40 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-teal-400" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          {/* Import Option */}
          <div className="space-y-2 pt-2 border-t border-stone-800">
            <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Import Backup</label>
            <label className="flex items-center justify-center gap-2 p-3 bg-stone-800/80 hover:bg-stone-800 border border-dashed border-stone-700 hover:border-emerald-500/50 rounded-xl text-stone-200 font-medium cursor-pointer transition-all">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Select JSON Backup File</span>
              <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
            </label>
          </div>

          {/* Reset Option */}
          <div className="pt-2 border-t border-stone-800">
            <button
              onClick={() => {
                if (window.confirm('Reset all financial transactions and custom categories to sample defaults?')) {
                  resetToDefaults();
                  setIsExportImportOpen(false);
                }
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border border-rose-900/40 rounded-xl font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Curated Sample Dataset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
