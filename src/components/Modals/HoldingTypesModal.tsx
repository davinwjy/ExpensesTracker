import React, { useState } from 'react';
import {
  X,
  Plus,
  Layers,
  Trash2,
  AlertCircle,
  Check,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

const COLOR_OPTIONS: { id: string; label: string; class: string; border: string }[] = [
  { id: 'emerald', label: 'Emerald', class: 'bg-emerald-500/15 text-emerald-400', border: 'border-emerald-500/30' },
  { id: 'blue', label: 'Blue', class: 'bg-blue-500/15 text-blue-400', border: 'border-blue-500/30' },
  { id: 'purple', label: 'Purple', class: 'bg-purple-500/15 text-purple-400', border: 'border-purple-500/30' },
  { id: 'amber', label: 'Amber', class: 'bg-amber-500/15 text-amber-400', border: 'border-amber-500/30' },
  { id: 'teal', label: 'Teal', class: 'bg-teal-500/15 text-teal-400', border: 'border-teal-500/30' },
  { id: 'rose', label: 'Rose', class: 'bg-rose-500/15 text-rose-400', border: 'border-rose-500/30' },
  { id: 'indigo', label: 'Indigo', class: 'bg-indigo-500/15 text-indigo-400', border: 'border-indigo-500/30' },
];

export const HoldingTypesModal: React.FC = () => {
  const {
    isHoldingTypesModalOpen,
    setIsHoldingTypesModalOpen,
    holdingTypes,
    addHoldingType,
    deleteHoldingType,
    investments,
  } = useFinance();

  const [label, setLabel] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState<'IDR' | 'USD'>('IDR');
  const [example, setExample] = useState('');
  const [badgeColor, setBadgeColor] = useState('blue');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isHoldingTypesModalOpen) return null;

  const handleClose = () => {
    setLabel('');
    setDefaultCurrency('IDR');
    setExample('');
    setBadgeColor('blue');
    setError('');
    setSuccess('');
    setDeletingId(null);
    setIsHoldingTypesModalOpen(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedLabel = label.trim();
    if (!trimmedLabel) {
      setError('Masukkan nama jenis holdings');
      return;
    }

    setIsSubmitting(true);
    try {
      await addHoldingType({
        label: trimmedLabel,
        defaultCurrency,
        example: example.trim() || undefined,
        badgeColor,
      });

      setSuccess(`Jenis holdings "${trimmedLabel}" berhasil ditambahkan.`);
      setLabel('');
      setExample('');
      setDefaultCurrency('IDR');
    } catch (err: any) {
      setError(err?.message || 'Gagal menambahkan jenis holdings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError('');
    setSuccess('');
    try {
      await deleteHoldingType(id);
      setSuccess('Jenis holdings berhasil dihapus.');
      setDeletingId(null);
    } catch (err: any) {
      setError(err?.message || 'Gagal menghapus jenis holdings');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-[#0d1017] border-t sm:border border-[#1b212e] rounded-t sm:rounded shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] z-10 overflow-hidden animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 sm:fade-in sm:zoom-in-95 font-mono">
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden flex justify-center pt-2 pb-1 shrink-0 bg-[#080a0f]">
          <div className="w-8 h-1 rounded-full bg-zinc-700" />
        </div>

        {/* Command Strip Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-[#1b212e] bg-[#080a0f] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-100 text-xs sm:text-sm tracking-wider uppercase">
                MASTER JENIS HOLDINGS / ASSET CLASSES
              </h3>
              <p className="text-[10px] text-zinc-500">
                Kelola kategori instrumen investasi & mata uang dasar (IDR / USD)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-[#161a25] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain">
          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          {/* Form Create New Holding Type */}
          <form onSubmit={handleAdd} className="p-3.5 rounded bg-[#080a0f] border border-[#1d2332] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1a1f2c]">
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3 h-3" />
                <span>TAMBAH JENIS HOLDINGS BARU</span>
              </span>
              <span className="text-[9px] text-zinc-500">MASTER DATA</span>
            </div>

            {/* Name / Label */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                NAMA JENIS HOLDINGS <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Emas / Gold, Obligasi (SBN), P2P Lending, Properti..."
                className="w-full bg-[#0d1017] border border-[#1d2332] focus:border-indigo-500 rounded px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none font-mono"
                required
              />
            </div>

            {/* Currency Choice */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                MATA UANG DASAR (CURRENCY) <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setDefaultCurrency('IDR')}
                  className={`py-1.5 px-3 rounded text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    defaultCurrency === 'IDR'
                      ? 'bg-[#1b212e] text-emerald-400 border border-emerald-500/50 shadow-sm'
                      : 'bg-[#0d1017] text-zinc-400 hover:text-zinc-200 border border-[#1a1f2c]'
                  }`}
                >
                  <span>Rp IDR (Rupiah)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDefaultCurrency('USD')}
                  className={`py-1.5 px-3 rounded text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    defaultCurrency === 'USD'
                      ? 'bg-[#1b212e] text-indigo-400 border border-indigo-500/50 shadow-sm'
                      : 'bg-[#0d1017] text-zinc-400 hover:text-zinc-200 border border-[#1a1f2c]'
                  }`}
                >
                  <span>$ USD (US Dollar)</span>
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">
                Aset yang menggunakan jenis ini akan otomatis dinilai dalam {defaultCurrency}.
              </p>
            </div>

            {/* Example / Notes */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                CONTOH INSTRUMEN / PLATFORM (OPSIONAL)
              </label>
              <input
                type="text"
                value={example}
                onChange={(e) => setExample(e.target.value)}
                placeholder="e.g. Antam, Pluang Gold, ORI, Sukuk, KoinWorks..."
                className="w-full bg-[#0d1017] border border-[#1d2332] focus:border-indigo-500 rounded px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none font-mono"
              />
            </div>

            {/* Color Accent */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                WARNA BADGE
              </label>
              <div className="flex flex-wrap gap-1">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setBadgeColor(c.id)}
                    className={`px-2 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${c.class} ${
                      badgeColor === c.id ? `${c.border} ring-1 ring-white/30` : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-all disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'MENYIMPAN...' : '+ TAMBAHKAN JENIS HOLDINGS'}</span>
              </button>
            </div>
          </form>

          {/* List of Existing Holding Types */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                DAFTAR JENIS HOLDINGS TERSEDIA ({holdingTypes.length})
              </span>
              <span className="text-[9px] text-zinc-500 font-mono">IDR & USD</span>
            </div>

            <div className="divide-y divide-[#171b26] rounded border border-[#1d2332] bg-[#080a0f] overflow-hidden">
              {holdingTypes.map((ht) => {
                const isUsd = ht.defaultCurrency === 'USD';
                const taggedCount = investments.filter((i) => i.category === ht.id).length;

                return (
                  <div
                    key={ht.id}
                    className="p-3 flex items-center justify-between gap-2 hover:bg-[#0d1017] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-zinc-100">{ht.label}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                            isUsd
                              ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {ht.defaultCurrency}
                        </span>
                        {ht.isSystem && (
                          <span className="text-[8px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            <span>DEFAULT</span>
                          </span>
                        )}
                      </div>
                      {ht.example && (
                        <p className="text-[10px] text-zinc-500 mt-0.5 truncate">{ht.example}</p>
                      )}
                      <p className="text-[9px] text-zinc-600 mt-0.5 flex items-center gap-1 font-mono">
                        <TrendingUp className="w-2.5 h-2.5 text-zinc-500" />
                        <span>{taggedCount} active asset{taggedCount !== 1 ? 's' : ''} in portfolio</span>
                      </p>
                    </div>

                    {!ht.isSystem && (
                      <div>
                        {deletingId === ht.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDelete(ht.id)}
                              className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold cursor-pointer"
                            >
                              HAPUS?
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingId(null)}
                              className="px-1.5 py-1 text-zinc-400 hover:text-white text-[10px]"
                            >
                              BATAL
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeletingId(ht.id)}
                            title="Hapus jenis holdings"
                            disabled={taggedCount > 0}
                            className={`p-1.5 rounded transition-colors ${
                              taggedCount > 0
                                ? 'text-zinc-700 cursor-not-allowed'
                                : 'text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Command Strip Footer */}
        <div className="shrink-0 p-3 bg-[#080a0f] border-t border-[#1b212e] flex items-center justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="px-3.5 py-1.5 rounded text-xs font-semibold text-zinc-300 hover:text-white bg-[#131722] hover:bg-[#1a2030] border border-[#21293a] transition-colors cursor-pointer"
          >
            TUTUP
          </button>
        </div>
      </div>
    </div>
  );
};
