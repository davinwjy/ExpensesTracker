import React from 'react';
import {
  Wallet,
  TrendingUp,
  Receipt,
  ArrowRightLeft,
  Eye,
  EyeOff,
  Plus,
  ArrowDownRight,
  Coins,
  Building,
  Landmark,
  Globe,
  DollarSign,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatIdr, formatUsd, formatMasked, formatDate } from '../lib/formatters';

export const DashboardView: React.FC = () => {
  const {
    stats,
    accounts,
    transactions,
    investments,
    isPrivacyMode,
    togglePrivacyMode,
    usdIdrRate,
    setActiveTab,
    setIsAddExpenseOpen,
    setTransactionInitialType,
    setIsTransferOpen,
    setTransferInitialMode,
    setIsAddAccountOpen,
    setEditingTransaction,
  } = useFinance();

  const netWorthIdr = stats?.totalNetWorthIdr || 0;
  const netWorthUsd = usdIdrRate > 0 ? netWorthIdr / usdIdrRate : 0;
  const liquidCashIdr = stats?.totalLiquidCashIdr || 0;
  const investmentValueIdr = stats?.totalInvestmentValueIdr || 0;
  const unrealizedPnlIdr = stats?.unrealizedPnlIdr || 0;
  const pnlPercent = stats?.unrealizedPnlPercentage || 0;

  const monthlyExpenses = stats?.monthlyExpenses || 0;
  const monthlyIncomes = stats?.monthlyIncomes || 0;
  const monthlyTransfersToInv = stats?.monthlyTransfersToInv || 0;

  const recentTransactions = transactions.slice(0, 7);

  // Group investments by category for quick overview
  const categoryAllocations = stats?.categoryAllocations || {};

  return (
    <div className="space-y-4 animate-in fade-in pb-10">
      {/* Privacy banner notice if active */}
      {isPrivacyMode && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-300 font-mono">
          <div className="flex items-center gap-2">
            <EyeOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>PRIVACY SHIELD ACTIVE:</strong> All currency figures are masked for screen-sharing.
            </span>
          </div>
          <button
            onClick={togglePrivacyMode}
            className="text-amber-400 hover:text-white underline font-semibold text-xs cursor-pointer ml-3 shrink-0"
          >
            Reveal Values
          </button>
        </div>
      )}

      {/* BLOOMBERG TERMINAL HERO DESK */}
      <div className="relative bg-[#0d1017] border border-[#1b212e] rounded p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              <span>PORTFOLIO VALUATION // NET WORTH</span>
              <button
                onClick={togglePrivacyMode}
                className="p-0.5 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title={isPrivacyMode ? 'Unmask figures' : 'Mask figures'}
              >
                {isPrivacyMode ? (
                  <EyeOff className="w-3 h-3 text-amber-400" />
                ) : (
                  <Eye className="w-3 h-3" />
                )}
              </button>
            </div>

            {/* Big Net Worth Nominal */}
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-100 font-mono tabular-nums">
                {formatMasked(netWorthIdr, 'IDR', isPrivacyMode)}
              </h2>
              {!isPrivacyMode && (
                <span className="text-xs sm:text-sm font-semibold text-zinc-400 font-mono tabular-nums">
                  ≈ {formatUsd(netWorthUsd)}
                </span>
              )}
            </div>

            {/* Tabular Metric Ledger Line */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-zinc-400 font-mono">
              <span>
                LIQUID CASH:{' '}
                <strong className="text-zinc-200 tabular-nums">
                  {formatMasked(liquidCashIdr, 'IDR', isPrivacyMode)}
                </strong>
              </span>
              <span className="text-zinc-600">|</span>
              <span>
                INVESTED ASSETS:{' '}
                <strong className="text-zinc-200 tabular-nums">
                  {formatMasked(investmentValueIdr, 'IDR', isPrivacyMode)}
                </strong>
              </span>
              <span className="text-zinc-600">|</span>
              <span
                className={`font-bold tabular-nums ${
                  unrealizedPnlIdr >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {unrealizedPnlIdr >= 0 ? '+' : ''}
                {pnlPercent.toFixed(1)}% ROI
              </span>
            </div>

            {/* Visual Allocation Weight Bar */}
            {netWorthIdr > 0 && (
              <div className="pt-2 space-y-1 max-w-lg">
                {(() => {
                  const totalAssetsNominal = liquidCashIdr + investmentValueIdr;
                  const liquidRatio =
                    totalAssetsNominal > 0 ? Math.round((liquidCashIdr / totalAssetsNominal) * 100) : 50;
                  const investedRatio = 100 - liquidRatio;
                  return (
                    <>
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                        <span>CASH {liquidRatio}%</span>
                        <span>INVESTMENT {investedRatio}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-sm bg-[#151a26] overflow-hidden flex">
                        <div
                          style={{ width: `${liquidRatio}%` }}
                          className="h-full bg-emerald-500 transition-all duration-300"
                        />
                        <div
                          style={{ width: `${investedRatio}%` }}
                          className="h-full bg-indigo-500 transition-all duration-300"
                        />
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Quick Terminal Action Suite */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 lg:pt-0">
            <button
              onClick={() => {
                setEditingTransaction(null);
                setTransactionInitialType('expense');
                setIsAddExpenseOpen(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#131722] hover:bg-[#1a2030] text-zinc-200 font-semibold text-xs border border-[#21293a] transition-all cursor-pointer font-mono"
            >
              <Receipt className="w-3.5 h-3.5 text-rose-400" />
              <span>+ EXPENSE</span>
            </button>

            <button
              onClick={() => {
                setEditingTransaction(null);
                setTransactionInitialType('income');
                setIsAddExpenseOpen(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#131722] hover:bg-[#1a2030] text-zinc-200 font-semibold text-xs border border-[#21293a] transition-all cursor-pointer font-mono"
            >
              <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ INCOME</span>
            </button>

            <button
              onClick={() => {
                setTransferInitialMode('bank_to_investment');
                setIsTransferOpen(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#131722] hover:bg-[#1a2030] text-zinc-200 font-semibold text-xs border border-[#21293a] transition-all cursor-pointer font-mono"
            >
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              <span>FUND INVEST</span>
            </button>

            <button
              onClick={() => {
                setTransferInitialMode('account_to_account');
                setIsTransferOpen(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#131722] hover:bg-[#1a2030] text-zinc-200 font-semibold text-xs border border-[#21293a] transition-all cursor-pointer font-mono"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
              <span>TRANSFER</span>
            </button>
          </div>
        </div>
      </div>

      {/* MONTHLY TELEMETRY LEDGER (3 COMPACT CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Expenses this month */}
        <div className="p-3.5 rounded bg-[#0d1017] border border-[#1b212e]">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            <span>MONTHLY EXPENSES</span>
            <Receipt className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-rose-400 font-mono tabular-nums">
            {formatMasked(monthlyExpenses, 'IDR', isPrivacyMode)}
          </p>
          <p className="text-[10px] font-mono text-zinc-500 mt-0.5">Deducted from bank & cash wallets</p>
        </div>

        {/* Incomes this month */}
        <div className="p-3.5 rounded bg-[#0d1017] border border-[#1b212e]">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            <span>MONTHLY INFLOWS</span>
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            {formatMasked(monthlyIncomes, 'IDR', isPrivacyMode)}
          </p>
          <p className="text-[10px] font-mono text-zinc-500 mt-0.5">Salary, dividends & deposits</p>
        </div>

        {/* Invested this month */}
        <div className="p-3.5 rounded bg-[#0d1017] border border-[#1b212e]">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            <span>DEPLOYED TO INVESTMENTS</span>
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-indigo-400 font-mono tabular-nums">
            {formatMasked(monthlyTransfersToInv, 'IDR', isPrivacyMode)}
          </p>
          <p className="text-[10px] font-mono text-zinc-500 mt-0.5">Funded directly from bank accounts</p>
        </div>
      </div>

      {/* PORTFOLIO ASSET ALLOCATION MATRIX (THE 5 ASSET CATEGORIES) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
              HOLDINGS MATRIX
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              ({investments.length} Assets tracked)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('investments')}
              className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
            >
              VIEW ALL
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {/* Saham */}
          <div className="p-3 rounded bg-[#0d1017] border border-[#1b212e] hover:border-blue-500/40 transition-colors">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-1">
              <span className="font-bold text-blue-400 flex items-center gap-1">
                <Building className="w-3 h-3" />
                SAHAM
              </span>
              <span>IDR</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-zinc-100 font-mono tabular-nums">
              {formatMasked(categoryAllocations['Saham']?.idrValue || 0, 'IDR', isPrivacyMode)}
            </p>
            <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
              {categoryAllocations['Saham']?.count || 0} holding(s)
            </p>
          </div>

          {/* RDPU */}
          <div className="p-3 rounded bg-[#0d1017] border border-[#1b212e] hover:border-teal-500/40 transition-colors">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-1">
              <span className="font-bold text-teal-400 flex items-center gap-1">
                <Landmark className="w-3 h-3" />
                RDPU
              </span>
              <span>IDR</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-zinc-100 font-mono tabular-nums">
              {formatMasked(categoryAllocations['RDPU']?.idrValue || 0, 'IDR', isPrivacyMode)}
            </p>
            <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
              {categoryAllocations['RDPU']?.count || 0} holding(s)
            </p>
          </div>

          {/* Bitcoin */}
          <div className="p-3 rounded bg-[#0d1017] border border-[#1b212e] hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-1">
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <Coins className="w-3 h-3" />
                BITCOIN
              </span>
              <span>IDR</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-zinc-100 font-mono tabular-nums">
              {formatMasked(categoryAllocations['Bitcoin']?.idrValue || 0, 'IDR', isPrivacyMode)}
            </p>
            <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
              {categoryAllocations['Bitcoin']?.count || 0} holding(s)
            </p>
          </div>

          {/* ETF USA */}
          <div className="p-3 rounded bg-[#0d1017] border border-[#1b212e] hover:border-purple-500/40 transition-colors">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-1">
              <span className="font-bold text-purple-400 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                ETF USA
              </span>
              <span>USD</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-zinc-100 font-mono tabular-nums">
              {formatMasked(categoryAllocations['ETF USA']?.usdValue || 0, 'USD', isPrivacyMode)}
            </p>
            <p className="text-[10px] font-mono tabular-nums text-zinc-500 mt-0.5">
              ≈ {formatMasked(categoryAllocations['ETF USA']?.idrValue || 0, 'IDR', isPrivacyMode)}
            </p>
          </div>

          {/* USD */}
          <div className="p-3 rounded bg-[#0d1017] border border-[#1b212e] hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-1">
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                USD CASH
              </span>
              <span>USD</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-zinc-100 font-mono tabular-nums">
              {formatMasked(categoryAllocations['USD']?.usdValue || 0, 'USD', isPrivacyMode)}
            </p>
            <p className="text-[10px] font-mono tabular-nums text-zinc-500 mt-0.5">
              ≈ {formatMasked(categoryAllocations['USD']?.idrValue || 0, 'IDR', isPrivacyMode)}
            </p>
          </div>
        </div>
      </div>

      {/* DUAL WORKSPACE: LIQUIDITY ACCOUNTS & RECENT LEDGER ENTRIES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* BANK & CASH ACCOUNTS */}
        <div className="p-4 rounded bg-[#0d1017] border border-[#1b212e] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1b212e]">
            <div>
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-200">
                LIQUIDITY & BANK ACCOUNTS
              </h3>
              <p className="text-[10px] font-mono text-zinc-500">
                Cash balance runway across funding accounts
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsAddAccountOpen(true)}
                className="text-[10px] font-mono flex items-center gap-1 px-2 py-1 rounded bg-[#131722] hover:bg-[#1a2030] text-sky-400 border border-[#21293a] cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>BANK</span>
              </button>
              <button
                onClick={() => setActiveTab('accounts')}
                className="text-[10px] font-mono text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
              >
                MANAGE
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center justify-between p-2.5 rounded bg-[#10141e] border border-[#1d2332] hover:border-[#2b354a] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-1.5 h-8 rounded-none"
                    style={{ backgroundColor: acc.color || '#3b82f6' }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-100 text-xs">{acc.name}</span>
                      <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">
                        {acc.type}
                      </span>
                    </div>
                    {acc.accountNumber && (
                      <p className="text-[10px] text-zinc-500 font-mono">{acc.accountNumber}</p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs sm:text-sm font-bold text-emerald-400 font-mono tabular-nums">
                    {formatMasked(acc.balance, 'IDR', isPrivacyMode)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs font-mono text-zinc-400 border-t border-[#1b212e]">
            <span>TOTAL LIQUID IDR:</span>
            <span className="font-bold text-zinc-100 font-mono tabular-nums">
              {formatMasked(liquidCashIdr, 'IDR', isPrivacyMode)}
            </span>
          </div>
        </div>

        {/* RECENT TRANSACTIONS */}
        <div className="p-4 rounded bg-[#0d1017] border border-[#1b212e] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1b212e]">
            <div>
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-200">
                RECENT TRANSACTION STREAM
              </h3>
              <p className="text-[10px] font-mono text-zinc-500">Expenses, inflows, and investment fundings</p>
            </div>
            <button
              onClick={() => setActiveTab('expenses')}
              className="text-[10px] font-mono text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
            >
              FULL LEDGER
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-zinc-500">
              No recent entries recorded yet.
            </div>
          ) : (
            <div className="space-y-1">
              {recentTransactions.map((tx) => {
                const sourceAcc = accounts.find((a) => a.id === tx.accountId);
                const destAcc = accounts.find((a) => a.id === tx.toAccountId);
                const targetInv = investments.find((i) => i.id === tx.toInvestmentId);

                return (
                  <div
                    key={tx.id}
                    onClick={() => {
                      if (tx.type === 'expense' || tx.type === 'income') {
                        setEditingTransaction(tx);
                        setIsAddExpenseOpen(true);
                      }
                    }}
                    className="flex items-center justify-between p-2 rounded bg-[#10141e] border border-[#1d2332] hover:border-[#2b354a] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                          tx.type === 'expense'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : tx.type === 'income'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : tx.type === 'bank_to_investment'
                            ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                            : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {tx.type === 'expense' && <Receipt className="w-3.5 h-3.5" />}
                        {tx.type === 'income' && <ArrowDownRight className="w-3.5 h-3.5" />}
                        {tx.type === 'bank_to_investment' && <TrendingUp className="w-3.5 h-3.5" />}
                        {tx.type === 'transfer' && <ArrowRightLeft className="w-3.5 h-3.5" />}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-zinc-200 truncate">
                          {tx.type === 'bank_to_investment'
                            ? `Funded ${targetInv?.name || 'Investment'}`
                            : tx.type === 'transfer'
                            ? `Transfer to ${destAcc?.name || 'Cash'}`
                            : tx.category || 'General'}
                        </p>
                        <p className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5 flex-wrap truncate">
                          <span>{sourceAcc?.name || 'Bank'}</span>
                          <span>·</span>
                          <span>{formatDate(tx.date)}</span>
                          {tx.notes && (
                            <>
                              <span>·</span>
                              <span className="italic text-zinc-400 truncate max-w-[150px]">
                                "{tx.notes}"
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      <span
                        className={`text-xs font-mono tabular-nums font-bold ${
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
                        <p className="text-[9px] text-zinc-500 font-mono tabular-nums">
                          +{formatUsd(tx.amountUsd)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
