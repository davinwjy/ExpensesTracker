import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Eye,
  EyeOff,
  Flame,
  Plus,
  ChevronDown,
  Receipt,
  ArrowDownRight,
  TrendingUp,
  ArrowRightLeft,
  Building2,
  RefreshCw,
  LogOut,
  Sparkles,
  Shield,
  Smartphone,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { formatIdr } from '../lib/formatters';
import { isUserAdmin } from '../lib/admin';

interface TopHeaderProps {
  onOpenMobileMenu: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenMobileMenu,
}) => {
  const { user, logout, isFirebase } = useAuth();
  const {
    activeTab,
    setActiveTab,
    isPrivacyMode,
    togglePrivacyMode,
    usdIdrRate,
    refreshData,
    isLoading,
    setIsAddExpenseOpen,
    setTransactionInitialType,
    setIsTransferOpen,
    setTransferInitialMode,
    setIsAddAccountOpen,
    setEditingTransaction,
    setEditingAccount,
    setIsFirebaseSetupOpen,
    setIsMobileAppModalOpen,
    setIsHoldingTypesModalOpen,
  } = useFinance();

  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const newMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target as Node)) {
        setIsNewMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pageMeta: Record<string, { title: string; subtitle: string; tag: string }> = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Net Worth & Wealth Overview',
      tag: 'Overview',
    },
    expenses: {
      title: 'Transactions',
      subtitle: 'Expense, Income & Transfer Logs',
      tag: 'Cash Flow',
    },
    accounts: {
      title: 'Accounts & Wallets',
      subtitle: 'Bank Accounts, Cash & E-Wallets',
      tag: 'Liquidity',
    },
    investments: {
      title: 'Portfolio & Assets',
      subtitle: 'Crypto, Stocks, RDPU & Precious Metals',
      tag: 'Investments',
    },
    stats: {
      title: 'Analytics & Reports',
      subtitle: 'Cash Flow Distribution & Asset Allocation',
      tag: 'Insights',
    },
    admin: {
      title: 'Admin Console',
      subtitle: 'Manage Users, davinwijaya16@gmail.com Access & System Settings',
      tag: 'Management',
    },
  };

  const currentMeta = pageMeta[activeTab] || pageMeta.dashboard;

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-[#080a0f]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#1a1f2c] h-13 flex items-center px-3 sm:px-5 lg:px-6 transition-colors">
      <div className="flex items-center justify-between w-full">
        {/* Left: Mobile Menu Trigger + Dynamic Page Breadcrumb */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-1.5 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-[#121622] border border-slate-200 dark:border-[#1e2535] transition-colors cursor-pointer shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="min-w-0 flex items-center gap-2">
            <span className="hidden sm:inline-block font-mono text-[10px] text-zinc-500 tracking-wider">
              WT://
            </span>
            <h1 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100 truncate font-mono">
              {currentMeta.title}
            </h1>
            <span className="text-zinc-600 hidden sm:inline">·</span>
            <span className="hidden md:inline-block text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              {currentMeta.tag}
            </span>
          </div>
        </div>

        {/* Right Action Suite: Currency Pill + Privacy + Cloud + Quick Action + Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* USD/IDR Currency Rate Indicator */}
          {usdIdrRate > 0 && (
            <div className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 dark:bg-[#10141e] border border-slate-200 dark:border-[#1d2433] text-[10px] font-mono tabular-nums text-slate-700 dark:text-zinc-300">
              <span className="text-zinc-500 text-[9px] uppercase">FX:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatIdr(usdIdrRate)}</span>
            </div>
          )}

          {/* Privacy Shield Toggle */}
          <button
            onClick={togglePrivacyMode}
            title={isPrivacyMode ? 'Privacy Mode Active: Nominals hidden' : 'Hide nominals in public'}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-medium border transition-all cursor-pointer ${
              isPrivacyMode
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-300 shadow-none'
                : 'bg-slate-100 dark:bg-[#10141e] border-slate-200 dark:border-[#1d2433] text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            {isPrivacyMode ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span className="hidden sm:inline text-[10px] uppercase">Masked</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[10px] uppercase">Privacy</span>
              </>
            )}
          </button>

          {/* Mobile App & APK Button */}
          <button
            onClick={() => setIsMobileAppModalOpen(true)}
            title="Pasang di HP & Download APK"
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-medium border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
            aria-label="Download APK or Install Mobile App"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline text-[10px] uppercase">APK</span>
          </button>

          {/* Firebase Cloud Sync Button */}
          <button
            onClick={() => setIsFirebaseSetupOpen(true)}
            title={isFirebase ? 'Firebase Real-Time Cloud: Connected' : 'Setup Real-Time Cloud Sync'}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-medium border transition-all cursor-pointer ${
              isFirebase
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25'
                : 'bg-slate-100 dark:bg-[#10141e] border-slate-200 dark:border-[#1d2433] text-slate-700 dark:text-zinc-400 hover:text-amber-300'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${isFirebase ? 'text-amber-500 fill-amber-500/30' : 'text-zinc-500'}`} />
            <span className="hidden sm:inline text-[10px] uppercase">{isFirebase ? 'Cloud' : 'Sync'}</span>
          </button>

          {/* Top Quick Action Dropdown */}
          <div className="relative" ref={newMenuRef}>
            <button
              onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wide shadow-none active:scale-95 transition-all cursor-pointer font-mono"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.8]" />
              <span className="hidden sm:inline uppercase text-[10px]">Action</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-150 ${
                  isNewMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isNewMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-60 bg-[#0f131c] border border-[#1f2637] rounded shadow-2xl z-50 overflow-hidden animate-in fade-in duration-100">
                <div className="px-3 py-1.5 border-b border-[#1c2231] bg-[#0b0e15] flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                    QUICK ACTION
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500">ESC</span>
                </div>

                <div className="p-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setIsNewMenuOpen(false);
                      setEditingTransaction(null);
                      setTransactionInitialType('expense');
                      setIsAddExpenseOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left hover:bg-[#161c29] transition-colors group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                      <Receipt className="w-3 h-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-zinc-200">Record Expense</div>
                      <div className="text-[10px] text-zinc-500 truncate">Deduct from cash or bank</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsNewMenuOpen(false);
                      setEditingTransaction(null);
                      setTransactionInitialType('income');
                      setIsAddExpenseOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left hover:bg-[#161c29] transition-colors group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                      <ArrowDownRight className="w-3 h-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-zinc-200">Record Income</div>
                      <div className="text-[10px] text-zinc-500 truncate">Salary, selling items, bonus</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsNewMenuOpen(false);
                      setTransferInitialMode('bank_to_investment');
                      setIsTransferOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left hover:bg-[#161c29] transition-colors group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-3 h-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-zinc-200">Bank to Investment</div>
                      <div className="text-[10px] text-zinc-500 truncate">Top-up stocks, crypto, RDPU</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsNewMenuOpen(false);
                      setTransferInitialMode('account_to_account');
                      setIsTransferOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left hover:bg-[#161c29] transition-colors group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                      <ArrowRightLeft className="w-3 h-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-zinc-200">Account Transfer</div>
                      <div className="text-[10px] text-zinc-500 truncate">Transfer between accounts</div>
                    </div>
                  </button>

                  <div className="border-t border-[#1c2231] my-1" />


                  <button
                    onClick={() => {
                      setIsNewMenuOpen(false);
                      setEditingAccount(null);
                      setIsAddAccountOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left hover:bg-[#161c29] transition-colors group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
                      <Building2 className="w-3 h-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-zinc-200">Add Bank / Account</div>
                      <div className="text-[10px] text-zinc-500 truncate">BCA, Mandiri, Cash</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar Popover */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-1.5 p-0.5 rounded hover:bg-[#121622] border border-transparent hover:border-[#1e2535] transition-all cursor-pointer"
            >
              <div className="w-7 h-7 rounded bg-[#161b27] border border-[#232b3d] flex items-center justify-center text-[10px] font-mono font-bold text-zinc-300">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
              </div>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-56 p-1.5 bg-[#0f131c] border border-[#1f2637] rounded shadow-2xl z-50 animate-in fade-in space-y-0.5">
                <div className="px-2.5 py-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name || 'Account'}</p>
                    {isUserAdmin(user) && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                </div>

                {isUserAdmin(user) && (
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setActiveTab('admin');
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 text-xs text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 rounded-xl cursor-pointer transition-colors font-semibold"
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                      <span>Admin Console</span>
                    </span>
                    <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded text-emerald-700 dark:text-emerald-300 font-mono">
                      Manage
                    </span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsFirebaseSetupOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 text-xs text-amber-800 dark:text-amber-300 hover:bg-amber-500/10 rounded-xl cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    <span className="font-semibold">Cloud Sync</span>
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isFirebase
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {isFirebase ? 'Active' : 'Setup'}
                  </span>
                </button>

                <button
                  onClick={() => refreshData()}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between px-2.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <RefreshCw
                      className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ${
                        isLoading ? 'animate-spin text-emerald-500' : ''
                      }`}
                    />
                    <span>Sync Data</span>
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Cloud</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsMobileAppModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 text-xs text-emerald-300 hover:bg-emerald-500/10 rounded-xl cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mobile App / APK</span>
                  </span>
                  <span className="text-[10px] text-emerald-300 px-1.5 py-0.5 rounded bg-emerald-500/20 font-mono">
                    Android
                  </span>
                </button>

                <div className="border-t border-slate-200 dark:border-slate-800 my-1" />

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl cursor-pointer font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
