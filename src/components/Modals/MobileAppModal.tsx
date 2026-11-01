import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  ExternalLink,
  X,
  Share2,
  PlusSquare,
  ShieldCheck,
  Flame,
  Sparkles,
  Pencil,
  RotateCcw,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useAuth } from '../../context/AuthContext';
import { defaultFirebaseConfig } from '../../lib/defaultFirebaseConfig';

interface MobileAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAppModal: React.FC<MobileAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk'>('pwa');
  const [installSuccess, setInstallSuccess] = useState(false);

  const [apkDownloadUrl, setApkDownloadUrl] = useState<string>(() => {
    try {
      return (
        localStorage.getItem('wealthtrack_custom_apk_url') ||
        'https://github.com/davinwijaya1996/Expenses-Tracker-2/releases/latest/download/WealthTrack-Pro.apk'
      );
    } catch {
      return 'https://github.com/davinwijaya1996/Expenses-Tracker-2/releases/latest/download/WealthTrack-Pro.apk';
    }
  });
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [tempUrl, setTempUrl] = useState(apkDownloadUrl);

  const handleSaveUrl = () => {
    const trimmed = tempUrl.trim();
    if (trimmed) {
      setApkDownloadUrl(trimmed);
      try {
        localStorage.setItem('wealthtrack_custom_apk_url', trimmed);
      } catch {}
    }
    setIsEditingUrl(false);
  };

  const handleResetUrl = () => {
    const defaultUrl = 'https://github.com/davinwijaya1996/Expenses-Tracker-2/releases/latest/download/WealthTrack-Pro.apk';
    setApkDownloadUrl(defaultUrl);
    setTempUrl(defaultUrl);
    try {
      localStorage.removeItem('wealthtrack_custom_apk_url');
    } catch {}
    setIsEditingUrl(false);
  };

  if (!isOpen) return null;

  const handlePwaInstall = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => onClose(), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-xl bg-[#0d1017] border-t sm:border border-[#1b212e] rounded-t sm:rounded shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] z-10 overflow-hidden animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 sm:fade-in sm:zoom-in-95 font-mono">
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden flex justify-center pt-2 pb-1 shrink-0 bg-[#080a0f]">
          <div className="w-8 h-1 rounded-full bg-zinc-700" />
        </div>

        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-[#1b212e] bg-[#080a0f] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-zinc-100 uppercase tracking-wider">WEALTHTRACK CLIENT TELEMETRY</h3>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  ANDROID & iOS
                </span>
              </div>
              <p className="text-[10px] text-zinc-500">Local Device Installation & Real-Time Replication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-[#161a25] transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sync Status Banner */}
        <div className="px-3.5 sm:px-4 py-2 bg-[#080a0f] border-b border-[#1b212e] flex items-center gap-2 text-[11px] text-emerald-400 shrink-0">
          <Flame className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <div className="truncate">
            <strong>REPLICATION STATUS:</strong> CONNECTED TO{' '}
            <span className="font-mono text-zinc-200">{defaultFirebaseConfig?.projectId || 'expenses-tracker-davin'}</span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 space-y-3.5 overflow-y-auto flex-1 min-h-0">
          {/* Tabs: PWA 1-Click vs Direct APK */}
          <div className="grid grid-cols-2 p-0.5 bg-[#080a0f] border border-[#1d2332] rounded text-xs font-semibold">
            <button
              onClick={() => setActiveTab('pwa')}
              className={`py-1.5 px-3 rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'pwa'
                  ? 'bg-[#1b212e] text-emerald-400 border border-[#2a3449] font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>PWA DEPLOYMENT</span>
            </button>
            <button
              onClick={() => setActiveTab('apk')}
              className={`py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'apk'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>File APK Standalone</span>
            </button>
          </div>

          {activeTab === 'pwa' ? (
            <div className="space-y-3.5">
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="text-xs space-y-1">
                    <h4 className="font-bold text-white text-sm">Instalasi 1-Klik Langsung</h4>
                    <p className="text-slate-300 leading-relaxed">
                      Cara termudah untuk Android & iPhone. Aplikasi terpasang di layar utama dengan ikon resmi, layar penuh (fullscreen tanpa address bar), dan auto-update.
                    </p>
                  </div>
                </div>

                {/* Android / Desktop Prompt Button */}
                {isInstallable && (
                  <button
                    onClick={handlePwaInstall}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-[0.99]"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Pasang Aplikasi ke Layar Utama HP</span>
                  </button>
                )}

                {installSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Aplikasi berhasil terpasang di HP Anda!</span>
                  </div>
                )}

                {/* Instructions for Android Chrome */}
                {!isInstallable && !isIOS && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                    <p className="font-semibold text-slate-200">Cara pasang di Google Chrome (Android):</p>
                    <ol className="space-y-1 text-slate-400 list-decimal list-inside pl-1 text-[11px] leading-relaxed">
                      <li>Buka website ini di Google Chrome di HP Anda.</li>
                      <li>Ketuk ikon titik tiga (<strong>⋮</strong>) di pojok kanan atas Chrome.</li>
                      <li>Pilih menu <strong>"Tambahkan ke Layar Utama"</strong> (atau <strong>"Install app"</strong>).</li>
                      <li>WealthTrack Pro langsung muncul di menu aplikasi HP Anda!</li>
                    </ol>
                  </div>
                )}

                {/* iOS Instructions */}
                {isIOS && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                    <p className="font-semibold text-slate-200">Cara pasang di Safari (iPhone / iPad):</p>
                    <ol className="space-y-1 text-slate-400 list-decimal list-inside pl-1 text-[11px] leading-relaxed">
                      <li className="flex items-center gap-1">
                        <span>1. Ketuk tombol</span>
                        <Share2 className="w-3.5 h-3.5 text-sky-400 inline" />
                        <span><strong>Share</strong> di bilah bawah Safari.</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <span>2. Gulir ke bawah lalu ketuk</span>
                        <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" />
                        <span><strong>Add to Home Screen</strong>.</span>
                      </li>
                      <li>3. Ketuk <strong>Add</strong> di pojok kanan atas.</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Download className="w-4 h-4" />
                  </div>
                  <div className="text-xs space-y-1">
                    <h4 className="font-bold text-white text-sm">Download File APK Standalone</h4>
                    <p className="text-slate-300 leading-relaxed">
                      File package native Android (.apk) yang di-build otomatis oleh GitHub Actions.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Nama File:</span>
                    <span className="font-mono text-emerald-400 font-semibold">WealthTrack-Pro.apk</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Package ID:</span>
                    <span className="font-mono text-slate-300 text-[11px]">com.wealthtrack.app</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Target Android:</span>
                    <span className="text-slate-300 text-[11px]">Android 8.0 s/d Android 15</span>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  {/* Direct APK Download Button */}
                  <a
                    href={apkDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>Download File APK Standalone</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>

                  {/* Configurable APK URL Section */}
                  <div className="p-2.5 rounded-lg bg-[#080a0f] border border-[#1d2332] space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400 font-mono text-[10px] uppercase font-bold tracking-wider">
                        APK Direct Link:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setTempUrl(apkDownloadUrl);
                            setIsEditingUrl(!isEditingUrl);
                          }}
                          className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 font-mono cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>{isEditingUrl ? 'Batal' : 'Ubah Link'}</span>
                        </button>
                        {apkDownloadUrl !== 'https://github.com/davinwijaya1996/Expenses-Tracker-2/releases/latest/download/WealthTrack-Pro.apk' && (
                          <button
                            type="button"
                            onClick={handleResetUrl}
                            className="inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 font-mono cursor-pointer"
                            title="Reset ke Default Release"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {!isEditingUrl ? (
                      <div className="p-2 rounded bg-[#0d1017] border border-[#1b2230] text-[10px] font-mono text-zinc-300 break-all select-all">
                        {apkDownloadUrl}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="url"
                          value={tempUrl}
                          onChange={(e) => setTempUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-[#0d1017] border border-emerald-500/60 rounded px-2.5 py-1.5 text-xs text-zinc-100 font-mono focus:border-emerald-400 focus:outline-none"
                          autoFocus
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setIsEditingUrl(false)}
                            className="px-2.5 py-1 rounded text-[11px] text-zinc-400 hover:text-white"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveUrl}
                            className="px-3 py-1 rounded text-[11px] font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer"
                          >
                            Terapkan Link
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="pt-1 flex items-center justify-between text-[10px] text-zinc-500 border-t border-[#161c28]">
                      <span>Repositori GitHub:</span>
                      <a
                        href="https://github.com/davinwijaya1996/Expenses-Tracker-2/releases"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-400 hover:text-emerald-400 underline inline-flex items-center gap-1"
                      >
                        <span>Halaman Releases</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sync Guarantee Card */}
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center gap-2.5 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px]">
              <strong>Sinkron Otomatis 100%:</strong> Saldo bank, transaksi, dan investasi langsung sinkron antara PC & HP.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
