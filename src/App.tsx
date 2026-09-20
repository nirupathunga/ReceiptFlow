import React from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Navbar } from './components/Navbar';
import { OverviewView } from './components/OverviewView';
import { MoneyStoryView } from './components/MoneyStoryView';
import { TransactionsView } from './components/TransactionsView';
import { CategoriesView } from './components/CategoriesView';
import { AnalyticsView } from './components/AnalyticsView';
import { ReceiptModal } from './components/ReceiptModal';
import { AddTransactionModal } from './components/AddTransactionModal';
import { DataExportImportModal } from './components/DataExportImportModal';
import { ShieldCheck, Sparkles, Receipt, HeartHandshake } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { activeTab, setActiveTab } = useFinance();

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-900">
      {/* Persistent Navigation */}
      <Navbar />

      {/* Main Content Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'overview' && <OverviewView />}
        {activeTab === 'story' && <MoneyStoryView />}
        {activeTab === 'transactions' && <TransactionsView />}
        {activeTab === 'categories' && <CategoriesView />}
        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* Modals */}
      <ReceiptModal />
      <AddTransactionModal />
      <DataExportImportModal />

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 mt-12 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-emerald-600 flex items-center justify-center text-white">
              <Receipt className="w-3 h-3" />
            </div>
            <span className="font-display font-bold text-stone-800">ReceiptFlow</span>
            <span>•</span>
            <span className="text-stone-400">Personal Finance Data Storytelling</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Client-Side • Zero Cloud Leakage</span>
            </div>
            <span>•</span>
            <button
              onClick={() => setActiveTab('story')}
              className="text-stone-600 hover:text-emerald-700 font-medium transition-colors"
            >
              Money Story
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <DashboardContent />
    </FinanceProvider>
  );
}
