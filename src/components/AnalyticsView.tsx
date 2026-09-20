import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatCompactCurrency } from '../utils/csvParser';
import {
  TrendingUp,
  BarChart2,
  PieChart,
  CreditCard,
  Building,
  Calendar,
  Layers,
  ArrowUpRight,
  Shield,
  DownloadCloud,
} from 'lucide-react';

interface MonthComparison {
  month: string;
  inflow: number;
  outflow: number;
  transfers: number;
  savingsRate: number;
}

export const AnalyticsView: React.FC = () => {
  const { metrics, transactions } = useFinance();
  const [selectedMetricView, setSelectedMetricView] = useState<'inflow' | 'outflow' | 'transfers'>('outflow');

  // Compute real monthly historical statistics directly from transactions
  const historicalMonths: MonthComparison[] = useMemo(() => {
    const monthlyMap = new Map<string, { inflow: number; outflow: number; transfers: number }>();

    transactions.forEach((t) => {
      const m = t.date.substring(0, 7); // YYYY-MM
      if (!monthlyMap.has(m)) {
        monthlyMap.set(m, { inflow: 0, outflow: 0, transfers: 0 });
      }
      const data = monthlyMap.get(m)!;
      if (t.type === 'income') {
        data.inflow += t.amount;
      } else if (t.type === 'transfer') {
        data.transfers += t.amount;
      } else {
        data.outflow += t.amount;
      }
    });

    const sortedMonths = Array.from(monthlyMap.keys()).sort();

    // Take recent 12 months (or all available)
    const recent = sortedMonths.slice(-12);

    return recent.map((m) => {
      const d = monthlyMap.get(m)!;
      const dObj = new Date(m + '-01T12:00:00');
      const label = dObj.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      const savingsRate = d.inflow > 0 ? Math.max(0, Math.min(100, ((d.transfers + Math.max(0, d.inflow - d.outflow - d.transfers)) / d.inflow) * 100)) : 0;

      return {
        month: label,
        inflow: Math.round(d.inflow),
        outflow: Math.round(d.outflow),
        transfers: Math.round(d.transfers),
        savingsRate: Math.round(savingsRate * 10) / 10,
      };
    });
  }, [transactions]);

  // Compute payment method distribution from current transactions
  const paymentDistribution = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    transactions.forEach((t) => {
      if (t.type === 'expense' || t.type === 'transfer') {
        const mode = t.paymentMethod || 'Cash';
        if (!map[mode]) {
          map[mode] = { total: 0, count: 0 };
        }
        map[mode].total += t.amount;
        map[mode].count += 1;
      }
    });

    const totalExpense = Object.values(map).reduce((acc, v) => acc + v.total, 0) || 1;

    return Object.entries(map)
      .map(([method, data]) => ({
        method,
        total: data.total,
        count: data.count,
        percent: Math.round((data.total / totalExpense) * 100),
      }))
      .sort((a, b) => b.total - a.total);
  }, [transactions]);

  // Compute cumulative spending trajectory
  const cumulativeData = useMemo(() => {
    let runningTotal = 0;
    const timeline = metrics.dailySpendTimeline;
    const totalOutflow = metrics.livingExpenses;
    const count = Math.max(1, timeline.length);
    const intervalTarget = totalOutflow > 0 ? totalOutflow / count : 1000;

    return timeline.map((item, idx) => {
      runningTotal += item.amount;
      const expectedPace = (idx + 1) * intervalTarget;
      return {
        label: item.date,
        actual: runningTotal,
        expected: expectedPace,
      };
    });
  }, [metrics.dailySpendTimeline, metrics.livingExpenses]);

  const maxHistorical = Math.max(
    ...historicalMonths.map((m) => Math.max(m.inflow, m.outflow, m.transfers)),
    10000
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-stone-900 tracking-tight">
            Financial Analytics & Multi-Month Velocity
          </h1>
          <p className="text-xs text-stone-500">
            Real multi-month trend lines, velocity trajectory curves, and payment mechanics from {transactions.length} verified records
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-stone-300 hover:border-stone-400 bg-white text-stone-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <DownloadCloud className="w-3.5 h-3.5" />
          <span>Print / Export Summary</span>
        </button>
      </div>

      {/* Multi-Month Historical Trend Chart */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-base text-stone-900">
              12-Month Multi-Interval Historical Velocity
            </h3>
            <p className="text-xs text-stone-500">
              Comparing earned income inflows, living burn outflows, and asset transfers over time
            </p>
          </div>

          {/* Metric Filter Tabs */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setSelectedMetricView('outflow')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedMetricView === 'outflow'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Living Outflow
            </button>
            <button
              onClick={() => setSelectedMetricView('inflow')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedMetricView === 'inflow'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Income Inflow
            </button>
            <button
              onClick={() => setSelectedMetricView('transfers')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedMetricView === 'transfers'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Asset Transfers
            </button>
          </div>
        </div>

        {/* Custom SVG/Bar Historical Chart */}
        <div className="bg-stone-50 rounded-xl p-5 border border-stone-200/80 space-y-3">
          <div className="h-56 flex items-end justify-between gap-2 pt-6">
            {historicalMonths.map((m, idx) => {
              const val =
                selectedMetricView === 'outflow'
                  ? m.outflow
                  : selectedMetricView === 'inflow'
                  ? m.inflow
                  : m.transfers;

              const heightPercent = maxHistorical > 0 ? Math.min(100, Math.max(10, (val / maxHistorical) * 100)) : 10;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-stone-900 text-white text-[10px] rounded px-2 py-1 shadow-lg pointer-events-none whitespace-nowrap z-20 font-mono-num">
                    <p className="font-bold">{m.month}</p>
                    <p>Inflow: {formatCurrency(m.inflow)}</p>
                    <p>Outflow: {formatCurrency(m.outflow)}</p>
                    <p>Transfers: {formatCurrency(m.transfers)}</p>
                  </div>

                  <span className="text-[10px] font-mono-num text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                    {formatCompactCurrency(val)}
                  </span>

                  <div
                    className={`w-full max-w-[42px] rounded-t-lg transition-all duration-300 ${
                      selectedMetricView === 'inflow'
                        ? 'bg-emerald-500 group-hover:bg-emerald-400'
                        : selectedMetricView === 'transfers'
                        ? 'bg-teal-500 group-hover:bg-teal-400'
                        : 'bg-amber-500 group-hover:bg-amber-400'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />

                  <span className="text-[10px] font-semibold text-stone-600 mt-2 whitespace-nowrap">
                    {m.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Living Outflow</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Income Inflow</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              <span>Asset Transfers</span>
            </span>
          </div>
        </div>
      </div>

      {/* Two-Column Analytics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cumulative Spending Velocity Trajectory */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-display font-bold text-base text-stone-900">
              Cumulative Burn Velocity Trajectory
            </h3>
            <p className="text-xs text-stone-500">
              Actual cumulative outflow pacing vs. linear baseline target
            </p>
          </div>

          <div className="space-y-3">
            {cumulativeData.slice(-6).map((item, idx) => {
              const isOverPace = item.actual > item.expected;
              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between font-mono-num">
                    <span className="font-semibold text-stone-700">{item.label}</span>
                    <span className={isOverPace ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
                      {formatCurrency(item.actual)} / {formatCurrency(item.expected)}
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOverPace ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (item.actual / Math.max(item.expected, 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs text-stone-600 flex items-center justify-between">
            <span>Tracking {cumulativeData.length} timeline intervals</span>
            <span className="font-mono-num font-bold text-stone-900">
              Total: {formatCurrency(metrics.livingExpenses)}
            </span>
          </div>
        </div>

        {/* Payment Instrument Mechanics */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-display font-bold text-base text-stone-900">
              Payment Instrument Mechanics
            </h3>
            <p className="text-xs text-stone-500">
              Distribution of transaction volume across bank accounts, cards, and cash modes
            </p>
          </div>

          <div className="space-y-3">
            {paymentDistribution.map((item, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-stone-400" />
                    <span className="font-semibold text-stone-800">{item.method}</span>
                    <span className="text-[10px] text-stone-400 font-mono-num">({item.count} txs)</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono-num">
                    <span className="font-bold text-stone-900">{formatCurrency(item.total)}</span>
                    <span className="text-stone-400 w-8 text-right font-semibold">{item.percent}%</span>
                  </div>
                </div>

                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-stone-800 h-full rounded-full transition-all duration-300"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs text-stone-500 flex items-center justify-between">
            <span>Primary payment mode:</span>
            <span className="font-semibold text-stone-800">
              {paymentDistribution[0]?.method || 'Cash'} ({paymentDistribution[0]?.percent || 0}% of outflow)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
