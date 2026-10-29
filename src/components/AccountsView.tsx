import React from 'react';
import {
  CreditCard,
  Plus,
  ArrowRightLeft,
  TrendingUp,
  Edit2,
  Wallet,
  Landmark,
  Coins,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatIdr, formatMasked } from '../lib/formatters';
import { Account } from '../types';

export const AccountsView: React.FC = () => {
  const {
    accounts,
    isPrivacyMode,
    setIsAddAccountOpen,
    setEditingAccount,
    setIsTransferOpen,
    setTransferInitialMode,
  } = useFinance();

  const bankAccounts = accounts.filter((a) => a.type === 'bank');
  const cashAccounts = accounts.filter((a) => a.type === 'cash');
  const ewalletAccounts = accounts.filter((a) => a.type === 'ewallet');

  const totalBankBalance = bankAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const totalCashBalance = cashAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const totalEwalletBalance = ewalletAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const totalLiquid = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  return (
    <div className="space-y-4 animate-in fade-in pb-12">
      {/* Header & Main CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-zinc-100 font-mono">
              LIQUIDITY & BANK ACCOUNTS
            </h2>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#161a25] border border-[#232b3d] text-zinc-400">
              {accounts.length} ACCOUNTS
            </span>
          </div>
          <p className="text-[11px] font-mono text-zinc-500">
            Checking accounts, cash reserves, and inter-account liquidity corridors
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setTransferInitialMode('bank_to_investment');
              setIsTransferOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#131722] hover:bg-[#1a2030] text-indigo-300 font-mono text-xs border border-[#252c40] transition-all cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            <span>BANK → INVESTMENT</span>
          </button>

          <button
            onClick={() => {
              setTransferInitialMode('account_to_account');
              setIsTransferOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#131722] hover:bg-[#1a2030] text-blue-300 font-mono text-xs border border-[#252c40] transition-all cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
            <span>ACCOUNT TRANSFER</span>
          </button>

          <button
            onClick={() => {
              setEditingAccount(null);
              setIsAddAccountOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.8]" />
            <span>+ NEW ACCOUNT</span>
          </button>
        </div>
      </div>

      {/* Overview Statistics by Account Group (4 Cells) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded bg-[#0d1017] border border-[#1b212e]">
          <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
            TOTAL LIQUID CASH
          </span>
          <p className="text-xl sm:text-2xl font-bold text-zinc-100 font-mono tabular-nums mt-0.5">
            {formatMasked(totalLiquid, 'IDR', isPrivacyMode)}
          </p>
          <span className="text-[10px] text-zinc-500 font-mono">Aggregated bank & wallet balances</span>
        </div>

        <div className="p-3.5 rounded bg-[#0d1017] border border-[#1b212e]">
          <div className="flex items-center justify-between text-[10px] font-mono text-blue-400 uppercase tracking-wider">
            <span>BANKS</span>
            <Landmark className="w-3.5 h-3.5" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-blue-400 font-mono tabular-nums mt-0.5">
            {formatMasked(totalBankBalance, 'IDR', isPrivacyMode)}
          </p>
          <span className="text-[10px] text-zinc-500 font-mono">{bankAccounts.length} account(s)</span>
        </div>

        <div className="p-3.5 rounded bg-[#0d1017] border border-[#1b212e]">
          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
            <span>PHYSICAL CASH</span>
            <Coins className="w-3.5 h-3.5" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-emerald-400 font-mono tabular-nums mt-0.5">
            {formatMasked(totalCashBalance, 'IDR', isPrivacyMode)}
          </p>
          <span className="text-[10px] text-zinc-500 font-mono">{cashAccounts.length} wallet(s)</span>
        </div>

        <div className="p-3.5 rounded bg-[#0d1017] border border-[#1b212e]">
          <div className="flex items-center justify-between text-[10px] font-mono text-purple-400 uppercase tracking-wider">
            <span>E-WALLETS</span>
            <Wallet className="w-3.5 h-3.5" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-purple-400 font-mono tabular-nums mt-0.5">
            {formatMasked(totalEwalletBalance, 'IDR', isPrivacyMode)}
          </p>
          <span className="text-[10px] text-zinc-500 font-mono">{ewalletAccounts.length} wallet(s)</span>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {accounts.map((acc) => {
          const accentColor = acc.color || '#3b82f6';

          return (
            <div
              key={acc.id}
              className="relative p-4 rounded bg-[#0d1017] border border-[#1b212e] hover:border-[#2b354a] transition-all group overflow-hidden"
            >
              {/* Top Accent Stripe */}
              <div
                className="absolute top-0 inset-x-0 h-1"
                style={{ backgroundColor: accentColor }}
              />

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                  >
                    {acc.type === 'bank' && <Landmark className="w-4 h-4" />}
                    {acc.type === 'cash' && <Coins className="w-4 h-4" />}
                    {acc.type === 'ewallet' && <Wallet className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-100 text-sm leading-tight font-mono">{acc.name}</h3>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">
                      {acc.type}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingAccount(acc);
                    setIsAddAccountOpen(true);
                  }}
                  className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-[#161a25] transition-colors cursor-pointer"
                  title="Edit account"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Balance */}
              <div className="space-y-0.5 mb-4 font-mono">
                <span className="text-[10px] text-zinc-500 uppercase">AVAILABLE BALANCE</span>
                <p className="text-xl sm:text-2xl font-bold text-zinc-100 tabular-nums">
                  {formatMasked(acc.balance, 'IDR', isPrivacyMode)}
                </p>
                {acc.accountNumber && (
                  <p className="text-[10px] text-zinc-500 tabular-nums">{acc.accountNumber}</p>
                )}
              </div>

              {/* Quick Card Action Buttons */}
              <div className="grid grid-cols-2 gap-1.5 pt-2.5 border-t border-[#1b212e]">
                <button
                  onClick={() => {
                    setTransferInitialMode('account_to_account');
                    setIsTransferOpen(true);
                  }}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-[#10141e] hover:bg-[#161c29] text-zinc-300 font-mono text-xs border border-[#1d2332] transition-colors cursor-pointer"
                >
                  <ArrowRightLeft className="w-3 h-3 text-blue-400" />
                  <span>TRANSFER</span>
                </button>

                <button
                  onClick={() => {
                    setTransferInitialMode('bank_to_investment');
                    setIsTransferOpen(true);
                  }}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-[#10141e] hover:bg-[#161c29] text-zinc-300 font-mono text-xs border border-[#1d2332] transition-colors cursor-pointer"
                >
                  <TrendingUp className="w-3 h-3 text-indigo-400" />
                  <span>FUND INVEST</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
