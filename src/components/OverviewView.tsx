import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatCompactCurrency } from '../utils/csvParser';
import {
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Sparkles,
  Receipt,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const OverviewView: React.FC = () => {
  const { metrics, transactions, selectedMonth, setActiveTab, setInspectedReceipt, setIsAddModalOpen } = useFinance();
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  // Real transactions with verified receipts
  const receiptTransactions = transactions
    .filter((t) => t.receipt)
    .slice(0, 4);

  // Maximum spend amount for pulse chart scaling
  const maxSpend = Math.max(...metrics.dailySpendTimeline.map((d) => d.amount), 500);

  // Selected scrubbed item
  const activeTimelineItem = hoveredDay !== null
    ? metrics.dailySpendTimeline[hoveredDay] || metrics.dailySpendTimeline[metrics.dailySpendTimeline.length - 1]
    : metrics.dailySpendTimeline[metrics.dailySpendTimeline.length - 1] || { day: 1, date: 'Recent', amount: 0, merchants: [] };

  const periodLabel =
    selectedMonth === 'all'
      ? 'All-Time Multi-Year Portfolio'
      : selectedMonth.length === 4
      ? `Full Year ${selectedMonth}`
      : `${selectedMonth} Monthly`;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner / Hero Summary Card */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-stone-850 rounded-2xl p-6 sm:p-7 border border-stone-800 text-stone-100 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{periodLabel} Executive Brief</span>
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
              {metrics.netCashSurplus >= 0 ? 'Cash Surplus stands at ' : 'Net Capital Deployment at '}
              <span className={metrics.netCashSurplus >= 0 ? 'text-emerald-400 font-mono-num' : 'text-amber-400 font-mono-num'}>
                {metrics.netCashSurplus >= 0 ? '+' : ''}{formatCurrency(metrics.netCashSurplus)}
              </span>
            </h1>
            <p className="text-sm text-stone-300 max-w-2xl leading-relaxed">
              Living expenses are held at{' '}
              <strong className="text-stone-100 font-mono-num">{formatCurrency(metrics.livingExpenses)}</strong> across{' '}
              {metrics.needsSpend > 0 && <span>essential needs ({formatCurrency(metrics.needsSpend)}) and </span>}
              discretionary lifestyle. You retained an effective{' '}
              <strong className="text-emerald-400 font-mono-num">{metrics.savingsRate.toFixed(1)}% savings & asset transfer rate</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('story')}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-stone-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-950/40 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Money Story</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-medium px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>Scan / Add Entry</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Key Pillar Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inflow */}
        <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Total Inflow (Income)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display font-bold text-2xl text-stone-900 font-mono-num">
              {formatCurrency(metrics.totalIncome)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 mt-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{metrics.inflowCount} credits • Salary & Investment Returns</span>
            </div>
          </div>
        </div>

        {/* Living Expenses */}
        <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Living Burn (Needs + Wants)</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display font-bold text-2xl text-stone-900 font-mono-num">
              {formatCurrency(metrics.livingExpenses)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
              <span>Needs: {formatCompactCurrency(metrics.needsSpend)} • Wants: {formatCompactCurrency(metrics.wantsSpend)}</span>
            </div>
          </div>
        </div>

        {/* Wealth & Savings Transfers */}
        <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Assets & SIPs Transferred</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display font-bold text-2xl text-stone-900 font-mono-num">
              {formatCurrency(metrics.savingsTransferred)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-teal-700 mt-1 font-medium">
              <span>PPF, Mutual Funds & Fixed Deposits</span>
            </div>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Savings Efficiency Rate</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-display font-bold text-2xl text-stone-900 font-mono-num">
                {metrics.savingsRate.toFixed(1)}%
              </span>
              <span className="text-xs text-emerald-700 font-semibold">
                {metrics.savingsRate >= 20 ? 'Exceeds 20% rule' : 'Target: 20%'}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.savingsRate)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Interactive Cash Flow Diagram & Pulse Scrub */}
        <div className="lg:col-span-8 space-y-6">
          {/* Interactive Cash Flow Waterfall Flow */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-stone-900">
                  Cash Flow Stream Architecture
                </h3>
                <p className="text-xs text-stone-500">
                  Distribution from Inflow to Essential Needs, Lifestyle Wants, and Capital Assets
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
                50 / 30 / 20 Framework
              </span>
            </div>

            {/* Visual Flow Representation */}
            <div className="bg-stone-50 rounded-xl p-5 border border-stone-200/80 space-y-4">
              {/* Gross Inflow Node */}
              <div className="flex items-center justify-between bg-emerald-900 text-emerald-50 p-3.5 rounded-xl shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center font-bold text-xs">
                    IN
                  </div>
                  <div>
                    <p className="font-semibold text-xs">Total Inflow Pool</p>
                    <p className="text-[11px] text-emerald-300">Verified Household Credits & Earnings</p>
                  </div>
                </div>
                <div className="text-right font-mono-num font-bold text-sm">
                  {formatCurrency(metrics.totalIncome)} (100%)
                </div>
              </div>

              {/* Connecting Split Lines */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Needs Box */}
                <div className="bg-white p-3.5 rounded-xl border border-sky-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider">
                      Essential Needs (~50%)
                    </span>
                    <span className="text-[10px] font-mono-num bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded font-semibold">
                      {metrics.totalIncome > 0
                        ? `${((metrics.needsSpend / metrics.totalIncome) * 100).toFixed(1)}%`
                        : '0%'}
                    </span>
                  </div>
                  <p className="font-mono-num font-bold text-lg text-stone-900">
                    {formatCurrency(metrics.needsSpend)}
                  </p>
                  <p className="text-[11px] text-stone-500 leading-tight">
                    Food, Transportation, Household, Health
                  </p>
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-500 h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (metrics.needsSpend / (metrics.needsBudget || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-stone-400">Budget: {formatCompactCurrency(metrics.needsBudget)}</span>
                </div>

                {/* Wants Box */}
                <div className="bg-white p-3.5 rounded-xl border border-orange-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-orange-800 uppercase tracking-wider">
                      Lifestyle Wants (~30%)
                    </span>
                    <span className="text-[10px] font-mono-num bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded font-semibold">
                      {metrics.totalIncome > 0
                        ? `${((metrics.wantsSpend / metrics.totalIncome) * 100).toFixed(1)}%`
                        : '0%'}
                    </span>
                  </div>
                  <p className="font-mono-num font-bold text-lg text-stone-900">
                    {formatCurrency(metrics.wantsSpend)}
                  </p>
                  <p className="text-[11px] text-stone-500 leading-tight">
                    Subscriptions, Apparel, Family, Outings
                  </p>
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-orange-500 h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (metrics.wantsSpend / (metrics.wantsBudget || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-stone-400">Budget: {formatCompactCurrency(metrics.wantsBudget)}</span>
                </div>

                {/* Wealth / Savings Box */}
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                      Wealth Assets (~20%)
                    </span>
                    <span className="text-[10px] font-mono-num bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">
                      {metrics.totalIncome > 0
                        ? `${((metrics.savingsSpend / metrics.totalIncome) * 100).toFixed(1)}%`
                        : '0%'}
                    </span>
                  </div>
                  <p className="font-mono-num font-bold text-lg text-emerald-900">
                    {formatCurrency(metrics.savingsSpend)}
                  </p>
                  <p className="text-[11px] text-stone-500 leading-tight">
                    PPF, Mutual Funds, Fixed Deposits
                  </p>
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (metrics.savingsSpend / (metrics.savingsBudget || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-stone-400">Target: {formatCompactCurrency(metrics.savingsBudget)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Daily / Monthly Spending Pulse Timeline & Scrubber */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-stone-900">
                  Spending Pulse Timeline
                </h3>
                <p className="text-xs text-stone-500">
                  Interactive distribution curve across {metrics.dailySpendTimeline.length} intervals
                </p>
              </div>

              {activeTimelineItem && (
                <div className="text-right">
                  <span className="text-[11px] text-stone-400 uppercase font-semibold">
                    {activeTimelineItem.date} Outflow
                  </span>
                  <p className="font-mono-num font-bold text-emerald-700 text-sm">
                    {formatCurrency(activeTimelineItem.amount)}
                  </p>
                </div>
              )}
            </div>

            {/* Interactive Timeline Bar Chart */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
              <div className="h-36 flex items-end gap-1 sm:gap-1.5 pt-6 pb-2">
                {metrics.dailySpendTimeline.map((item, idx) => {
                  const heightPercent = maxSpend > 0 ? Math.min(100, Math.max(8, (item.amount / maxSpend) * 100)) : 8;
                  const isHovered = hoveredDay === idx;

                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredDay(idx)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                    >
                      {/* Tooltip on hover */}
                      {isHovered && (
                        <div className="absolute bottom-full mb-2 bg-stone-900 text-white text-[10px] rounded px-2 py-1 shadow-lg z-20 whitespace-nowrap pointer-events-none font-mono-num">
                          <div><strong>{item.date}:</strong> {formatCurrency(item.amount)}</div>
                          {item.merchants.length > 0 && (
                            <div className="text-stone-400 text-[9px] max-w-[150px] truncate">
                              {item.merchants.join(', ')}
                            </div>
                          )}
                        </div>
                      )}

                      <div
                        className={`w-full rounded-t-sm transition-all duration-200 ${
                          isHovered
                            ? 'bg-emerald-500 scale-y-105'
                            : item.amount > 0
                            ? 'bg-emerald-600/70 hover:bg-emerald-500'
                            : 'bg-stone-200'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Timeline Axis Labels */}
              <div className="flex justify-between text-[10px] text-stone-400 font-mono-num pt-1 border-t border-stone-200">
                <span>{metrics.dailySpendTimeline[0]?.date || 'Start'}</span>
                <span>Interval Outflows</span>
                <span>{metrics.dailySpendTimeline[metrics.dailySpendTimeline.length - 1]?.date || 'End'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Verified Receipts & Top Outflow Destinations */}
        <div className="lg:col-span-4 space-y-6">
          {/* Digital Receipt OCR Vault */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <h3 className="font-display font-bold text-sm text-stone-900">
                  Verified Digital Receipts
                </h3>
              </div>
              <span className="text-[11px] font-mono-num text-emerald-700 bg-emerald-50 font-semibold px-2 py-0.5 rounded">
                {metrics.receiptsCount} Verified
              </span>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              Extracted line-item receipts with verified merchant items, modes, and timestamps.
            </p>

            <div className="space-y-2.5">
              {receiptTransactions.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => tx.receipt && setInspectedReceipt(tx.receipt)}
                  className="flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer group"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-xs text-stone-900 group-hover:text-emerald-800 transition-colors">
                      {tx.merchant}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      {tx.date} • {tx.receipt?.items.length || 1} item • {tx.paymentMethod}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono-num font-bold text-xs text-stone-900">
                      {formatCurrency(tx.amount)}
                    </span>
                    <span className="block text-[10px] text-emerald-600 font-semibold">Inspect →</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveTab('transactions')}
              className="w-full py-2 text-center text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/70 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <span>View All {transactions.length} Transactions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Top Outflow Destinations */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-sm text-stone-900">
              Top Outflow Destinations
            </h3>

            <div className="space-y-2.5">
              {metrics.topMerchants.slice(0, 5).map((m, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-stone-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-600 font-bold text-[10px] flex items-center justify-center font-mono-num">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-stone-800">{m.name}</p>
                      <p className="text-[10px] text-stone-400">{m.category} • {m.count} txs</p>
                    </div>
                  </div>
                  <span className="font-mono-num font-bold text-stone-900">
                    {formatCurrency(m.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
