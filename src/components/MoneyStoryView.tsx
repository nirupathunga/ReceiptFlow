import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatCompactCurrency } from '../utils/csvParser';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Sparkles,
  Share2,
  Trophy,
  Coffee,
  ShoppingBag,
  Repeat,
  Compass,
  CheckCircle,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StorySlide {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
}

export const MoneyStoryView: React.FC = () => {
  const { metrics, transactions, selectedMonth, setActiveTab } = useFinance();
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const chapters: StorySlide[] = [
    {
      id: 'momentum',
      tag: 'Chapter 1: Cash Momentum',
      title: 'Your Cash Velocity & Surplus',
      subtitle: 'How much capital was retained in your personal ecosystem',
    },
    {
      id: 'merchants',
      tag: 'Chapter 2: Gravitational Pull',
      title: 'Your Primary Merchants & Outflow',
      subtitle: 'Where your discretionary & household funds flowed most intensely',
    },
    {
      id: 'food',
      tag: 'Chapter 3: The Culinary Economy',
      title: 'Dining Out vs. Home Grocery Pantry',
      subtitle: 'Balancing convenience, snacks, meals, and home provisions',
    },
    {
      id: 'subscriptions',
      tag: 'Chapter 4: Recurring Services',
      title: 'Active Subscriptions & Utilities',
      subtitle: 'Recurring digital, mobile, and broadband subscriptions',
    },
    {
      id: 'weekends',
      tag: 'Chapter 5: Temporal Rhythm',
      title: 'Weekend Splurge vs. Weekday Outflow',
      subtitle: 'How your spending velocity shifts across weekdays and weekends',
    },
    {
      id: 'horizon',
      tag: 'Chapter 6: Asset Accumulation',
      title: 'Wealth Horizon & Portfolio Growth',
      subtitle: 'Tracking PPF, mutual funds, and long-term liquidity reserves',
    },
  ];

  // Auto play stepper
  useEffect(() => {
    let timer: any;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        setCurrentChapter((prev) => {
          if (prev < chapters.length - 1) return prev + 1;
          setIsAutoPlaying(false);
          return prev;
        });
      }, 6500);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying, chapters.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentChapter((prev) => Math.min(chapters.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentChapter((prev) => Math.max(0, prev - 1));
      } else if (e.key === ' ') {
        setIsAutoPlaying((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chapters.length]);

  const triggerCelebration = () => {
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#065f46', '#34d399', '#f59e0b', '#6366f1'],
    });
  };

  const handleShareStory = () => {
    triggerCelebration();
    const periodLabel = selectedMonth === 'all' ? 'All-Time' : selectedMonth;
    const summaryText = `📊 My ${periodLabel} Financial Story on ReceiptFlow:\n✨ Net Surplus: ${formatCurrency(
      metrics.netCashSurplus
    )}\n💰 Savings & Transfer Rate: ${metrics.savingsRate.toFixed(1)}%\n📍 Top Outflow: ${
      metrics.topMerchants[0]?.name || 'N/A'
    } (${formatCurrency(metrics.topMerchants[0]?.total || 0)})\n🚀 Assets Transferred: ${formatCurrency(metrics.savingsTransferred)}`;

    navigator.clipboard?.writeText(summaryText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const topMerchant = metrics.topMerchants[0] || { name: 'Household Provision', total: 0, count: 0 };
  const subscriptions = transactions.filter((t) => t.isSubscription).slice(0, 6);

  const periodTitle = selectedMonth === 'all' ? 'Multi-Year Journey' : `${selectedMonth} Narrative`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Story Stage Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <h1 className="font-display font-bold text-2xl text-stone-900 tracking-tight">Money Story</h1>
          </div>
          <p className="text-xs text-stone-500">
            A narrative journey through verified household transactions & financial habits
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoPlaying((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              isAutoPlaying
                ? 'bg-emerald-500 text-stone-950 border-emerald-400'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoPlaying ? 'Pause' : 'Autoplay'}</span>
          </button>

          <button
            onClick={handleShareStory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-all cursor-pointer shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{copiedShare ? 'Copied to Clipboard!' : 'Share Story Card'}</span>
          </button>
        </div>
      </div>

      {/* Main Story Container / Theater Deck */}
      <div className="bg-stone-900 text-white rounded-3xl border border-stone-800 shadow-2xl overflow-hidden relative flex flex-col min-h-[540px] justify-between">
        {/* Radial ambient background lighting */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-emerald-600/15 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-600/10 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Top Progress Segment Bars */}
        <div className="relative z-10 p-6 pb-2">
          <div className="flex gap-1.5 w-full">
            {chapters.map((chap, idx) => (
              <button
                key={chap.id}
                onClick={() => setCurrentChapter(idx)}
                className="flex-1 h-1.5 rounded-full overflow-hidden bg-stone-800 transition-all cursor-pointer"
                title={chap.title}
              >
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    idx < currentChapter
                      ? 'bg-emerald-400'
                      : idx === currentChapter
                      ? 'bg-white'
                      : 'bg-transparent'
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-400 pt-3">
            <span className="font-semibold uppercase tracking-wider text-emerald-400">
              {chapters[currentChapter].tag} • {periodTitle}
            </span>
            <span>
              {currentChapter + 1} of {chapters.length} • Use ← → keys
            </span>
          </div>
        </div>

        {/* Chapter Slide Content Body */}
        <div className="relative z-10 px-6 sm:px-10 py-6 flex-1 flex flex-col justify-center">
          {/* CHAPTER 1: Cash Momentum */}
          {currentChapter === 0 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="space-y-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-block">
                  Cashflow Velocity
                </span>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
                  You retained{' '}
                  <span className="text-emerald-400 font-mono-num">
                    {formatCurrency(metrics.savingsTransferred + Math.max(0, metrics.netCashSurplus))}
                  </span>{' '}
                  in assets & surplus.
                </h2>
                <p className="text-sm text-stone-300 max-w-xl leading-relaxed">
                  Total inflow reached <strong className="text-white font-mono-num">{formatCurrency(metrics.totalIncome)}</strong>{' '}
                  against living burn of <strong className="text-white font-mono-num">{formatCurrency(metrics.livingExpenses)}</strong>. That yields
                  an overall retained savings & asset transfer rate of{' '}
                  <strong className="text-emerald-400 font-mono-num">{metrics.savingsRate.toFixed(1)}%</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-stone-800/80 rounded-2xl p-4 border border-stone-700/80">
                  <p className="text-[11px] text-stone-400 uppercase font-semibold">Total Inflow</p>
                  <p className="font-mono-num font-bold text-xl text-white mt-1">
                    {formatCurrency(metrics.totalIncome)}
                  </p>
                  <p className="text-[11px] text-emerald-400 mt-0.5">{metrics.inflowCount} verified income credits</p>
                </div>

                <div className="bg-stone-800/80 rounded-2xl p-4 border border-stone-700/80">
                  <p className="text-[11px] text-stone-400 uppercase font-semibold">Living Outflow</p>
                  <p className="font-mono-num font-bold text-xl text-stone-200 mt-1">
                    {formatCurrency(metrics.livingExpenses)}
                  </p>
                  <p className="text-[11px] text-amber-400 mt-0.5">
                    Needs: {formatCompactCurrency(metrics.needsSpend)} • Wants: {formatCompactCurrency(metrics.wantsSpend)}
                  </p>
                </div>

                <div className="bg-stone-800/80 rounded-2xl p-4 border border-emerald-500/40 bg-emerald-950/20">
                  <p className="text-[11px] text-emerald-300 uppercase font-semibold">Retained Rate</p>
                  <p className="font-mono-num font-bold text-xl text-emerald-400 mt-1">
                    {metrics.savingsRate.toFixed(1)}%
                  </p>
                  <p className="text-[11px] text-emerald-300/80 mt-0.5">
                    Assets & transfers: {formatCompactCurrency(metrics.savingsTransferred)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 2: Gravitational Pull */}
          {currentChapter === 1 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="space-y-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-block">
                  Outflow Gravitational Pull
                </span>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
                  Your #1 destination:{' '}
                  <span className="text-amber-400">{topMerchant.name}</span>
                </h2>
                <p className="text-sm text-stone-300 max-w-xl leading-relaxed">
                  Recorded {topMerchant.count} transactions in this timeframe, representing an outflow of{' '}
                  <strong className="text-white font-mono-num">{formatCurrency(topMerchant.total)}</strong>.
                </p>
              </div>

              {/* Leaderboard */}
              <div className="space-y-2.5 max-w-xl pt-2">
                <p className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider">
                  Top Outflow Centers
                </p>
                {metrics.topMerchants.slice(0, 4).map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-stone-800/80 border border-stone-700/80 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-stone-700 text-stone-300 font-bold text-[10px] flex items-center justify-center font-mono-num">
                        #{idx + 1}
                      </span>
                      <div>
                        <span className="font-semibold text-white">{m.name}</span>
                        <span className="text-[10px] text-stone-400 ml-2">({m.category})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 font-mono-num">
                      <span className="text-stone-400">{m.count} txs</span>
                      <span className="font-bold text-amber-400">{formatCurrency(m.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHAPTER 3: Culinary Split */}
          {currentChapter === 2 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="space-y-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30 inline-block">
                  Culinary Economy
                </span>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
                  Dining & Snacks accounted for{' '}
                  <span className="text-orange-400 font-mono-num">{metrics.diningToGroceriesRatio}%</span>{' '}
                  of food spend.
                </h2>
                <p className="text-sm text-stone-300 max-w-xl leading-relaxed">
                  You spent <strong className="text-white font-mono-num">{formatCurrency(metrics.foodDiningSpend)}</strong> on
                  dining, lunches & snacks vs.{' '}
                  <strong className="text-white font-mono-num">{formatCurrency(metrics.foodGroceriesSpend)}</strong> on staples & grocery provisions.
                </p>
              </div>

              {/* Visual Split Ratio Bar */}
              <div className="space-y-3 pt-2 max-w-xl">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <ShoppingBag className="w-4 h-4" />
                    <span>Pantry & Milk: {formatCurrency(metrics.foodGroceriesSpend)} ({100 - metrics.diningToGroceriesRatio}%)</span>
                  </div>
                  <div className="flex items-center gap-2 text-orange-400">
                    <Coffee className="w-4 h-4" />
                    <span>Snacks & Meals: {formatCurrency(metrics.foodDiningSpend)} ({metrics.diningToGroceriesRatio}%)</span>
                  </div>
                </div>

                <div className="w-full h-4 rounded-full bg-stone-800 flex overflow-hidden p-0.5">
                  <div
                    className="bg-emerald-500 h-full rounded-l-full transition-all duration-500"
                    style={{ width: `${100 - metrics.diningToGroceriesRatio}%` }}
                  />
                  <div
                    className="bg-orange-500 h-full rounded-r-full transition-all duration-500"
                    style={{ width: `${metrics.diningToGroceriesRatio}%` }}
                  />
                </div>

                <div className="bg-stone-800/80 rounded-xl p-3.5 border border-stone-700 text-xs text-stone-300 flex items-start gap-2.5">
                  <Compass className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Pantry Observation:</strong> Frequent daily micro-purchases (fresh dairy, morning snacks, and transit bites) represent the majority of routine food frequency. Consolidating pantry staples into weekly runs offers immediate cash efficiency.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 4: Recurring Services */}
          {currentChapter === 3 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="space-y-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 inline-block">
                  Recurring Services
                </span>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
                  <span className="text-indigo-400 font-mono-num">{metrics.subscriptionCount} recurring services</span>{' '}
                  totaling <span className="font-mono-num text-white">{formatCurrency(metrics.subscriptionMonthlyTotal)}</span>
                </h2>
                <p className="text-sm text-stone-300 max-w-xl leading-relaxed">
                  Regular bills for streaming (Netflix), telecom booster packs, and entertainment subscriptions tracked across verified entries.
                </p>
              </div>

              {/* Subscriptions Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 max-w-2xl">
                {subscriptions.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/80 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white truncate pr-1">{s.merchant}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono-num">
                      <span className="text-stone-400">{s.subcategory || 'Service'}</span>
                      <span className="font-bold text-indigo-300">{formatCurrency(s.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-indigo-950/40 rounded-xl p-3 border border-indigo-500/30 text-xs text-indigo-200 flex items-center justify-between max-w-2xl">
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-indigo-400" />
                  <span>Audit subscriptions periodically to ensure active utility and value.</span>
                </div>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Inspect in Ledger
                </button>
              </div>
            </div>
          )}

          {/* CHAPTER 5: Weekend Splurge */}
          {currentChapter === 4 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="space-y-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 inline-block">
                  Temporal Rhythms
                </span>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
                  Weekends generated{' '}
                  <span className="text-rose-400 font-mono-num">{metrics.weekendPercentage}%</span> of tracked
                  outflows.
                </h2>
                <p className="text-sm text-stone-300 max-w-xl leading-relaxed">
                  Analyzing Saturday & Sunday expenditure versus Monday–Friday baseload across transit, food, and family allocations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 max-w-xl">
                <div className="bg-stone-800/80 rounded-2xl p-5 border border-stone-700 space-y-1">
                  <div className="flex items-center gap-2 text-stone-400 text-xs uppercase font-semibold">
                    <Flame className="w-4 h-4 text-rose-400" />
                    <span>Weekend Outflow</span>
                  </div>
                  <p className="font-mono-num font-bold text-2xl text-rose-400">
                    {formatCurrency(metrics.weekendSpend)}
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Discretionary & family weekend spending
                  </p>
                </div>

                <div className="bg-stone-800/80 rounded-2xl p-5 border border-stone-700 space-y-1">
                  <div className="flex items-center gap-2 text-stone-400 text-xs uppercase font-semibold">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Weekday Outflow</span>
                  </div>
                  <p className="font-mono-num font-bold text-2xl text-white">
                    {formatCurrency(metrics.weekdaySpend)}
                  </p>
                  <p className="text-[11px] text-stone-400">Transit commute, daily groceries & work routines</p>
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 6: Horizon & Goals */}
          {currentChapter === 5 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="space-y-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-block">
                  Asset Horizon
                </span>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
                  Accumulated{' '}
                  <span className="text-emerald-400 font-mono-num">
                    {formatCurrency(metrics.savingsTransferred)}
                  </span>{' '}
                  in wealth assets.
                </h2>
                <p className="text-sm text-stone-300 max-w-xl leading-relaxed">
                  Regular deposits into Public Provident Fund (PPF), Mutual Fund equity plans, and fixed bank reserves provide strong capital foundations.
                </p>
              </div>

              <div className="bg-emerald-950/30 rounded-2xl p-5 border border-emerald-500/40 space-y-4 max-w-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-stone-950 flex items-center justify-center font-bold">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Asset Deployment Portfolio</h4>
                    <p className="text-xs text-emerald-300">PPF, Fixed Deposits & Mutual Funds Active</p>
                  </div>
                </div>

                <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(15, metrics.savingsRate))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-stone-400 font-mono-num">
                  <span>Transfers: {formatCompactCurrency(metrics.savingsTransferred)}</span>
                  <span className="text-emerald-400 font-semibold">{metrics.savingsRate.toFixed(1)}% Efficiency</span>
                  <span>Inflow: {formatCompactCurrency(metrics.totalIncome)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleShareStory}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-stone-950 font-bold text-xs shadow-lg shadow-emerald-950/50 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Story Card</span>
                </button>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Step Navigation Bar */}
        <div className="relative z-10 px-6 py-4 border-t border-stone-800/80 bg-stone-950/60 flex items-center justify-between">
          <button
            onClick={() => setCurrentChapter((prev) => Math.max(0, prev - 1))}
            disabled={currentChapter === 0}
            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentChapter === 0
                ? 'text-stone-600 cursor-not-allowed'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5">
            {chapters.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentChapter ? 'w-6 bg-emerald-400' : 'bg-stone-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (currentChapter < chapters.length - 1) {
                setCurrentChapter((prev) => prev + 1);
              } else {
                triggerCelebration();
              }
            }}
            className="flex items-center gap-1 text-xs font-semibold px-4 py-1.5 rounded-lg bg-emerald-500 text-stone-950 hover:bg-emerald-400 transition-all cursor-pointer font-bold"
          >
            <span>{currentChapter < chapters.length - 1 ? 'Next Chapter' : 'Finish Story'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
