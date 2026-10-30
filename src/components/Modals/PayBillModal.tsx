import React, { useState, useEffect } from 'react';
import { X, Check, CreditCard, RotateCcw, AlertCircle, ArrowRightLeft } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatIdr } from '../../lib/formatters';

export const PayBillModal: React.FC = () => {
  const {
    isPayBillOpen,
    setIsPayBillOpen,
    payBillCard,
    setPayBillCard,
    accounts,
    payCreditCardBill,
  } = useFinance();

  const creditCards = accounts.filter((a) => a.type === 'credit_card' || a.type === 'paylater');
  const fundingAccounts = accounts.filter((a) => a.type === 'bank' || a.type === 'cash');

  const [creditCardAccountId, setCreditCardAccountId] = useState<string>('');
  const [sourceAccountId, setSourceAccountId] = useState<string>('');
  const [amountIdr, setAmountIdr] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isPayBillOpen) {
      setIsSubmitting(false);
      if (payBillCard) {
        setCreditCardAccountId(payBillCard.id);
        setAmountIdr(payBillCard.balance > 0 ? payBillCard.balance.toString() : '');
      } else if (creditCards.length > 0) {
        setCreditCardAccountId(creditCards[0].id);
        setAmountIdr(creditCards[0].balance > 0 ? creditCards[0].balance.toString() : '');
      }

      if (fundingAccounts.length > 0) {
        setSourceAccountId(fundingAccounts[0].id);
      }

      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setError('');
    }
  }, [isPayBillOpen, payBillCard, accounts]);

  // When selected credit card changes, update default amount to its current balance
  useEffect(() => {
    if (creditCardAccountId) {
      const card = accounts.find((a) => a.id === creditCardAccountId);
      if (card && card.balance > 0) {
        setAmountIdr(card.balance.toString());
      }
    }
  }, [creditCardAccountId, accounts]);

  const resetForm = () => {
    setIsSubmitting(false);
    if (creditCards.length > 0) {
      setCreditCardAccountId(creditCards[0].id);
      setAmountIdr(creditCards[0].balance > 0 ? creditCards[0].balance.toString() : '');
    }
    if (fundingAccounts.length > 0) {
      setSourceAccountId(fundingAccounts[0].id);
    }
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    setPayBillCard(null);
    setIsPayBillOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = Number(amountIdr);
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Please enter a valid payment amount greater than 0');
      return;
    }

    if (!creditCardAccountId) {
      setError('Please select a credit card to pay');
      return;
    }

    if (!sourceAccountId) {
      setError('Please select a funding source account (Bank or Cash)');
      return;
    }

    const sourceAcc = accounts.find((a) => a.id === sourceAccountId);
    if (sourceAcc && sourceAcc.balance < parsedAmount) {
      setError(`Insufficient balance in ${sourceAcc.name} (Available: ${formatIdr(sourceAcc.balance)})`);
      return;
    }

    setIsSubmitting(true);
    try {
      await payCreditCardBill({
        creditCardAccountId,
        sourceAccountId,
        amountIdr: parsedAmount,
        date,
        notes: notes.trim() || undefined,
      });

      handleClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to pay credit card bill');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isPayBillOpen) return null;

  const selectedCard = accounts.find((a) => a.id === creditCardAccountId);
  const selectedSource = accounts.find((a) => a.id === sourceAccountId);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-lg bg-[#0d1017] border-t sm:border border-[#1b212e] rounded-t sm:rounded shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] z-10 overflow-hidden animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 sm:fade-in sm:zoom-in-95 font-mono">
        <div className="sm:hidden flex justify-center pt-2 pb-1 shrink-0 bg-[#080a0f]">
          <div className="w-8 h-1 rounded-full bg-zinc-700" />
        </div>

        <div className="flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-[#1b212e] bg-[#080a0f] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-100 text-xs sm:text-sm tracking-wider uppercase">
                SETTLE CREDIT CARD BILL ("BAYAR TAGIHAN")
              </h3>
              <p className="text-[10px] text-zinc-500">
                Transfer funds from bank/cash to clear statement balance and restore credit limit
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={resetForm}
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

        <form id="pay-bill-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3.5 overscroll-contain">
          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Target Credit Card */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              TARGET CREDIT CARD (DEBT TO SETTLE) <span className="text-rose-400">*</span>
            </label>
            <select
              value={creditCardAccountId}
              onChange={(e) => setCreditCardAccountId(e.target.value)}
              className="w-full bg-[#080a0f] border border-[#1d2332] focus:border-amber-500 rounded px-3 py-2 text-xs text-zinc-100 focus:outline-none font-mono"
              required
            >
              {creditCards.length === 0 && <option value="">No credit cards found - create one in Accounts</option>}
              {creditCards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name} ({card.cardNetwork || 'CC'}) — Outstanding Debt: {formatIdr(card.balance)}
                </option>
              ))}
            </select>
            {selectedCard && (
              <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-500 px-1 font-mono">
                <span>CREDIT LIMIT: {formatIdr(selectedCard.creditLimit || 0)}</span>
                <span className="text-amber-400 font-bold">CURRENT DEBT: {formatIdr(selectedCard.balance)}</span>
              </div>
            )}
          </div>

          {/* Funding Source Account */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              FUNDING SOURCE (BANK / CASH) <span className="text-rose-400">*</span>
            </label>
            <select
              value={sourceAccountId}
              onChange={(e) => setSourceAccountId(e.target.value)}
              className="w-full bg-[#080a0f] border border-[#1d2332] focus:border-emerald-500 rounded px-3 py-2 text-xs text-zinc-100 focus:outline-none font-mono"
              required
            >
              {fundingAccounts.length === 0 && <option value="">No bank/cash accounts found</option>}
              {fundingAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type.toUpperCase()}) — Available: {formatIdr(acc.balance)}
                </option>
              ))}
            </select>
            {selectedSource && (
              <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-500 px-1 font-mono">
                <span>AVAILABLE LIQUID:</span>
                <span className="text-emerald-400 font-bold">{formatIdr(selectedSource.balance)}</span>
              </div>
            )}
          </div>

          {/* Payment Amount IDR */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              PAYMENT AMOUNT (IDR) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">
                Rp
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={amountIdr}
                onChange={(e) => setAmountIdr(e.target.value)}
                placeholder="0"
                className="w-full bg-[#080a0f] border border-[#1d2332] focus:border-amber-500 rounded pl-9 pr-3 py-2 text-sm font-bold text-zinc-100 placeholder-zinc-600 focus:outline-none font-mono tabular-nums"
                required
              />
            </div>
            {amountIdr && !isNaN(Number(amountIdr)) && Number(amountIdr) > 0 && (
              <div className="mt-1 flex items-center justify-between px-1 text-[11px] font-mono">
                <span className="text-zinc-500">PAYMENT TOTAL:</span>
                <span className="font-bold text-amber-400 tabular-nums">{formatIdr(Number(amountIdr))}</span>
              </div>
            )}
            {selectedCard && (
              <div className="flex gap-1.5 mt-2">
                <button
                  type="button"
                  onClick={() => setAmountIdr(selectedCard.balance.toString())}
                  className="px-2 py-1 rounded bg-[#080a0f] hover:bg-[#161a25] text-[10px] text-amber-300 border border-[#1d2332] cursor-pointer font-mono"
                >
                  Pay Full Debt ({formatIdr(selectedCard.balance)})
                </button>
              </div>
            )}
          </div>

          {/* Date & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                VALUE DATE
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#080a0f] border border-[#1d2332] focus:border-amber-500 rounded px-3 py-2 text-xs text-zinc-100 focus:outline-none font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                MEMO / DESCRIPTOR
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Monthly CC statement settlement"
                className="w-full bg-[#080a0f] border border-[#1d2332] focus:border-amber-500 rounded px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none font-mono"
              />
            </div>
          </div>
        </form>

        <div className="shrink-0 p-3 bg-[#080a0f] border-t border-[#1b212e] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-3 py-1.5 rounded text-xs font-semibold text-zinc-400 hover:text-white hover:bg-[#161a25] transition-colors cursor-pointer"
          >
            DISCARD
          </button>
          <button
            type="submit"
            form="pay-bill-form"
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isSubmitting ? 'PROCESSING...' : 'SETTLE BILL'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
