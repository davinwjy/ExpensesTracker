import React, { useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  WalletCards,
  PieChart,
  Plus,
  ArrowRightLeft,
  TrendingUp,
  ArrowDownRight,
  X,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const MobileNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsAddExpenseOpen,
    setTransactionInitialType,
    setIsTransferOpen,
    setTransferInitialMode,
    setEditingTransaction,
  } = useFinance();

  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  return (
    <>
      {/* Backdrop */}
      {isQuickMenuOpen && (
        <div
          onClick={() => setIsQuickMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Streamlined Quick Action Sheet */}
      {isQuickMenuOpen && (
        <div className="fixed bottom-20 inset-x-4 z-50 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl space-y-2 animate-in slide-in-from-bottom-5 max-w-sm mx-auto">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-white tracking-wide">Quick Action</span>
            <button
              onClick={() => setIsQuickMenuOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5 pt-1">
            <button
              onClick={() => {
                setIsQuickMenuOpen(false);
                setEditingTransaction(null);
                setTransactionInitialType('expense');
                setIsAddExpenseOpen(true);
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <Receipt className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Record Expense</p>
                <p className="text-[11px] text-slate-400">Deduct from Bank or Cash</p>
              </div>
            </button>

            <button
              onClick={() => {
                setIsQuickMenuOpen(false);
                setEditingTransaction(null);
                setTransactionInitialType('income');
                setIsAddExpenseOpen(true);
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ArrowDownRight className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Record Income</p>
                <p className="text-[11px] text-slate-400">Salary, bonus, freelance deposit</p>
              </div>
            </button>

            <button
              onClick={() => {
                setIsQuickMenuOpen(false);
                setTransferInitialMode('bank_to_investment');
                setIsTransferOpen(true);
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Bank to Investment</p>
                <p className="text-[11px] text-slate-400">Directly fund stocks, crypto, USD</p>
              </div>
            </button>

            <button
              onClick={() => {
                setIsQuickMenuOpen(false);
                setTransferInitialMode('account_to_account');
                setIsTransferOpen(true);
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Account Transfer</p>
                <p className="text-[11px] text-slate-400">Transfer between accounts</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Sleek Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[#080a0f]/95 backdrop-blur-lg border-t border-[#1a1f2c] px-3 py-1">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Home */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center py-1 px-2.5 rounded transition-colors cursor-pointer ${
              activeTab === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase mt-0.5">Desk</span>
          </button>

          {/* Expenses */}
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex flex-col items-center py-1 px-2.5 rounded transition-colors cursor-pointer ${
              activeTab === 'expenses' ? 'text-emerald-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase mt-0.5">Ledger</span>
          </button>

          {/* Clean Center Action Button */}
          <button
            onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
            className="flex items-center justify-center w-8 h-8 rounded bg-emerald-500 text-slate-950 shadow-none active:scale-95 transition-all cursor-pointer"
            aria-label="New Action"
          >
            <Plus className={`w-4 h-4 stroke-[2.8] transition-transform duration-100 ${isQuickMenuOpen ? 'rotate-45' : ''}`} />
          </button>

          {/* Accounts */}
          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex flex-col items-center py-1 px-2.5 rounded transition-colors cursor-pointer ${
              activeTab === 'accounts' ? 'text-emerald-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <WalletCards className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase mt-0.5">Banks</span>
          </button>

          {/* Portfolio */}
          <button
            onClick={() => setActiveTab('investments')}
            className={`flex flex-col items-center py-1 px-2.5 rounded transition-colors cursor-pointer ${
              activeTab === 'investments' ? 'text-emerald-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase mt-0.5">Assets</span>
          </button>
        </div>
      </div>
    </>
  );
};
