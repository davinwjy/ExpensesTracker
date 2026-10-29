import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  ArrowRightLeft,
  TrendingUp,
  AlertCircle,
  RotateCcw,
  Plus,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatIdr, formatUsd } from '../../lib/formatters';
import { InvestmentCategory } from '../../types';

const CATEGORY_OPTIONS: { id: InvestmentCategory; label: string; currency: 'IDR' | 'USD'; badge: string }[] = [
  { id: 'Saham', label: 'Saham', currency: 'IDR', badge: 'IDR Stock' },
  { id: 'ETF USA', label: 'ETF USA', currency: 'USD', badge: 'USD ETF' },
  { id: 'Bitcoin', label: 'Bitcoin', currency: 'IDR', badge: 'Crypto' },
  { id: 'RDPU', label: 'RDPU', currency: 'IDR', badge: 'Mutual Fund' },
  { id: 'USD', label: 'USD Cash', currency: 'USD', badge: 'USD Buffer' },
];

const PLATFORM_SUGGESTIONS = [
  'Stockbit',
  'Bibit',
  'Gotrade',
  'Ajaib',
  'Tokocrypto',
  'Indodax',
  'Interactive Brokers',
  'BCA Sekuritas',
];

export const TransferModal: React.FC = () => {
  const {
    isTransferOpen,
    setIsTransferOpen,
    transferInitialMode,
    accounts,
    investments,
    usdIdrRate,
    transferFunds,
  } = useFinance();

  const [mode, setMode] = useState<'account_to_account' | 'bank_to_investment'>('bank_to_investment');
  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [toInvestmentId, setToInvestmentId] = useState<string>('');

  // Target investment choice: 'existing' or 'new'
  const [targetType, setTargetType] = useState<'existing' | 'new'>('existing');

  // New investment fields
  const [newInvName, setNewInvName] = useState<string>('');
  const [newInvCategory, setNewInvCategory] = useState<InvestmentCategory>('Saham');
  const [newInvPlatform, setNewInvPlatform] = useState<string>('');
  const [newInvUnits, setNewInvUnits] = useState<string>('');

  const [amountIdr, setAmountIdr] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<string>(usdIdrRate.toString());
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isTransferOpen) {
      setMode(transferInitialMode || 'bank_to_investment');
      resetFields();
    }
  }, [isTransferOpen, transferInitialMode, accounts, investments, usdIdrRate]);

  const resetFields = () => {
    setFromAccountId(accounts.length > 0 ? accounts[0].id : '');
    if (accounts.length > 1) {
      setToAccountId(accounts[1].id);
    } else {
      setToAccountId('');
    }
    setToInvestmentId(investments.length > 0 ? investments[0].id : '');
    setTargetType(investments.length === 0 ? 'new' : 'existing');
    setNewInvName('');
    setNewInvCategory('Saham');
    setNewInvPlatform('');
    setNewInvUnits('');
    setAmountIdr('');
    setExchangeRate(usdIdrRate.toString());
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setError('');
  };

  const handleClose = () => {
    resetFields();
    setIsTransferOpen(false);
  };

  const selectedSourceAccount = accounts.find((a) => a.id === fromAccountId);
  const selectedDestAccount = accounts.find((a) => a.id === toAccountId);
  const selectedInvestment = investments.find((i) => i.id === toInvestmentId);

  const numericAmount = Number(amountIdr) || 0;
  const numericRate = Number(exchangeRate) || usdIdrRate;

  const isNewInvestmentUsd = newInvCategory === 'USD' || newInvCategory === 'ETF USA';
  const isUsdTarget =
    mode === 'bank_to_investment' &&
    (targetType === 'existing'
      ? selectedInvestment?.currency === 'USD'
      : isNewInvestmentUsd);

  const calculatedUsdAmount = isUsdTarget && numericRate > 0 ? numericAmount / numericRate : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fromAccountId) {
      setError('Please select a source account (Bank or Cash)');
      return;
    }

    if (numericAmount <= 0) {
      setError('Please enter a valid amount in IDR');
      return;
    }

    if (selectedSourceAccount && selectedSourceAccount.balance < numericAmount) {
      // In sandbox iframes window.confirm is blocked; allow user to proceed with negative/overdrawn balance notice displayed in UI
    }

    if (mode === 'account_to_account') {
      if (!toAccountId) {
        setError('Please select a destination account');
        return;
      }
      if (fromAccountId === toAccountId) {
        setError('Source and destination accounts must be different');
        return;
      }
    } else {
      if (targetType === 'existing') {
        if (!toInvestmentId) {
          setError('Please select an existing investment holding or switch to "+ New Asset"');
          return;
        }
      } else {
        if (!newInvName.trim()) {
          setError('Please enter a name for the new investment holding (e.g. BBCA, S&P 500 VOO, Bitcoin)');
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      await transferFunds({
        type: mode,
        fromAccountId,
        toAccountId: mode === 'account_to_account' ? toAccountId : undefined,
        toInvestmentId: mode === 'bank_to_investment' && targetType === 'existing' ? toInvestmentId : undefined,
        newInvestment:
          mode === 'bank_to_investment' && targetType === 'new'
            ? {
                name: newInvName.trim(),
                category: newInvCategory,
                platform: newInvPlatform.trim() || undefined,
                units: newInvUnits && !isNaN(Number(newInvUnits)) ? Number(newInvUnits) : undefined,
                notes: notes.trim() || undefined,
              }
            : undefined,
        amountIdr: numericAmount,
        exchangeRate: isUsdTarget ? numericRate : undefined,
        date,
        notes: notes.trim() || undefined,
      });

      handleClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to complete transfer');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isTransferOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] z-10 overflow-hidden animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 sm:fade-in sm:zoom-in-95">
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-700/80" />
        </div>

        {/* Sticky Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${
                mode === 'bank_to_investment'
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}
            >
              {mode === 'bank_to_investment' ? (
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base leading-tight">
                {mode === 'bank_to_investment' ? 'Fund Investment from Bank' : 'Move Bank to Cash'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                {mode === 'bank_to_investment'
                  ? 'Fund existing or brand-new investment directly'
                  : 'Inter-account fund transfer'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={resetFields}
              title="Reset fields"
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="transfer-modal-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain"
        >
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Primary Mode Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode('bank_to_investment')}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'bank_to_investment'
                  ? 'bg-indigo-600 text-white shadow font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>To Investment</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('account_to_account')}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'account_to_account'
                  ? 'bg-blue-600 text-white shadow font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Bank ↔ Cash</span>
            </button>
          </div>

          {/* Source Account */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Source Funding Account (Bank / Cash) <span className="text-rose-400">*</span>
            </label>
            <select
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white focus:outline-none"
              required
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type.toUpperCase()}) — Balance: {formatIdr(acc.balance)}
                </option>
              ))}
            </select>
            {selectedSourceAccount && (
              <div className="flex items-center justify-between mt-1 text-[11px]">
                <span className="text-slate-400">
                  Available balance:{' '}
                  <span className="font-semibold text-emerald-400">{formatIdr(selectedSourceAccount.balance)}</span>
                </span>
                {numericAmount > selectedSourceAccount.balance && (
                  <span className="text-amber-400 font-medium">
                    (Overdrawn by {formatIdr(numericAmount - selectedSourceAccount.balance)})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Destination: Investment OR Account */}
          {mode === 'bank_to_investment' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Target Investment <span className="text-rose-400">*</span>
                </label>

                {/* Sub-toggle: Existing vs New Holding */}
                <div className="flex p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setTargetType('existing')}
                    disabled={investments.length === 0}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      targetType === 'existing'
                        ? 'bg-indigo-600 text-white font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    <span>Existing ({investments.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetType('new')}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                      targetType === 'new'
                        ? 'bg-emerald-600 text-white font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ New Asset</span>
                  </button>
                </div>
              </div>

              {/* OPTION A: Existing Investment */}
              {targetType === 'existing' && (
                <div className="space-y-2">
                  {investments.length === 0 ? (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-amber-300 flex items-center gap-2">
                      <Info className="w-4 h-4 shrink-0" />
                      <span>No holdings yet. Switch to "+ New Asset" above to create and fund one directly!</span>
                    </div>
                  ) : (
                    <>
                      <select
                        value={toInvestmentId}
                        onChange={(e) => setToInvestmentId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white focus:outline-none"
                        required
                      >
                        {investments.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            [{inv.category}] {inv.name} ({inv.currency})
                          </option>
                        ))}
                      </select>
                      {selectedInvestment && (
                        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-300 flex items-center justify-between">
                          <span>
                            Category: <strong className="text-white">{selectedInvestment.category}</strong>
                          </span>
                          <span>
                            Denominated in:{' '}
                            <strong
                              className={
                                selectedInvestment.currency === 'USD' ? 'text-emerald-400' : 'text-blue-400'
                              }
                            >
                              {selectedInvestment.currency}
                            </strong>
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* OPTION B: Brand-New Investment (Created & funded simultaneously) */}
              {targetType === 'new' && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-3.5 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>New Investment Setup</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Created & funded in 1 step</span>
                  </div>

                  {/* Asset Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Asset / Holding Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newInvName}
                      onChange={(e) => setNewInvName(e.target.value)}
                      placeholder="e.g. BBCA, S&P 500 (VOO), Bitcoin, Sucorinvest RDPU..."
                      className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
                      required
                    />
                  </div>

                  {/* Category Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Asset Class / Category <span className="text-rose-400">*</span>
                      </label>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isNewInvestmentUsd
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {isNewInvestmentUsd ? 'USD Denominated' : 'IDR Denominated'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {CATEGORY_OPTIONS.map((cat) => {
                        const isSelected = newInvCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setNewInvCategory(cat.id)}
                            className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-sm'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                            }`}
                          >
                            <div className="font-bold text-xs">{cat.label}</div>
                            <div className="text-[10px] text-slate-400">{cat.badge}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Platform / Broker & Units */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Platform / Broker (Optional)
                      </label>
                      <input
                        type="text"
                        value={newInvPlatform}
                        onChange={(e) => setNewInvPlatform(e.target.value)}
                        placeholder="e.g. Stockbit, Bibit, Gotrade"
                        className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                      />
                      {/* Quick platform pills */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {PLATFORM_SUGGESTIONS.slice(0, 4).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setNewInvPlatform(p)}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Units / Shares / Lots (Optional)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={newInvUnits}
                        onChange={(e) => setNewInvUnits(e.target.value)}
                        placeholder="e.g. 10 lots or 1.25 shares"
                        className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Leave empty if tracking value only</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Destination Account (Bank / Cash) <span className="text-rose-400">*</span>
              </label>
              <select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white focus:outline-none"
                required
              >
                {accounts
                  .filter((a) => a.id !== fromAccountId)
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.type.toUpperCase()}) — Balance: {formatIdr(acc.balance)}
                    </option>
                  ))}
              </select>
              {selectedDestAccount && (
                <p className="text-[11px] text-slate-400 mt-1">
                  Current balance:{' '}
                  <span className="font-semibold text-emerald-400">{formatIdr(selectedDestAccount.balance)}</span>
                </p>
              )}
            </div>
          )}

          {/* Amount in IDR */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Funding Amount to Deduct from Bank (IDR) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                Rp
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={amountIdr}
                onChange={(e) => setAmountIdr(e.target.value)}
                placeholder="1,000,000"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-3 text-lg font-bold text-white placeholder-slate-600 focus:outline-none font-mono"
                required
              />
            </div>
            {amountIdr && !isNaN(Number(amountIdr)) && Number(amountIdr) > 0 && (
              <div className="mt-1.5 flex items-center justify-between px-1 text-xs font-mono">
                <span className="text-slate-400 font-sans text-[11px]">Formatted nominal:</span>
                <span className="font-bold text-indigo-400">{formatIdr(Number(amountIdr))}</span>
              </div>
            )}
          </div>

          {/* USD Conversion Box (Shown when target is in USD, whether existing or new) */}
          {mode === 'bank_to_investment' && isUsdTarget && (
            <div className="p-3.5 bg-indigo-950/20 border border-indigo-500/30 rounded-xl space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="text-indigo-300 font-medium">USD Conversion Credit:</span>
                <span className="text-emerald-400 font-bold text-base font-mono">
                  {formatUsd(calculatedUsdAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 pt-1 border-t border-indigo-500/20 text-xs">
                <label className="text-slate-400 text-[11px]">Exchange Rate (IDR/USD):</label>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 text-xs">Rp</span>
                  <input
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(e.target.value)}
                    className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-base sm:text-xs text-white text-right font-mono"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                * {formatIdr(numericAmount)} will be deducted from {selectedSourceAccount?.name || 'bank'}, and{' '}
                {formatUsd(calculatedUsdAmount)} will be credited to{' '}
                {targetType === 'existing' ? selectedInvestment?.name : newInvName || 'your new investment'}.
              </p>
            </div>
          )}

          {/* Date & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Monthly DCA, initial deposit..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>
        </form>

        {/* Sticky Docked Footer */}
        <div className="shrink-0 p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="transfer-modal-form"
            disabled={isSubmitting}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all cursor-pointer shadow-lg ${
              mode === 'bank_to_investment'
                ? targetType === 'new'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
            } disabled:opacity-50`}
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>
              {isSubmitting
                ? 'Processing...'
                : mode === 'bank_to_investment' && targetType === 'new'
                ? 'Create & Fund Investment'
                : 'Confirm Transfer'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
