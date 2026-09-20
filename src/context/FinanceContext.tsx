import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Transaction, CategoryBudget, ActiveTab, ReceiptData } from '../types';
import { INITIAL_CATEGORIES, INITIAL_TRANSACTIONS } from '../data/initialData';
import { fetchTransactionsFromCsv } from '../utils/csvParser';

interface FinanceContextType {
  transactions: Transaction[];
  categories: CategoryBudget[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedMonth: string; // e.g. 'all', '2018', '2018-09'
  setSelectedMonth: (month: string) => void;
  inspectedReceipt: ReceiptData | null;
  setInspectedReceipt: (receipt: ReceiptData | null) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  isExportImportOpen: boolean;
  setIsExportImportOpen: (open: boolean) => void;
  availablePeriods: { value: string; label: string; count: number }[];

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  updateCategoryBudget: (categoryId: string, amount: number) => void;
  resetToDefaults: () => void;
  importData: (transactions: Transaction[], categories?: CategoryBudget[]) => void;

  // Computed Story & Analytics Metrics
  metrics: {
    totalIncome: number;
    totalExpense: number;
    livingExpenses: number;
    savingsTransferred: number;
    netCashSurplus: number;
    savingsRate: number;
    needsSpend: number;
    wantsSpend: number;
    savingsSpend: number;
    needsBudget: number;
    wantsBudget: number;
    savingsBudget: number;
    subscriptionMonthlyTotal: number;
    subscriptionCount: number;
    receiptsCount: number;
    totalItemsScanned: number;
    topMerchants: { name: string; total: number; count: number; category: string }[];
    categorySpendMap: Record<string, number>;
    weekendSpend: number;
    weekdaySpend: number;
    weekendPercentage: number;
    weekdayPercentage: number;
    foodDiningSpend: number;
    foodGroceriesSpend: number;
    diningToGroceriesRatio: number;
    dailySpendTimeline: { day: number; date: string; amount: number; merchants: string[] }[];
    inflowCount: number;
  };
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEY_TX = 'receiptflow_csv_tx_v2';
const STORAGE_KEY_CAT = 'receiptflow_csv_cat_v2';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Clean up any old mock data from previous versions
  useEffect(() => {
    try {
      localStorage.removeItem('receiptflow_transactions_v1');
      localStorage.removeItem('receiptflow_categories_v1');
    } catch {
      // ignore
    }
  }, []);

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TX);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 500) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_TRANSACTIONS;
  });

  const [categories, setCategories] = useState<CategoryBudget[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CAT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 40) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_CATEGORIES;
  });

  // Verify and fetch directly from public/data/Daily Household Transactions.csv on mount
  useEffect(() => {
    fetchTransactionsFromCsv().then((csvTxs) => {
      if (csvTxs && csvTxs.length > 0) {
        setTransactions(csvTxs);
      }
    });
  }, []);

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [inspectedReceipt, setInspectedReceipt] = useState<ReceiptData | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(transactions));
    } catch {
      // ignore
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CAT, JSON.stringify(categories));
    } catch {
      // ignore
    }
  }, [categories]);

  // Actions
  const addTransaction = (txData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const updateTransaction = (updated: Transaction) => {
    setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const updateCategoryBudget = (categoryId: string, amount: number) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === categoryId ? { ...cat, budgetAmount: Math.max(0, amount) } : cat))
    );
  };

  const resetToDefaults = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setCategories(INITIAL_CATEGORIES);
    localStorage.removeItem(STORAGE_KEY_TX);
    localStorage.removeItem(STORAGE_KEY_CAT);
  };

  const importData = (importedTxs: Transaction[], importedCats?: CategoryBudget[]) => {
    if (importedTxs && Array.isArray(importedTxs)) {
      setTransactions(importedTxs);
    }
    if (importedCats && Array.isArray(importedCats)) {
      setCategories(importedCats);
    }
  };

  // Available periods calculated from real transactions
  const availablePeriods = useMemo(() => {
    const periodMap = new Map<string, number>();
    transactions.forEach((t) => {
      const month = t.date.substring(0, 7); // YYYY-MM
      periodMap.set(month, (periodMap.get(month) || 0) + 1);
    });

    const sortedMonths = Array.from(periodMap.keys()).sort().reverse();

    const periods = [
      { value: 'all', label: `All Records (${transactions.length} txs • 2015–2018)`, count: transactions.length },
      {
        value: '2018',
        label: `Year 2018 (${transactions.filter((t) => t.date.startsWith('2018')).length} txs)`,
        count: transactions.filter((t) => t.date.startsWith('2018')).length,
      },
      {
        value: '2017',
        label: `Year 2017 (${transactions.filter((t) => t.date.startsWith('2017')).length} txs)`,
        count: transactions.filter((t) => t.date.startsWith('2017')).length,
      },
      {
        value: '2016',
        label: `Year 2016 (${transactions.filter((t) => t.date.startsWith('2016')).length} txs)`,
        count: transactions.filter((t) => t.date.startsWith('2016')).length,
      },
      {
        value: '2015',
        label: `Year 2015 (${transactions.filter((t) => t.date.startsWith('2015')).length} txs)`,
        count: transactions.filter((t) => t.date.startsWith('2015')).length,
      },
    ];

    // Add recent individual months
    sortedMonths.slice(0, 12).forEach((m) => {
      const d = new Date(m + '-01T12:00:00');
      const monthName = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      const count = periodMap.get(m) || 0;
      periods.push({
        value: m,
        label: `${monthName} (${count} txs)`,
        count,
      });
    });

    return periods;
  }, [transactions]);

  // Filter transactions based on selected period
  const filteredTxs = useMemo(() => {
    if (selectedMonth === 'all') return transactions;
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Compute rich metrics
  const metrics = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let needsSpend = 0;
    let wantsSpend = 0;
    let savingsSpend = 0;
    let weekendSpend = 0;
    let weekdaySpend = 0;
    let foodDiningSpend = 0;
    let foodGroceriesSpend = 0;
    let receiptsCount = 0;
    let totalItemsScanned = 0;
    let inflowCount = 0;

    const categorySpendMap: Record<string, number> = {};
    const merchantMap: Record<string, { total: number; count: number; category: string }> = {};

    categories.forEach((c) => {
      categorySpendMap[c.id] = 0;
    });

    const DINING_TERMS = ['snack', 'snacks', 'lunch', 'breakfast', 'dinner', 'restaurant', 'cafe', 'bhel', 'puri', 'kachori', 'tea', 'coffee'];
    const GROCERY_TERMS = ['grocery', 'kirana', 'milk', 'atta', 'bread', 'butter', 'vegetable', 'fruit'];

    filteredTxs.forEach((tx) => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
        inflowCount += 1;
        return;
      }

      if (tx.type === 'transfer') {
        savingsSpend += tx.amount;
        return;
      }

      // Expense
      totalExpense += tx.amount;

      // Group classification
      const categoryObj = categories.find((c) => c.id === tx.category);
      const group = categoryObj?.group || 'Wants';

      if (group === 'Needs') {
        needsSpend += tx.amount;
      } else if (group === 'Wants') {
        wantsSpend += tx.amount;
      } else if (group === 'Savings & Debt') {
        savingsSpend += tx.amount;
      }

      // Category spend
      categorySpendMap[tx.category] = (categorySpendMap[tx.category] || 0) + tx.amount;

      // Merchant tracking
      if (!merchantMap[tx.merchant]) {
        merchantMap[tx.merchant] = { total: 0, count: 0, category: tx.category };
      }
      merchantMap[tx.merchant].total += tx.amount;
      merchantMap[tx.merchant].count += 1;

      // Weekend vs Weekday analysis
      const d = new Date(tx.date + 'T12:00:00');
      const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendSpend += tx.amount;
      } else {
        weekdaySpend += tx.amount;
      }

      // Food comparison (Dining vs Groceries)
      const sub = (tx.subcategory || '').toLowerCase();
      const note = (tx.notes || '').toLowerCase();
      const isFood = tx.category.toLowerCase() === 'food';

      if (isFood) {
        const isDining = DINING_TERMS.some((t) => sub.includes(t) || note.includes(t));
        const isGrocery = GROCERY_TERMS.some((t) => sub.includes(t) || note.includes(t));

        if (isDining) {
          foodDiningSpend += tx.amount;
        } else if (isGrocery) {
          foodGroceriesSpend += tx.amount;
        } else {
          // Default split
          foodGroceriesSpend += tx.amount * 0.6;
          foodDiningSpend += tx.amount * 0.4;
        }
      }

      // Receipt tracking
      if (tx.receipt) {
        receiptsCount += 1;
        totalItemsScanned += tx.receipt.items?.length || 1;
      }
    });

    // Subscriptions
    const subscriptions = filteredTxs.filter((t) => t.isSubscription && t.type === 'expense');
    const subscriptionMonthlyTotal = subscriptions.reduce((sum, t) => sum + t.amount, 0);
    const subscriptionCount = subscriptions.length;

    // Scale budget if looking at whole year or all-time
    let multiplier = 1;
    if (selectedMonth === 'all') {
      multiplier = 45; // 45 months total
    } else if (selectedMonth.length === 4) {
      multiplier = 12; // 12 months in a year
    }

    const needsBudget =
      categories.filter((c) => c.group === 'Needs').reduce((acc, c) => acc + c.budgetAmount, 0) * multiplier;
    const wantsBudget =
      categories.filter((c) => c.group === 'Wants').reduce((acc, c) => acc + c.budgetAmount, 0) * multiplier;
    const savingsBudget =
      categories.filter((c) => c.group === 'Savings & Debt').reduce((acc, c) => acc + c.budgetAmount, 0) * multiplier;

    const livingExpenses = needsSpend + wantsSpend;
    const savingsTransferred = savingsSpend;
    const netCashSurplus = totalIncome - (livingExpenses + savingsTransferred);
    const savingsRate =
      totalIncome > 0 ? Math.max(0, ((savingsTransferred + Math.max(0, netCashSurplus)) / totalIncome) * 100) : 0;

    const totalTrackedSpend = weekendSpend + weekdaySpend;
    const weekendPercentage = totalTrackedSpend > 0 ? Math.round((weekendSpend / totalTrackedSpend) * 100) : 0;
    const weekdayPercentage = 100 - weekendPercentage;

    const totalFood = foodDiningSpend + foodGroceriesSpend;
    const diningToGroceriesRatio = totalFood > 0 ? Math.round((foodDiningSpend / totalFood) * 100) : 40;

    // Top merchants
    const topMerchants = Object.entries(merchantMap)
      .map(([name, data]) => ({
        name,
        total: Math.round(data.total * 100) / 100,
        count: data.count,
        category: data.category,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);

    // Spend timeline (Days 1..31 if single month selected, or Months 1..12 if year/all selected)
    const isSingleMonth = selectedMonth.length === 7;
    const dailySpendTimeline: { day: number; date: string; amount: number; merchants: string[] }[] = [];

    if (isSingleMonth) {
      const dailyMap: Record<number, { amount: number; merchants: string[] }> = {};
      for (let i = 1; i <= 31; i++) {
        dailyMap[i] = { amount: 0, merchants: [] };
      }
      filteredTxs.forEach((tx) => {
        if (tx.type === 'expense') {
          const dayNum = parseInt(tx.date.split('-')[2], 10);
          if (dailyMap[dayNum]) {
            dailyMap[dayNum].amount += tx.amount;
            if (!dailyMap[dayNum].merchants.includes(tx.merchant) && dailyMap[dayNum].merchants.length < 3) {
              dailyMap[dayNum].merchants.push(tx.merchant);
            }
          }
        }
      });
      for (let i = 1; i <= 31; i++) {
        dailySpendTimeline.push({
          day: i,
          date: `Day ${i}`,
          amount: Math.round(dailyMap[i].amount * 100) / 100,
          merchants: dailyMap[i].merchants,
        });
      }
    } else {
      // Group by month
      const monthMap: Record<string, { amount: number; merchants: string[] }> = {};
      filteredTxs.forEach((tx) => {
        if (tx.type === 'expense') {
          const m = tx.date.substring(0, 7);
          if (!monthMap[m]) monthMap[m] = { amount: 0, merchants: [] };
          monthMap[m].amount += tx.amount;
          if (!monthMap[m].merchants.includes(tx.merchant) && monthMap[m].merchants.length < 3) {
            monthMap[m].merchants.push(tx.merchant);
          }
        }
      });
      const sortedM = Object.keys(monthMap).sort();
      sortedM.forEach((m, idx) => {
        dailySpendTimeline.push({
          day: idx + 1,
          date: m,
          amount: Math.round(monthMap[m].amount * 100) / 100,
          merchants: monthMap[m].merchants,
        });
      });
    }

    return {
      totalIncome,
      totalExpense,
      livingExpenses,
      savingsTransferred,
      netCashSurplus,
      savingsRate,
      needsSpend,
      wantsSpend,
      savingsSpend,
      needsBudget,
      wantsBudget,
      savingsBudget,
      subscriptionMonthlyTotal,
      subscriptionCount,
      receiptsCount,
      totalItemsScanned,
      topMerchants,
      categorySpendMap,
      weekendSpend,
      weekdaySpend,
      weekendPercentage,
      weekdayPercentage,
      foodDiningSpend,
      foodGroceriesSpend,
      diningToGroceriesRatio,
      dailySpendTimeline,
      inflowCount,
    };
  }, [filteredTxs, categories, selectedMonth]);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        activeTab,
        setActiveTab,
        selectedMonth,
        setSelectedMonth,
        inspectedReceipt,
        setInspectedReceipt,
        isAddModalOpen,
        setIsAddModalOpen,
        isExportImportOpen,
        setIsExportImportOpen,
        availablePeriods,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        updateCategoryBudget,
        resetToDefaults,
        importData,
        metrics,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
