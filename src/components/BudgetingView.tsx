import React, { useState, useMemo } from 'react';
import {
  Target,
  Plus,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Sliders,
  Calendar,
  Layers,
  ArrowDownRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatIdr, formatMasked, formatDate, CATEGORY_COLORS, EXPENSE_CATEGORIES } from '../lib/formatters';
import { BudgetProgress } from '../types';

export const BudgetingView: React.FC = () => {
  const {
    budgets,
    transactions,
    accounts,
    isPrivacyMode,
    setIsBudgetModalOpen,
    setEditingBudget,
    saveBudget,
    getBudgetProgressForMonth,
  } = useFinance();

  // Month navigation: default to current month YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [filterStatus, setFilterStatus] = useState<'all' | 'danger' | 'warning' | 'safe'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Month formatting helpers
  const monthDisplay = useMemo(() => {
    try {
      const [year, month] = selectedMonth.split('-').map(Number);
      const date = new Date(year, month - 1, 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return selectedMonth;
    }
  }, [selectedMonth]);

  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const prev = new Date(year, month - 2, 1);
    setSelectedMonth(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const next = new Date(year, month, 1);
    setSelectedMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleResetCurrentMonth = () => {
    const now = new Date();
    setSelectedMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  };

  const isCurrentMonth = useMemo(() => {
    const now = new Date();
    const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return selectedMonth === current;
  }, [selectedMonth]);

  // Compute budget telemetry
  const {
    items,
    unbudgetedItems,
    totalBudgeted,
    totalSpent,
    totalRemaining,
    overallPercent,
    isOverBudget,
    overBudgetCount,
  } = getBudgetProgressForMonth(selectedMonth);

  // Warning count
  const warningCount = useMemo(() => {
    return items.filter((i) => i.status === 'warning').length;
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filterStatus !== 'all' && item.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return item.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [items, filterStatus, searchQuery]);

  // Get transactions for expanded category
  const getCategoryTransactions = (catName: string) => {
    return transactions.filter(
      (tx) =>
        tx.type === 'expense' &&
        tx.category === catName &&
        tx.date &&
        tx.date.startsWith(selectedMonth)
    );
  };

  const handleEditBudget = (item: BudgetProgress) => {
    const found = budgets.find((b) => b.id === item.budgetId);
    if (found) {
      setEditingBudget(found);
    } else {
      // Synthesize budget for category
      setEditingBudget({
        id: '',
        userId: '',
        category: item.category,
        monthlyLimit: item.monthlyLimit,
        createdAt: '',
        updatedAt: '',
      });
    }
    setIsBudgetModalOpen(true);
  };

  const handleQuickAddUnbudgeted = (categoryName: string, defaultLimit: number = 2000000) => {
    saveBudget(categoryName, defaultLimit);
  };

  return (
    <div className="space-y-4 animate-in fade-in pb-12">
      {/* 1. TOP HEADER & TELEMETRY DESK */}
      <div className="bg-[#0d1017] border border-[#1b212e] rounded p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>MONTHLY SPENDING CEILINGS // BUDGET CONTROL</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 font-mono">
              Category Budgets & Progress
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Enforce spending limits by category and monitor live runway consumption.
            </p>
          </div>

          {/* Month Navigation & Action */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-[#131722] border border-[#21293a] rounded p-1">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#1a2030] transition-colors cursor-pointer"
                title="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-3 py-0.5 text-xs font-mono font-bold text-zinc-200 min-w-[130px] text-center">
                {monthDisplay}
              </div>

              <button
                onClick={handleNextMonth}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#1a2030] transition-colors cursor-pointer"
                title="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {!isCurrentMonth && (
              <button
                onClick={handleResetCurrentMonth}
                className="px-2.5 py-1.5 rounded bg-[#131722] hover:bg-[#1a2030] text-zinc-300 font-mono text-xs border border-[#21293a] cursor-pointer"
              >
                Current Month
              </button>
            )}

            <button
              onClick={() => {
                setEditingBudget(null);
                setIsBudgetModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs font-mono shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>+ SET LIMIT</span>
            </button>
          </div>
        </div>

        {/* 2. OVERALL MACRO CONSUMPTION BAR */}
        <div className="mt-5 pt-4 border-t border-[#1b212e] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">TOTAL MONTHLY SPENT:</span>
              <strong className="text-zinc-100 font-bold tabular-nums">
                {formatMasked(totalSpent, 'IDR', isPrivacyMode)}
              </strong>
              <span className="text-zinc-500">/</span>
              <span className="text-zinc-400">
                {formatMasked(totalBudgeted, 'IDR', isPrivacyMode)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                  isOverBudget
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : overallPercent >= 75
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {overallPercent.toFixed(1)}% USED
              </span>
            </div>
          </div>

          {/* Master visual indicator bar */}
          <div className="relative w-full h-3 rounded-full bg-[#141a27] border border-[#212a40] overflow-hidden">
            <div
              style={{ width: `${Math.min(100, overallPercent)}%` }}
              className={`h-full transition-all duration-500 ${
                isOverBudget
                  ? 'bg-gradient-to-r from-rose-600 to-rose-400'
                  : overallPercent >= 75
                  ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
              }`}
            />
            {/* 75% threshold marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-zinc-600/60 z-10"
              style={{ left: '75%' }}
              title="75% Warning Threshold"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>0%</span>
            <span>50%</span>
            <span>75% WARNING</span>
            <span>100% CEILING</span>
          </div>
        </div>
      </div>

      {/* 3. FOUR TELEMETRY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Budgeted */}
        <div className="p-3.5 rounded bg-[#0d1017] border border-[#1b212e]">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            <span>TOTAL BUDGETED</span>
            <Target className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <p className="text-xl font-bold text-zinc-100 font-mono tabular-nums">
            {formatMasked(totalBudgeted, 'IDR', isPrivacyMode)}
          </p>
          <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
            Across {items.length} active categories
          </p>
        </div>

        {/* Actual Spent */}
        <div className="p-3.5 rounded bg-[#0d1017] border border-[#1b212e]">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            <span>ACTUAL SPENT</span>
            <Receipt className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <p className="text-xl font-bold text-rose-400 font-mono tabular-nums">
            {formatMasked(totalSpent, 'IDR', isPrivacyMode)}
          </p>
          <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
            {overallPercent.toFixed(1)}% of planned ceiling
          </p>
        </div>

        {/* Remaining Runway */}
        <div className="p-3.5 rounded bg-[#0d1017] border border-[#1b212e]">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            <span>REMAINING RUNWAY</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p
            className={`text-xl font-bold font-mono tabular-nums ${
              isOverBudget ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {isOverBudget ? '-' : ''}
            {formatMasked(isOverBudget ? totalSpent - totalBudgeted : totalRemaining, 'IDR', isPrivacyMode)}
          </p>
          <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
            {isOverBudget ? 'Exceeded by ' + formatIdr(totalSpent - totalBudgeted) : 'Available to spend safely'}
          </p>
        </div>

        {/* Health Status */}
        <div className="p-3.5 rounded bg-[#0d1017] border border-[#1b212e]">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            <span>BUDGET HEALTH</span>
            {isOverBudget ? (
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            ) : warningCount > 0 ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`text-base font-bold font-mono ${
                isOverBudget
                  ? 'text-rose-400'
                  : warningCount > 0
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {isOverBudget
                ? `${overBudgetCount} OVER LIMIT`
                : warningCount > 0
                ? `${warningCount} NEAR LIMIT`
                : 'ALL ON TRACK'}
            </span>
          </div>
          <p className="text-[10px] font-mono text-zinc-500 mt-1">
            {isOverBudget
              ? 'Immediate attention recommended'
              : warningCount > 0
              ? 'Approaching 75% threshold'
              : 'Disciplined spending pace'}
          </p>
        </div>
      </div>

      {/* 4. FILTER & SEARCH CONTROLS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium border transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-[#1b2234] border-emerald-500/40 text-emerald-300'
                : 'bg-[#10141e] border-[#1d2332] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setFilterStatus('danger')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium border transition-all cursor-pointer ${
              filterStatus === 'danger'
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold'
                : 'bg-[#10141e] border-[#1d2332] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Exceeded ({overBudgetCount})
          </button>
          <button
            onClick={() => setFilterStatus('warning')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium border transition-all cursor-pointer ${
              filterStatus === 'warning'
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                : 'bg-[#10141e] border-[#1d2332] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Near Limit ({warningCount})
          </button>
          <button
            onClick={() => setFilterStatus('safe')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium border transition-all cursor-pointer ${
              filterStatus === 'safe'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                : 'bg-[#10141e] border-[#1d2332] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Safe ({items.filter((i) => i.status === 'safe').length})
          </button>
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search category..."
            className="w-full bg-[#10141e] border border-[#1d2332] rounded pl-8 pr-3 py-1.5 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* 5. CATEGORY BUDGET LIST WITH VISUAL PROGRESS INDICATORS */}
      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <div className="p-8 rounded bg-[#0d1017] border border-[#1b212e] text-center space-y-3">
            <Target className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-xs font-mono text-zinc-400">
              No categories match the selected filter.
            </p>
            <button
              onClick={() => {
                setEditingBudget(null);
                setIsBudgetModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500 text-zinc-950 font-bold text-xs font-mono cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Category Budget</span>
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isExpanded = expandedCategory === item.category;
            const catTransactions = isExpanded ? getCategoryTransactions(item.category) : [];
            const tagColor = CATEGORY_COLORS[item.category] || '#10b981';

            return (
              <div
                key={item.category}
                className="bg-[#0d1017] border border-[#1b212e] hover:border-[#273248] rounded transition-all overflow-hidden"
              >
                {/* Main Card Row */}
                <div className="p-3.5 sm:p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    {/* Category Title & Badge */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-2.5 h-8 rounded-sm shrink-0"
                        style={{ backgroundColor: tagColor }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-zinc-100 truncate">
                            {item.category}
                          </h4>
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                              item.status === 'danger'
                                ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                                : item.status === 'warning'
                                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                            }`}
                          >
                            {item.status === 'danger'
                              ? 'EXCEEDED'
                              : item.status === 'warning'
                              ? 'WARNING (≥75%)'
                              : 'ON TRACK'}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-zinc-500">
                          {item.transactionCount} transactions recorded in {monthDisplay}
                        </p>
                      </div>
                    </div>

                    {/* Numeric Figures & Quick Edit */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="text-right">
                        <div className="flex items-baseline gap-1.5 justify-end">
                          <span className="text-xs sm:text-sm font-bold font-mono tabular-nums text-zinc-100">
                            {formatMasked(item.actualSpent, 'IDR', isPrivacyMode)}
                          </span>
                          <span className="text-xs font-mono text-zinc-500">/</span>
                          <span className="text-xs font-mono text-zinc-400 tabular-nums">
                            {formatMasked(item.monthlyLimit, 'IDR', isPrivacyMode)}
                          </span>
                        </div>
                        <p
                          className={`text-[10px] font-mono tabular-nums ${
                            item.remaining < 0 ? 'text-rose-400 font-bold' : 'text-zinc-500'
                          }`}
                        >
                          {item.remaining < 0
                            ? `Over budget by ${formatIdr(Math.abs(item.remaining))}`
                            : `${formatIdr(item.remaining)} remaining`}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 pl-2 border-l border-[#1f2637]">
                        <button
                          onClick={() => handleEditBudget(item)}
                          className="px-2 py-1 rounded bg-[#131722] hover:bg-[#1a2030] text-zinc-300 hover:text-white font-mono text-[11px] border border-[#21293a] transition-colors cursor-pointer"
                          title="Modify Limit"
                        >
                          EDIT
                        </button>

                        <button
                          onClick={() =>
                            setExpandedCategory(isExpanded ? null : item.category)
                          }
                          className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-[#131722] transition-colors cursor-pointer"
                          title={isExpanded ? 'Hide transactions' : 'View transactions'}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* VISUAL INDICATOR PROGRESS BAR */}
                  <div className="space-y-1">
                    <div className="w-full h-2 rounded-full bg-[#131722] border border-[#1f2637] overflow-hidden relative">
                      <div
                        style={{ width: `${Math.min(100, item.percentUsed)}%` }}
                        className={`h-full transition-all duration-300 ${
                          item.status === 'danger'
                            ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                            : item.status === 'warning'
                            ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]'
                        }`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span>{item.percentUsed.toFixed(1)}% consumed</span>
                      <span>
                        Limit: {formatMasked(item.monthlyLimit, 'IDR', isPrivacyMode)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* EXPANDED TRANSACTIONS ACCORDION */}
                {isExpanded && (
                  <div className="border-t border-[#1b212e] bg-[#090c12] p-3 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between pb-1 border-b border-[#161c28]">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                        {item.category} Transactions ({catTransactions.length})
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        Total: {formatIdr(item.actualSpent)}
                      </span>
                    </div>

                    {catTransactions.length === 0 ? (
                      <p className="text-xs font-mono text-zinc-500 py-2">
                        No transactions recorded for this category in {monthDisplay}.
                      </p>
                    ) : (
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {catTransactions.map((tx) => {
                          const acc = accounts.find((a) => a.id === tx.accountId);
                          return (
                            <div
                              key={tx.id}
                              className="flex items-center justify-between p-1.5 rounded bg-[#0f131e] border border-[#1c2333] text-xs font-mono"
                            >
                              <div className="min-w-0 pr-2">
                                <span className="text-zinc-200 font-medium truncate block">
                                  {tx.notes || tx.category}
                                </span>
                                <span className="text-[9px] text-zinc-500">
                                  {formatDate(tx.date)} · {acc?.name || 'Account'}
                                </span>
                              </div>
                              <span className="font-bold text-rose-400 tabular-nums shrink-0">
                                -{formatIdr(tx.amount)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 6. UNBUDGETED CATEGORIES WITH SPENDING THIS MONTH */}
      {unbudgetedItems.length > 0 && (
        <div className="p-4 rounded bg-[#0d1017] border border-[#1b212e] space-y-3 mt-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1b212e]">
            <div>
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>UNBUDGETED ACTIVE EXPENSES</span>
              </h3>
              <p className="text-[10px] font-mono text-zinc-500">
                Categories with recorded transactions in {monthDisplay} that lack a spending ceiling
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {unbudgetedItems.map((unb) => (
              <div
                key={unb.category}
                className="p-3 rounded bg-[#10141e] border border-[#1d2332] flex items-center justify-between gap-2"
              >
                <div>
                  <p className="text-xs font-semibold text-zinc-200">{unb.category}</p>
                  <p className="text-[10px] font-mono text-zinc-500">
                    Spent: <span className="text-rose-400 font-bold">{formatIdr(unb.actualSpent)}</span> ({unb.transactionCount} txs)
                  </p>
                </div>
                <button
                  onClick={() => handleQuickAddUnbudgeted(unb.category, Math.ceil(unb.actualSpent * 1.2 / 500000) * 500000 || 1000000)}
                  className="px-2 py-1 rounded bg-[#141a27] hover:bg-emerald-500 hover:text-zinc-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold transition-all cursor-pointer"
                >
                  + SET LIMIT
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
