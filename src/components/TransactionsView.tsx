import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/csvParser';
import {
  Search,
  Receipt,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const ITEMS_PER_PAGE = 50;

export const TransactionsView: React.FC = () => {
  const {
    transactions,
    categories,
    deleteTransaction,
    setInspectedReceipt,
    setIsAddModalOpen,
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income' | 'transfer'>('all');
  const [selectedPayment, setSelectedPayment] = useState('all');
  const [onlyWithReceipts, setOnlyWithReceipts] = useState(false);
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Available unique payment methods from actual data
  const availablePaymentMethods = useMemo(() => {
    const methods = new Set<string>();
    transactions.forEach((t) => {
      if (t.paymentMethod) methods.add(t.paymentMethod);
    });
    return Array.from(methods).sort();
  }, [transactions]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        if (selectedType !== 'all' && t.type !== selectedType) return false;
        if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
        if (selectedPayment !== 'all' && t.paymentMethod !== selectedPayment) return false;
        if (onlyWithReceipts && !t.receipt) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchMerchant = t.merchant.toLowerCase().includes(q);
          const matchCategory = t.category.toLowerCase().includes(q);
          const matchNotes = t.notes?.toLowerCase().includes(q);
          const matchTags = t.tags.some((tag) => tag.toLowerCase().includes(q));
          const matchItems = t.receipt?.items.some((item) => item.name.toLowerCase().includes(q));
          if (!matchMerchant && !matchCategory && !matchNotes && !matchTags && !matchItems) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
          return sortAsc ? -diff : diff;
        } else {
          const diff = b.amount - a.amount;
          return sortAsc ? -diff : diff;
        }
      });
  }, [
    transactions,
    searchQuery,
    selectedCategory,
    selectedType,
    selectedPayment,
    onlyWithReceipts,
    sortField,
    sortAsc,
  ]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedType, selectedPayment, onlyWithReceipts]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE));
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const totalFilteredSum = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, t) => acc + (t.type === 'expense' ? -t.amount : t.type === 'income' ? t.amount : -t.amount),
      0
    );
  }, [filteredTransactions]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    categories.forEach((c) => map.set(c.id, { name: c.name, color: c.color }));
    return map;
  }, [categories]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-stone-900 tracking-tight">
            Transaction Ledger & Receipts
          </h1>
          <p className="text-xs text-stone-500">
            Searchable log of all {transactions.length} verified household entries from Daily Household Transactions.csv
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Entry</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search box */}
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search merchant, notes, item, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="expense">Outflow (Expense)</option>
              <option value="income">Inflow (Income)</option>
              <option value="transfer">Asset Transfer (Savings/Deposits)</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">All Payment Methods</option>
              {availablePaymentMethods.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Filter Badges & Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 cursor-pointer text-stone-700 font-medium">
              <input
                type="checkbox"
                checked={onlyWithReceipts}
                onChange={(e) => setOnlyWithReceipts(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
              />
              <span className="flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                <span>Only entries with verified digital receipts</span>
              </span>
            </label>
          </div>

          {/* Ledger stats count */}
          <div className="flex items-center gap-3 text-stone-500 font-mono-num text-[11px]">
            <span>
              Showing {filteredTransactions.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}–
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length} records
            </span>
            <span>•</span>
            <span>
              Net Sum:{' '}
              <strong className={totalFilteredSum >= 0 ? 'text-emerald-700' : 'text-stone-900'}>
                {formatCurrency(totalFilteredSum)}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <th
                  onClick={() => {
                    if (sortField === 'date') setSortAsc(!sortAsc);
                    else {
                      setSortField('date');
                      setSortAsc(false);
                    }
                  }}
                  className="py-3 px-4 cursor-pointer hover:text-stone-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    {sortField === 'date' && (sortAsc ? ' ↑' : ' ↓')}
                  </div>
                </th>
                <th className="py-3 px-4">Merchant / Note</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4 text-center">Receipt</th>
                <th
                  onClick={() => {
                    if (sortField === 'amount') setSortAsc(!sortAsc);
                    else {
                      setSortField('amount');
                      setSortAsc(false);
                    }
                  }}
                  className="py-3 px-4 text-right cursor-pointer hover:text-stone-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Amount</span>
                    {sortField === 'amount' && (sortAsc ? ' ↑' : ' ↓')}
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-sans">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    No transactions match your active filters or search query.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => {
                  const catInfo = categoryMap.get(tx.category);
                  const isExpense = tx.type === 'expense';
                  const isIncome = tx.type === 'income';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-stone-50/80 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3 px-4 font-mono-num text-stone-600 whitespace-nowrap">
                        {tx.date}
                      </td>

                      {/* Merchant & Notes */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-stone-900">{tx.merchant}</span>
                          {tx.notes && (
                            <span className="text-[11px] text-stone-500 line-clamp-1">{tx.notes}</span>
                          )}
                          {tx.tags && tx.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {tx.tags.slice(0, 2).map((t, idx) => (
                                <span
                                  key={idx}
                                  className="text-[9px] px-1.5 py-0.2 bg-stone-100 text-stone-600 rounded font-medium"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3 px-4">
                        <span
                          className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
                          style={{
                            backgroundColor: `${catInfo?.color || '#059669'}15`,
                            color: catInfo?.color || '#059669',
                          }}
                        >
                          {catInfo?.name || tx.category}
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-4 text-stone-600 text-[11px] whitespace-nowrap">
                        {tx.paymentMethod}
                      </td>

                      {/* Receipt Status Badge */}
                      <td className="py-3 px-4 text-center">
                        {tx.receipt ? (
                          <button
                            onClick={() => tx.receipt && setInspectedReceipt(tx.receipt)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
                            title="Inspect physical paper receipt"
                          >
                            <Receipt className="w-3 h-3" />
                            <span>Inspect</span>
                          </button>
                        ) : (
                          <span className="text-stone-300 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right font-mono-num font-bold whitespace-nowrap">
                        <span
                          className={
                            isIncome
                              ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded'
                              : isExpense
                              ? 'text-stone-900'
                              : 'text-teal-700 bg-teal-50 px-2 py-0.5 rounded'
                          }
                        >
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete record for ${tx.merchant}?`)) {
                              deleteTransaction(tx.id);
                            }
                          }}
                          title="Delete transaction"
                          className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-60 group-hover:opacity-100 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs">
            <span className="text-stone-500 font-mono-num">
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
