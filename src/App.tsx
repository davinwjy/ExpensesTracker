import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { MobileNav } from './components/MobileNav';
import { DashboardView } from './components/DashboardView';
import { ExpensesView } from './components/ExpensesView';
import { AccountsView } from './components/AccountsView';
import { InvestmentsView } from './components/InvestmentsView';
import { StatsView } from './components/StatsView';
import { AdminView } from './components/AdminView';
import { GlobalAnnouncementBanner } from './components/GlobalAnnouncementBanner';
import { AddExpenseModal } from './components/Modals/AddExpenseModal';
import { TransferModal } from './components/Modals/TransferModal';
import { AccountModal } from './components/Modals/AccountModal';
import { InvestmentModal } from './components/Modals/InvestmentModal';
import { HoldingTypesModal } from './components/Modals/HoldingTypesModal';
import { PayBillModal } from './components/Modals/PayBillModal';
import { FirebaseSetupModal } from './components/Modals/FirebaseSetupModal';
import { MobileAppModal } from './components/Modals/MobileAppModal';
import { AuthModal } from './components/AuthModal';
import { Wallet, Loader2 } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    activeTab,
    isFirebaseSetupOpen,
    setIsFirebaseSetupOpen,
    isMobileAppModalOpen,
    setIsMobileAppModalOpen,
  } = useFinance();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('wealthtrack_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('wealthtrack_sidebar_collapsed', String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-pulse">
          <Wallet className="w-6 h-6 text-slate-950 font-bold" />
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Synchronizing WealthTrack session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08090c] text-slate-900 dark:text-zinc-100 flex flex-col transition-colors duration-150">
      {/* Modern Desktop Left Sidebar & Contextual Header */}
      <div className="flex flex-row min-h-screen">
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />

        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          <GlobalAnnouncementBanner />
          <TopHeader
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          />

          <main className="flex-1 max-w-[1520px] w-full mx-auto px-3 sm:px-5 lg:px-6 py-5 pb-24 lg:pb-10">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'expenses' && <ExpensesView />}
            {activeTab === 'accounts' && <AccountsView />}
            {activeTab === 'investments' && <InvestmentsView />}
            {activeTab === 'stats' && <StatsView />}
            {activeTab === 'admin' && <AdminView />}
          </main>
        </div>
      </div>

      {/* Mobile Floating Bottom Dock */}
      <MobileNav />

      {/* Global Modals (Preserved 100%) */}
      <AddExpenseModal />
      <TransferModal />
      <AccountModal />
      <InvestmentModal />
      <HoldingTypesModal />
      <PayBillModal />
      <FirebaseSetupModal
        isOpen={isFirebaseSetupOpen}
        onClose={() => setIsFirebaseSetupOpen(false)}
      />
      <MobileAppModal
        isOpen={isMobileAppModalOpen}
        onClose={() => setIsMobileAppModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <MainAppContent />
      </FinanceProvider>
    </AuthProvider>
  );
}
