import React, { useState, useEffect } from 'react';
import { X, Check, CreditCard, RotateCcw, AlertCircle, Trash2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { AccountType } from '../../types';
import { formatIdr } from '../../lib/formatters';

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#6366f1', // indigo
  '#06b6d4', // cyan
  '#a855f7', // purple
  '#f59e0b', // amber
  '#f43f5e', // rose
  '#64748b', // slate
];

export const AccountModal: React.FC = () => {
  const {
    isAddAccountOpen,
    setIsAddAccountOpen,
    editingAccount,
    setEditingAccount,
    addAccount,
    updateAccount,
    deleteAccount,
  } = useFinance();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [balance, setBalance] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (isAddAccountOpen) {
      if (editingAccount) {
        setName(editingAccount.name);
        setType(editingAccount.type);
        setBalance(editingAccount.balance.toString());
        setAccountNumber(editingAccount.accountNumber || '');
        setColor(editingAccount.color || '#3b82f6');
      } else {
        resetFields();
      }
      setError('');
      setConfirmDelete(false);
    }
  }, [isAddAccountOpen, editingAccount]);

  const resetFields = () => {
    setName('');
    setType('bank');
    setBalance('0');
    setAccountNumber('');
    setColor('#3b82f6');
    setError('');
  };

  const handleClose = () => {
    resetFields();
    setEditingAccount(null);
    setIsAddAccountOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter an account name');
      return;
    }

    const parsedBalance = Number(balance);
    if (isNaN(parsedBalance)) {
      setError('Please enter a valid numeric balance');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, {
          name: name.trim(),
          type,
          balance: parsedBalance,
          accountNumber: accountNumber.trim() || undefined,
          color,
        });
      } else {
        await addAccount({
          name: name.trim(),
          type,
          balance: parsedBalance,
          accountNumber: accountNumber.trim() || undefined,
          color,
        });
      }

      handleClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingAccount) return;
    setIsSubmitting(true);
    try {
      await deleteAccount(editingAccount.id);
      handleClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete account');
      setIsSubmitting(false);
    }
  };

  if (!isAddAccountOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-[#0d1017] border-t sm:border border-[#1b212e] rounded-t sm:rounded shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] z-10 overflow-hidden animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 sm:fade-in sm:zoom-in-95 font-mono">
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden flex justify-center pt-2 pb-1 shrink-0 bg-[#080a0f]">
          <div className="w-8 h-1 rounded-full bg-zinc-700" />
        </div>

        {/* Command Strip Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-[#1b212e] bg-[#080a0f] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-100 text-xs sm:text-sm tracking-wider uppercase">
                {editingAccount ? 'EDIT ACCOUNT RECORD' : 'CREATE ACCOUNT RECORD'}
              </h3>
              <p className="text-[10px] text-zinc-500">
                {editingAccount ? 'Update account parameters or balance' : 'Custom Bank, E-Wallet or Physical Cash'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={resetFields}
              title="Reset fields"
              className="p-1 text-zinc-400 hover:text-white rounded hover:bg-[#161a25] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 text-zinc-400 hover:text-white rounded hover:bg-[#161a25] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form id="account-modal-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3.5 overscroll-contain">
          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Account Type Selector */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              ACCOUNT TYPE
            </label>
            <div className="grid grid-cols-3 p-0.5 bg-[#080a0f] rounded border border-[#1d2332] text-xs font-semibold">
              <button
                type="button"
                onClick={() => setType('bank')}
                className={`py-1.5 rounded transition-all cursor-pointer ${
                  type === 'bank' ? 'bg-[#1b212e] text-emerald-400 border border-[#2a3449] font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                BANK
              </button>
              <button
                type="button"
                onClick={() => setType('cash')}
                className={`py-1.5 rounded transition-all cursor-pointer ${
                  type === 'cash' ? 'bg-[#1b212e] text-emerald-400 border border-[#2a3449] font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                CASH
              </button>
              <button
                type="button"
                onClick={() => setType('ewallet')}
                className={`py-1.5 rounded transition-all cursor-pointer ${
                  type === 'ewallet' ? 'bg-[#1b212e] text-emerald-400 border border-[#2a3449] font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                E-WALLET
              </button>
            </div>
          </div>

          {/* Account Name */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              ACCOUNT IDENTIFIER <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. BCA Main, Mandiri, Cash Dompet..."
              className="w-full bg-[#080a0f] border border-[#1d2332] focus:border-emerald-500 rounded px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none"
              required
              autoFocus
            />
          </div>

          {/* Balance (IDR) */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              CURRENT BALANCE (IDR) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">
                Rp
              </span>
              <input
                type="number"
                step="any"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0"
                className="w-full bg-[#080a0f] border border-[#1d2332] focus:border-emerald-500 rounded pl-9 pr-3 py-2 text-xs font-bold text-zinc-100 placeholder-zinc-600 focus:outline-none font-mono tabular-nums"
                required
              />
            </div>
            {balance && !isNaN(Number(balance)) && (
              <div className="mt-1 flex items-center justify-between px-1 text-[11px] font-mono">
                <span className="text-zinc-500">FORMATTED VALUE:</span>
                <span className="font-bold text-emerald-400 tabular-nums">{formatIdr(Number(balance))}</span>
              </div>
            )}
          </div>

          {/* Account Number (Optional) */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              ACCOUNT NUMBER / MAPPING (OPTIONAL)
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="e.g. 521098231 or •••• 4821"
              className="w-full bg-[#080a0f] border border-[#1d2332] focus:border-emerald-500 rounded px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none"
            />
          </div>

          {/* Color Tag */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              COLOR ACCENT
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded border transition-transform cursor-pointer ${
                    color === c ? 'scale-110 border-white' : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </form>

        {/* Command Strip Footer */}
        <div className="shrink-0 p-3 bg-[#080a0f] border-t border-[#1b212e] flex items-center justify-between gap-2">
          {editingAccount ? (
            confirmDelete ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="px-2.5 py-1.5 rounded bg-rose-600 text-xs font-bold text-white hover:bg-rose-500"
                >
                  CONFIRM PURGE
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1.5 text-xs text-zinc-400 hover:text-white"
                >
                  CANCEL
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>DELETE</span>
              </button>
            )
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 rounded text-xs font-semibold text-zinc-400 hover:text-white hover:bg-[#161a25] transition-colors cursor-pointer"
            >
              DISCARD
            </button>
            <button
              type="submit"
              form="account-modal-form"
              disabled={isSubmitting}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{isSubmitting ? 'SAVING...' : editingAccount ? 'UPDATE' : 'COMMIT'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
