import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { BudgetGroup } from '../types';
import { formatCurrency, formatCompactCurrency } from '../utils/csvParser';
import {
  Sliders,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  HelpCircle,
  Home,
  ShoppingBag,
  Car,
  HeartPulse,
  Utensils,
  Film,
  Shirt,
  ShieldCheck,
  Building,
  Layers,
  Repeat,
  Compass,
} from 'lucide-react';

export const CategoriesView: React.FC = () => {
  const { categories, metrics, updateCategoryBudget } = useFinance();

  // "What-If" simulator state for interactive planning
  const [diningCutPercent, setDiningCutPercent] = useState<number>(15);
  const [subscriptionsCutPercent, setSubscriptionsCutPercent] = useState<number>(25);

  // Group categories
  const groups: BudgetGroup[] = ['Needs', 'Wants', 'Savings & Debt'];

  // Calculate annual savings unlocked by what-if simulator from real categories
  const foodSpend = metrics.categorySpendMap['Food'] || 0;
  const subSpend = metrics.categorySpendMap['subscription'] || 0;
  const simulatedDiningSavings = foodSpend * (diningCutPercent / 100);
  const simulatedSubSavings = subSpend * (subscriptionsCutPercent / 100);
  const totalMonthlySimulatedSavings = simulatedDiningSavings + simulatedSubSavings;
  const totalAnnualSimulatedSavings = totalMonthlySimulatedSavings * 12;

  // Icon resolver
  const renderIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'Utensils': return <Utensils className={className} />;
      case 'Car': return <Car className={className} />;
      case 'Home': return <Home className={className} />;
      case 'Building': return <Building className={className} />;
      case 'HeartPulse': return <HeartPulse className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Shirt': return <Shirt className={className} />;
      case 'Film': return <Film className={className} />;
      case 'Compass': return <Compass className={className} />;
      case 'TrendingUp': return <TrendingUp className={className} />;
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      case 'Repeat': return <Repeat className={className} />;
      default: return <Layers className={className} />;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-stone-900 tracking-tight">
            Category Architecture & Budget Health
          </h1>
          <p className="text-xs text-stone-500">
            Real-time tracking for {categories.length} verified household categories based on the 50/30/20 balanced cashflow framework
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-600 bg-white px-3 py-1.5 rounded-xl border border-stone-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Under Budget</span>
          <span className="w-2 h-2 rounded-full bg-amber-500 ml-2" />
          <span>Near Cap (&gt;80%)</span>
          <span className="w-2 h-2 rounded-full bg-rose-500 ml-2" />
          <span>Exceeded</span>
        </div>
      </div>

      {/* 50/30/20 Macro Allocation Banner */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
        <h3 className="font-display font-bold text-sm text-stone-900">
          50 / 30 / 20 Macro Allocation Progress
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Needs */}
          <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-200/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-sky-900">Needs (Target ~50%)</span>
              <span className="font-mono-num font-semibold text-sky-700">
                {formatCompactCurrency(metrics.needsSpend)} / {formatCompactCurrency(metrics.needsBudget)}
              </span>
            </div>
            <div className="w-full bg-sky-200/60 h-2 rounded-full overflow-hidden">
              <div
                className="bg-sky-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (metrics.needsSpend / (metrics.needsBudget || 1)) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-500">
              {metrics.needsSpend <= metrics.needsBudget ? 'Well governed within bounds' : 'Exceeding target envelope'}
            </p>
          </div>

          {/* Wants */}
          <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-200/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-orange-900">Wants (Target ~30%)</span>
              <span className="font-mono-num font-semibold text-orange-700">
                {formatCompactCurrency(metrics.wantsSpend)} / {formatCompactCurrency(metrics.wantsBudget)}
              </span>
            </div>
            <div className="w-full bg-orange-200/60 h-2 rounded-full overflow-hidden">
              <div
                className="bg-orange-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (metrics.wantsSpend / (metrics.wantsBudget || 1)) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-500">
              {metrics.wantsSpend <= metrics.wantsBudget ? 'Within discretionary budget' : 'Lifestyle creep detected'}
            </p>
          </div>

          {/* Savings */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-emerald-900">Savings & Assets (Target ~20%)</span>
              <span className="font-mono-num font-semibold text-emerald-700">
                {formatCompactCurrency(metrics.savingsSpend)} / {formatCompactCurrency(metrics.savingsBudget)}
              </span>
            </div>
            <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (metrics.savingsSpend / (metrics.savingsBudget || 1)) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-emerald-700 font-medium">
              {metrics.savingsRate.toFixed(1)}% effective savings and capital rate
            </p>
          </div>
        </div>
      </div>

      {/* Interactive "What-If" Optimization Simulator */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 border border-stone-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-stone-950 font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Interactive "What-If" Expense Optimization
              </h3>
              <p className="text-xs text-stone-400">
                Simulate trimming discretionary categories and direct the unlocked cashflow into SIP investments
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider block">
              Annual Projected Reinvestment
            </span>
            <span className="font-mono-num font-bold text-xl text-white">
              +{formatCurrency(totalAnnualSimulatedSavings)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Food / Dining Trim Slider */}
          <div className="bg-stone-800/80 rounded-xl p-4 border border-stone-700/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-200">
                Trim Food & Snacks by {diningCutPercent}%
              </span>
              <span className="font-mono-num font-bold text-emerald-400">
                +{formatCurrency(simulatedDiningSavings)} / period
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={diningCutPercent}
              onChange={(e) => setDiningCutPercent(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[11px] text-stone-400">
              Current food spend: {formatCurrency(foodSpend)}. Trimming outside snacks redirects funds into wealth building.
            </p>
          </div>

          {/* Subscriptions Trim Slider */}
          <div className="bg-stone-800/80 rounded-xl p-4 border border-stone-700/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-200">
                Trim Subscriptions & Tech by {subscriptionsCutPercent}%
              </span>
              <span className="font-mono-num font-bold text-indigo-400">
                +{formatCurrency(simulatedSubSavings)} / period
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={subscriptionsCutPercent}
              onChange={(e) => setSubscriptionsCutPercent(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <p className="text-[11px] text-stone-400">
              Current recurring services: {formatCurrency(subSpend)}. Pruning unused plans compound into financial freedom.
            </p>
          </div>
        </div>
      </div>

      {/* Category Envelopes Grouped by Needs, Wants, Savings */}
      <div className="space-y-6">
        {groups.map((group) => {
          const groupCategories = categories.filter((c) => c.group === group);
          if (groupCategories.length === 0) return null;

          return (
            <div key={group} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-base text-stone-900 flex items-center gap-2">
                  <span>{group}</span>
                  <span className="text-xs font-normal text-stone-500">
                    ({groupCategories.length} categories)
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupCategories.map((cat) => {
                  const spend = metrics.categorySpendMap[cat.id] || 0;
                  const budget = cat.budgetAmount || 1;
                  const percent = Math.min(150, Math.round((spend / budget) * 100));

                  const isExceeded = spend > budget && budget > 0;
                  const isWarning = percent >= 80 && !isExceeded;

                  return (
                    <div
                      key={cat.id}
                      className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs hover:shadow-sm transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                          >
                            {renderIcon(cat.icon, 'w-4 h-4')}
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-stone-900 line-clamp-1">{cat.name}</p>
                            <span className="text-[10px] text-stone-400 font-mono-num">
                              {spend > 0 ? `${formatCurrency(spend)} spent` : 'No spend in period'}
                            </span>
                          </div>
                        </div>

                        {budget > 0 && (
                          <span
                            className={`text-[10px] font-mono-num font-bold px-1.5 py-0.5 rounded ${
                              isExceeded
                                ? 'bg-rose-100 text-rose-800'
                                : isWarning
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {percent}%
                          </span>
                        )}
                      </div>

                      {/* Progress bar */}
                      {budget > 0 && (
                        <div className="space-y-1">
                          <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, percent)}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono-num">
                            <span>{formatCompactCurrency(spend)}</span>
                            <span>Target: {formatCompactCurrency(budget)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
