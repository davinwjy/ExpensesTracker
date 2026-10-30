import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Filter,
  Search,
  Calendar,
  Trash2,
  Edit2,
  ArrowDownRight,
  TrendingUp,
  ArrowRightLeft,
  X,
  CreditCard,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import {
  formatIdr,
  formatUsd,
  formatMasked,
  formatDate,
  CATEGORY_COLORS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from '../lib/formatters';
import { Transaction } from '../types';

export const ExpensesView: React.FC = () => {
  const {
    transactions,
    accounts,
    investments,
    isPrivacyMode,
    setIsAddExpenseOpen,
    setTransactionInitialType,
    setEditingTransaction,
    deleteTransaction,
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Date, Month, Year filter states
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  const [datePreset, setDatePreset] = useState<'all' | 'today' | 'this_month' | 'this_year' | 'custom'>('all');

  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const MONTH_OPTIONS = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  // Available years based on transactions + current year
  const availableYears = React.useMemo(() => {
    const currentYear = new Date().getFullYear().toString();
    const yearSet = new Set<string>([currentYear]);
    transactions.forEach((tx) => {
      if (tx.date) {
        const parts = tx.date.split('-');
        if (parts[0] && parts[0].length === 4) {
          yearSet.add(parts[0]);
        }
      }
    });
    return Array.from(yearSet).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  // Available categories based on selected type filter
  const availableCategories = React.useMemo(() => {
    if (selectedTypeFilter === 'expense') {
      return [...EXPENSE_CATEGORIES];
    }
    if (selectedTypeFilter === 'income') {
      return [...INCOME_CATEGORIES];
    }
    const set = new Set<string>();
    EXPENSE_CATEGORIES.forEach((c) => set.add(c));
    INCOME_CATEGORIES.forEach((c) => set.add(c));
    transactions.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [selectedTypeFilter, transactions]);

  const applyPreset = (preset: 'all' | 'today' | 'this_month' | 'this_year') => {
    const today = getTodayStr();
    setDatePreset(preset);
    if (preset === 'all') {
      setSelectedYear('all');
      setSelectedMonth('all');
      setSelectedDate('');
    } else if (preset === 'today') {
      setSelectedDate(today);
      setSelectedYear(today.slice(0, 4));
      setSelectedMonth(today.slice(5, 7));
    } else if (preset === 'this_month') {
      setSelectedDate('');
      setSelectedYear(today.slice(0, 4));
      setSelectedMonth(today.slice(5, 7));
    } else if (preset === 'this_year') {
      setSelectedDate('');
      setSelectedYear(today.slice(0, 4));
      setSelectedMonth('all');
    }
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setSelectedDate('');
    setDatePreset('custom');
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    setSelectedDate('');
    setDatePreset('custom');
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    if (date) {
      const parts = date.split('-');
      if (parts[0]) setSelectedYear(parts[0]);
      if (parts[1]) setSelectedMonth(parts[1]);
      setDatePreset(date === getTodayStr() ? 'today' : 'custom');
    } else {
      setDatePreset('custom');
    }
  };

  const isAnyFilterActive =
    searchQuery.trim() !== '' ||
    selectedAccountFilter !== 'all' ||
    selectedTypeFilter !== 'all' ||
    selectedCategoryFilter !== 'all' ||
    selectedYear !== 'all' ||
    selectedMonth !== 'all' ||
    selectedDate !== '';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedAccountFilter('all');
    setSelectedTypeFilter('all');
    setSelectedCategoryFilter('all');
    setSelectedYear('all');
    setSelectedMonth('all');
    setSelectedDate('');
    setDatePreset('all');
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCat = tx.category.toLowerCase().includes(q);
      const matchNotes = tx.notes ? tx.notes.toLowerCase().includes(q) : false;
      if (!matchCat && !matchNotes) return false;
    }

    // Account filter
    if (selectedAccountFilter !== 'all') {
      if (tx.accountId !== selectedAccountFilter && tx.toAccountId !== selectedAccountFilter) {
        return false;
      }
    }

    // Type filter
    if (selectedTypeFilter !== 'all') {
      if (tx.type !== selectedTypeFilter) return false;
    }

    // Category filter
    if (selectedCategoryFilter !== 'all') {
      if (tx.category !== selectedCategoryFilter) return false;
    }

    // Date, Month, Year filter
    if (selectedDate) {
      if (tx.date !== selectedDate) return false;
    } else {
      if (selectedYear !== 'all') {
        const txYear = tx.date ? tx.date.split('-')[0] : '';
        if (txYear !== selectedYear) return false;
      }
      if (selectedMonth !== 'all') {
        const txMonth = tx.date ? tx.date.split('-')[1] : '';
        if (txMonth !== selectedMonth) return false;
      }
    }

    return true;
  });

  // Calculate totals for filtered list
  const totalFilteredExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashFlow = totalFilteredIncome - totalFilteredExpense;

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      setDeletingId(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in pb-12">
      {/* Header & Main CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-zinc-100 font-mono">
              TRANSACTIONS & CASH FLOW LEDGER
            </h2>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#161a25] border border-[#232b3d] text-zinc-400">
              {filteredTransactions.length} LOGS
            </span>
          </div>
          <p className="text-[11px] font-mono text-zinc-500">
            Daily income, expenses, and inter-account liquidity movements
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setEditingTransaction(null);
              setTransactionInitialType('expense');
              setIsAddExpenseOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.8]" />
            <span>RECORD EXPENSE</span>
          </button>

          <button
            onClick={() => {
              setEditingTransaction(null);
              setTransactionInitialType('income');
              setIsAddExpenseOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.8]" />
            <span>RECORD INCOME</span>
          </button>
        </div>
      </div>

      {/* FILTER & CONTROL PANEL */}
      <div className="p-3.5 rounded bg-[#0d1017] border border-[#1b212e] space-y-3 font-mono">
        {/* Search & Dropdown Primary Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memo / notes..."
              className="w-full bg-[#080a0f] border border-[#1d2332] focus:border-emerald-500 rounded pl-8 pr-7 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div>
            <select
              value={selectedAccountFilter}
              onChange={(e) => setSelectedAccountFilter(e.target.value)}
              className="w-full bg-[#080a0f] border border-[#1d2332] focus:border-emerald-500 rounded px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="all">ALL ACCOUNTS</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedTypeFilter}
              onChange={(e) => {
                setSelectedTypeFilter(e.target.value);
                setSelectedCategoryFilter('all');
              }}
              className="w-full bg-[#080a0f] border border-[#1d2332] focus:border-emerald-500 rounded px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="all">ALL TRANSACTION TYPES</option>
              <option value="expense">EXPENSES (-)</option>
              <option value="income">INFLOWS (+)</option>
              <option value="transfer">BANK ↔ CASH TRANSFERS</option>
              <option value="bank_to_investment">BANK → INVESTMENTS</option>
            </select>
          </div>

          <div>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full bg-[#080a0f] border border-[#1d2332] focus:border-emerald-500 rounded px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="all">
                {selectedTypeFilter === 'income'
                  ? 'ALL INCOME CATEGORIES'
                  : selectedTypeFilter === 'expense'
                  ? 'ALL EXPENSE CATEGORIES'
                  : 'ALL CATEGORIES'}
              </option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date, Month & Year Filters */}
        <div className="pt-2.5 border-t border-[#1b212e] space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            {/* Quick Period Presets */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              <span className="text-[10px] text-zinc-500 mr-1 flex items-center gap-1 shrink-0 uppercase">
                <Calendar className="w-3 h-3 text-emerald-400" />
                PERIOD:
              </span>
              <button
                type="button"
                onClick={() => applyPreset('all')}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors shrink-0 cursor-pointer ${
                  datePreset === 'all' && selectedYear === 'all' && selectedMonth === 'all' && !selectedDate
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-[#10141e] text-zinc-400 hover:text-zinc-200 border border-[#1d2332]'
                }`}
              >
                ALL TIME
              </button>
              <button
                type="button"
                onClick={() => applyPreset('today')}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors shrink-0 cursor-pointer ${
                  datePreset === 'today' || (selectedDate && selectedDate === getTodayStr())
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-[#10141e] text-zinc-400 hover:text-zinc-200 border border-[#1d2332]'
                }`}
              >
                TODAY
              </button>
              <button
                type="button"
                onClick={() => applyPreset('this_month')}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors shrink-0 cursor-pointer ${
                  datePreset === 'this_month'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-[#10141e] text-zinc-400 hover:text-zinc-200 border border-[#1d2332]'
                }`}
              >
                THIS MONTH
              </button>
              <button
                type="button"
                onClick={() => applyPreset('this_year')}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors shrink-0 cursor-pointer ${
                  datePreset === 'this_year'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-[#10141e] text-zinc-400 hover:text-zinc-200 border border-[#1d2332]'
                }`}
              >
                THIS YEAR
              </button>
            </div>

            {/* Clear all filters shortcut if active */}
            {isAnyFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>RESET FILTERS</span>
              </button>
            )}
          </div>

          {/* Granular Year, Month, and Exact Date Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[9px] text-zinc-500 uppercase tracking-wider mb-0.5">
                FILTER BY YEAR
              </label>
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className="w-full bg-[#080a0f] border border-[#1d2332] focus:border-emerald-500 rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none cursor-pointer"
              >
                <option value="all">ALL YEARS</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[9px] text-zinc-500 uppercase tracking-wider mb-0.5">
                FILTER BY MONTH
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="w-full bg-[#080a0f] border border-[#1d2332] focus:border-emerald-500 rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none cursor-pointer"
              >
                <option value="all">ALL MONTHS</option>
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label.toUpperCase()} ({m.value})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="block text-[9px] text-zinc-500 uppercase tracking-wider">
                  SPECIFIC DATE
                </label>
                {selectedDate && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate('');
                      setDatePreset('custom');
                    }}
                    className="text-[9px] text-rose-400 hover:text-rose-300 cursor-pointer flex items-center gap-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full bg-[#080a0f] border border-[#1d2332] focus:border-emerald-500 rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Filtered Summary Figures */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-[#1b212e] text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase mr-1.5">EXPENSES:</span>
              <span className="font-bold text-rose-400 tabular-nums">
                {formatIdr(totalFilteredExpense)}
              </span>
            </div>

            {totalFilteredIncome > 0 && (
              <div>
                <span className="text-[10px] text-zinc-500 uppercase mr-1.5">INFLOWS:</span>
                <span className="font-bold text-emerald-400 tabular-nums">
                  {formatIdr(totalFilteredIncome)}
                </span>
              </div>
            )}

            <div>
              <span className="text-[10px] text-zinc-500 uppercase mr-1.5">NET CASH FLOW:</span>
              <span
                className={`font-bold tabular-nums ${
                  netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {netCashFlow >= 0 ? '+' : ''}
                {formatIdr(netCashFlow)}
              </span>
            </div>
          </div>

          <div className="text-[10px] text-zinc-500">
            SHOWING <strong className="text-zinc-200 tabular-nums">{filteredTransactions.length}</strong> OF{' '}
            <strong className="text-zinc-200 tabular-nums">{transactions.length}</strong> ENTRIES
          </div>
        </div>
      </div>

      {/* HIGH-DENSITY TRANSACTIONS TABLE */}
      <div className="overflow-x-auto rounded bg-[#0d1017] border border-[#1b212e]">
        {filteredTransactions.length === 0 ? (
          <div className="p-10 text-center font-mono">
            <Receipt className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-zinc-300">No transactions found</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              Adjust your search keywords, category, or date range filter.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1b212e] bg-[#090b10] text-[10px] font-mono uppercase tracking-wider text-zinc-500 select-none">
                <th className="py-2.5 px-3 font-semibold">Date</th>
                <th className="py-2.5 px-3 font-semibold">Type</th>
                <th className="py-2.5 px-3 font-semibold">Description / Category</th>
                <th className="py-2.5 px-3 font-semibold">Funding Account</th>
                <th className="py-2.5 px-3 font-semibold">Memo / Notes</th>
                <th className="py-2.5 px-3 font-semibold text-right">Amount (IDR)</th>
                <th className="py-2.5 px-3 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171b26] font-mono">
              {filteredTransactions.map((tx) => {
                const sourceAcc = accounts.find((a) => a.id === tx.accountId);
                const destAcc = accounts.find((a) => a.id === tx.toAccountId);
                const targetInv = investments.find((i) => i.id === tx.toInvestmentId);

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-[#10141e] transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-2 px-3 text-[11px] tabular-nums text-zinc-400 whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>

                    {/* Type */}
                    <td className="py-2 px-3 text-[10px] uppercase whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          tx.type === 'expense'
                            ? 'text-rose-400'
                            : tx.type === 'income'
                            ? 'text-emerald-400'
                            : tx.type === 'bank_to_investment'
                            ? 'text-indigo-400'
                            : 'text-blue-400'
                        }`}
                      >
                        {tx.type === 'bank_to_investment'
                          ? 'INVEST'
                          : tx.type === 'transfer'
                          ? 'XFER'
                          : tx.type.toUpperCase()}
                      </span>
                    </td>

                    {/* Description / Category */}
                    <td className="py-2 px-3 text-zinc-200 font-sans font-medium text-xs">
                      {tx.type === 'bank_to_investment'
                        ? `Funded ${targetInv?.name || 'Investment'}`
                        : tx.type === 'transfer'
                        ? `Transfer to ${destAcc?.name || 'Cash'}`
                        : tx.category || 'General'}
                    </td>

                    {/* Account */}
                    <td className="py-2 px-3 text-zinc-400 text-[11px] whitespace-nowrap">
                      {sourceAcc?.name || 'Account'}
                    </td>

                    {/* Notes */}
                    <td className="py-2 px-3 text-zinc-500 text-[11px] italic truncate max-w-xs">
                      {tx.notes ? `"${tx.notes}"` : '—'}
                    </td>

                    {/* Amount */}
                    <td className="py-2 px-3 text-right tabular-nums whitespace-nowrap">
                      <span
                        className={`font-bold ${
                          tx.type === 'expense'
                            ? 'text-rose-400'
                            : tx.type === 'income'
                            ? 'text-emerald-400'
                            : tx.type === 'bank_to_investment'
                            ? 'text-indigo-400'
                            : 'text-blue-400'
                        }`}
                      >
                        {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}
                        {formatIdr(tx.amount)}
                      </span>
                      {tx.type === 'bank_to_investment' && tx.amountUsd && (
                        <div className="text-[10px] text-zinc-500 tabular-nums">
                          +{formatUsd(tx.amountUsd)}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {tx.type === 'expense' && (
                          <button
                            onClick={() => {
                              setEditingTransaction(tx);
                              setIsAddExpenseOpen(true);
                            }}
                            className="p-1 text-zinc-500 hover:text-white rounded hover:bg-[#161a25] transition-colors cursor-pointer"
                            title="Edit transaction"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}

                        {deletingId === tx.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(tx.id)}
                              className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded cursor-pointer"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              className="px-1 py-0.5 text-zinc-400 text-[10px] cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingId(tx.id)}
                            className="p-1 text-zinc-500 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
