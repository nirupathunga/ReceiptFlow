import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  Sparkles,
  Receipt,
  PieChart,
  BarChart3,
  Plus,
  DownloadCloud,
  RotateCcw,
  Calendar,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedMonth,
    setSelectedMonth,
    availablePeriods,
    setIsAddModalOpen,
    setIsExportImportOpen,
    resetToDefaults,
  } = useFinance();

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'story', label: 'Money Story', icon: Sparkles, badge: 'Story Mode' },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'categories', label: 'Categories & Budget', icon: PieChart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-30 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('overview')}
              className="flex items-center gap-2.5 text-left focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg p-1"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/50">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-lg tracking-tight text-white">ReceiptFlow</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                    REAL DATA
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 leading-none">Personal Finance Data Storytelling</p>
              </div>
            </button>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-950/60 p-1 rounded-xl border border-stone-800/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  id={`nav-${item.id}`}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-stone-800 text-white shadow-sm border border-stone-700/60'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 text-[9px] font-semibold tracking-wide uppercase bg-emerald-500 text-stone-950 rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Period Selector with real transaction timeframes */}
            <div className="relative flex items-center text-xs">
              <Calendar className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 pointer-events-none" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-stone-800 text-stone-200 pl-8 pr-3 py-1.5 rounded-lg border border-stone-700 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer max-w-[200px] truncate"
                aria-label="Select timeframe"
              >
                {availablePeriods.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Import / Export */}
            <button
              onClick={() => setIsExportImportOpen(true)}
              title="Import or Export Data"
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 border border-stone-800 transition-colors"
            >
              <DownloadCloud className="w-4 h-4" />
            </button>

            {/* Quick Reset */}
            <button
              onClick={() => {
                if (window.confirm('Reset all financial data back to the clean household CSV records?')) {
                  resetToDefaults();
                }
              }}
              title="Reset CSV Data"
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 border border-stone-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Scan / Add Receipt Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-semibold px-3.5 py-1.5 rounded-lg text-xs shadow-md shadow-emerald-950/40 transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Add / Scan Receipt</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-stone-800/80 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  isActive ? 'text-emerald-400 font-semibold' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
