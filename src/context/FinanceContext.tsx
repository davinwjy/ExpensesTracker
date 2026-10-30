import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Account,
  AccountType,
  Transaction,
  Investment,
  DashboardStats,
  UserSettings,
  SystemAnnouncement,
  HoldingType,
  InvestmentCategory,
} from '../types';
import { api } from '../lib/api';
import { localDb, DEFAULT_HOLDING_TYPES } from '../lib/localDb';
import { useAuth } from './AuthContext';
import { isFirebaseActive } from '../lib/firebase';
import { firestoreService } from '../lib/firestoreService';
import { computeStats } from '../lib/statsHelper';
import { exchangeRateService } from '../lib/exchangeRateService';

interface FinanceContextType {
  accounts: Account[];
  transactions: Transaction[];
  investments: Investment[];
  stats: DashboardStats | null;
  settings: UserSettings | null;
  usdIdrRate: number;
  rateSource: string;
  rateLastUpdated: string | null;
  isRateAutoUpdate: boolean;
  setIsRateAutoUpdate: (enabled: boolean) => Promise<void>;
  isRateFetching: boolean;
  fetchLatestRate: (options?: { silent?: boolean }) => Promise<{ success: boolean; rate?: number }>;
  isLoading: boolean;
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  activeTab: 'dashboard' | 'expenses' | 'accounts' | 'investments' | 'stats' | 'admin';
  setActiveTab: (tab: 'dashboard' | 'expenses' | 'accounts' | 'investments' | 'stats' | 'admin') => void;
  announcement: SystemAnnouncement | null;
  refreshAnnouncement: () => Promise<void>;
  refreshData: () => Promise<void>;

  // Account Operations
  addAccount: (data: {
    name: string;
    type: AccountType;
    balance: number;
    accountNumber?: string;
    color?: string;
    creditLimit?: number;
    billingDate?: number;
    dueDate?: number;
    cardNetwork?: string;
    last4Digits?: string;
  }) => Promise<void>;
  updateAccount: (id: string, data: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  payCreditCardBill: (data: {
    creditCardAccountId: string;
    sourceAccountId: string;
    amountIdr: number;
    date?: string;
    notes?: string;
  }) => Promise<void>;

  // Transaction Operations
  addTransaction: (data: {
    type: 'expense' | 'income';
    amount: number;
    accountId: string;
    category: string;
    date: string;
    notes?: string;
  }) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Transfer Operations
  transferFunds: (data: {
    type: 'account_to_account' | 'bank_to_investment';
    fromAccountId: string;
    toAccountId?: string;
    toInvestmentId?: string;
    newInvestment?: {
      name: string;
      category: InvestmentCategory;
      currency?: 'IDR' | 'USD';
      platform?: string;
      units?: number;
      notes?: string;
    };
    amountIdr: number;
    amountUsd?: number;
    exchangeRate?: number;
    date?: string;
    notes?: string;
  }) => Promise<void>;

  // Investment Operations
  addInvestment: (data: {
    name: string;
    category: InvestmentCategory;
    currency?: 'IDR' | 'USD';
    amountInvested: number;
    currentValue?: number;
    customExchangeRate?: number;
    units?: number;
    platform?: string;
    notes?: string;
  }) => Promise<void>;
  updateInvestment: (id: string, data: Partial<Investment>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  // Holding Types (Master Data)
  holdingTypes: HoldingType[];
  addHoldingType: (data: {
    id?: string;
    label: string;
    defaultCurrency: 'IDR' | 'USD';
    example?: string;
    badgeColor?: string;
  }) => Promise<void>;
  updateHoldingType: (id: string, data: Partial<HoldingType>) => Promise<void>;
  deleteHoldingType: (id: string) => Promise<void>;

  // Settings
  updateRate: (newRate: number, source?: string) => Promise<void>;

  // Modal states
  isHoldingTypesModalOpen: boolean;
  setIsHoldingTypesModalOpen: (v: boolean) => void;
  isAddExpenseOpen: boolean;
  setIsAddExpenseOpen: (v: boolean) => void;
  transactionInitialType: 'expense' | 'income';
  setTransactionInitialType: (type: 'expense' | 'income') => void;
  isTransferOpen: boolean;
  setIsTransferOpen: (v: boolean) => void;
  transferInitialMode: 'account_to_account' | 'bank_to_investment';
  setTransferInitialMode: (mode: 'account_to_account' | 'bank_to_investment') => void;
  isAddAccountOpen: boolean;
  setIsAddAccountOpen: (v: boolean) => void;
  isAddInvestmentOpen: boolean;
  setIsAddInvestmentOpen: (v: boolean) => void;
  editingAccount: Account | null;
  setEditingAccount: (a: Account | null) => void;
  editingInvestment: Investment | null;
  setEditingInvestment: (i: Investment | null) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (t: Transaction | null) => void;
  isFirebaseSetupOpen: boolean;
  setIsFirebaseSetupOpen: (v: boolean) => void;
  isMobileAppModalOpen: boolean;
  setIsMobileAppModalOpen: (v: boolean) => void;
  isPayBillOpen: boolean;
  setIsPayBillOpen: (v: boolean) => void;
  payBillCard: Account | null;
  setPayBillCard: (a: Account | null) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isFirebase } = useAuth();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [usdIdrRate, setUsdIdrRate] = useState<number>(15850);
  const [rateSource, setRateSource] = useState<string>(() => {
    return exchangeRateService.getLastRateInfo().source;
  });
  const [rateLastUpdated, setRateLastUpdated] = useState<string | null>(() => {
    return exchangeRateService.getLastRateInfo().timestamp;
  });
  const [isRateAutoUpdate, setIsRateAutoUpdateState] = useState<boolean>(() => {
    return exchangeRateService.getAutoUpdateEnabled();
  });
  const [isRateFetching, setIsRateFetching] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'accounts' | 'investments' | 'stats' | 'admin'>('dashboard');
  const [announcement, setAnnouncement] = useState<SystemAnnouncement | null>(null);

  const refreshAnnouncement = useCallback(async () => {
    try {
      const res = await api.getPublicAnnouncement();
      if (res.announcement && res.announcement.enabled && res.announcement.message) {
        setAnnouncement(res.announcement);
      } else {
        setAnnouncement(null);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refreshAnnouncement();
  }, [refreshAnnouncement]);

  // Theme mode: 'dark' | 'light'
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('wealthtrack_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });

  const applyTheme = useCallback((targetTheme: 'dark' | 'light') => {
    const root = document.documentElement;
    if (targetTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const setTheme = useCallback((newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('wealthtrack_theme', newTheme);
    } catch {}
    applyTheme(newTheme);
    if (user) {
      if (isFirebase && settings) {
        firestoreService.saveSettings({ ...settings, theme: newTheme });
      } else {
        api.updateSettings({ theme: newTheme }).catch(() => {});
      }
    }
  }, [applyTheme, user, isFirebase, settings]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  // Privacy mode persistent in localStorage
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(() => {
    return localStorage.getItem('wealthtrack_privacy_mode') === 'true';
  });

  // Holding Types state
  const [holdingTypes, setHoldingTypes] = useState<HoldingType[]>(DEFAULT_HOLDING_TYPES);
  const [isHoldingTypesModalOpen, setIsHoldingTypesModalOpen] = useState(false);

  // Modal states
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [transactionInitialType, setTransactionInitialType] = useState<'expense' | 'income'>('expense');
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferInitialMode, setTransferInitialMode] = useState<'account_to_account' | 'bank_to_investment'>('account_to_account');
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isAddInvestmentOpen, setIsAddInvestmentOpen] = useState(false);

  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isFirebaseSetupOpen, setIsFirebaseSetupOpen] = useState(false);
  const [isMobileAppModalOpen, setIsMobileAppModalOpen] = useState(false);
  const [isPayBillOpen, setIsPayBillOpen] = useState(false);
  const [payBillCard, setPayBillCard] = useState<Account | null>(null);

  const togglePrivacyMode = () => {
    setIsPrivacyMode((prev) => {
      const next = !prev;
      localStorage.setItem('wealthtrack_privacy_mode', String(next));
      return next;
    });
  };

  // 1. FIREBASE REALTIME SUBSCRIPTION
  useEffect(() => {
    if (!isFirebase || !user) return;
    setIsLoading(true);

    const unsubscribe = firestoreService.subscribeToUserData(user.id, (data) => {
      // Normalize Bitcoin currency to IDR
      const normalizedInvestments = data.investments.map((inv) =>
        inv.category === 'Bitcoin' && inv.currency !== 'IDR'
          ? { ...inv, currency: 'IDR' as const }
          : inv
      );

      setAccounts(data.accounts);
      setTransactions(data.transactions);
      setInvestments(normalizedInvestments);
      setSettings(data.settings);
      const rate = data.settings?.usdIdrRate || 15850;
      setUsdIdrRate(rate);
      if (data.settings?.rateSource) setRateSource(data.settings.rateSource);
      if (data.settings?.rateLastUpdated) setRateLastUpdated(data.settings.rateLastUpdated);
      if (data.settings?.autoUpdateRate !== undefined) {
        setIsRateAutoUpdateState(data.settings.autoUpdateRate);
        exchangeRateService.setAutoUpdateEnabled(data.settings.autoUpdateRate);
      }

      const computed = computeStats(data.accounts, data.transactions, normalizedInvestments, rate);
      setStats(computed);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isFirebase, user]);

  // 2. STANDARD SERVER / LOCAL REFRESH (when not Firebase)
  const refreshData = useCallback(async () => {
    if (!isAuthenticated) return;
    if (isFirebase) return; // Handled by realtime onSnapshot

    setIsLoading(true);
    try {
      const [accRes, txRes, invRes, statsRes, setRes, htRes] = await Promise.all([
        api.getAccounts(),
        api.getTransactions(),
        api.getInvestments(),
        api.getDashboardStats(),
        api.getSettings(),
        api.getHoldingTypes(),
      ]);

      const normalizedInvestments = invRes.investments.map((inv) =>
        inv.category === 'Bitcoin' && inv.currency !== 'IDR'
          ? { ...inv, currency: 'IDR' as const }
          : inv
      );

      setAccounts(accRes.accounts);
      setTransactions(txRes.transactions);
      setInvestments(normalizedInvestments);
      if (htRes?.holdingTypes && htRes.holdingTypes.length > 0) {
        setHoldingTypes(htRes.holdingTypes);
      }
      setStats(statsRes);
      setSettings(setRes.settings);
      if (setRes.settings?.usdIdrRate) {
        setUsdIdrRate(setRes.settings.usdIdrRate);
      }
      if (setRes.settings?.rateSource) setRateSource(setRes.settings.rateSource);
      if (setRes.settings?.rateLastUpdated) setRateLastUpdated(setRes.settings.rateLastUpdated);
      if (setRes.settings?.autoUpdateRate !== undefined) {
        setIsRateAutoUpdateState(setRes.settings.autoUpdateRate);
        exchangeRateService.setAutoUpdateEnabled(setRes.settings.autoUpdateRate);
      }
    } catch (err) {
      console.error('Failed to load finance data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isFirebase]);

  useEffect(() => {
    if (isAuthenticated && !isFirebase) {
      refreshData();
    } else if (!isAuthenticated) {
      setAccounts([]);
      setTransactions([]);
      setInvestments([]);
      setStats(null);
    }
  }, [isAuthenticated, isFirebase, refreshData]);

  // ---------------- OPERATIONS ----------------

  // Accounts
  const addAccount = async (data: {
    name: string;
    type: AccountType;
    balance: number;
    accountNumber?: string;
    color?: string;
    creditLimit?: number;
    billingDate?: number;
    dueDate?: number;
    cardNetwork?: string;
    last4Digits?: string;
  }) => {
    if (isFirebase && user) {
      const now = new Date().toISOString();
      const newAccount: Account = {
        id: 'acc_' + Date.now(),
        userId: user.id,
        name: data.name.trim(),
        type: data.type,
        balance: Number(data.balance) || 0,
        color: data.color || '#3b82f6',
        createdAt: now,
        updatedAt: now,
        ...(data.accountNumber?.trim() ? { accountNumber: data.accountNumber.trim() } : {}),
        ...(data.creditLimit !== undefined ? { creditLimit: Number(data.creditLimit) } : {}),
        ...(data.billingDate !== undefined ? { billingDate: Number(data.billingDate) } : {}),
        ...(data.dueDate !== undefined ? { dueDate: Number(data.dueDate) } : {}),
        ...(data.cardNetwork?.trim() ? { cardNetwork: data.cardNetwork.trim() } : {}),
        ...(data.last4Digits?.trim() ? { last4Digits: data.last4Digits.trim() } : {}),
      };
      await firestoreService.saveAccount(newAccount);
      return;
    }

    await api.createAccount(data);
    await refreshData();
  };

  const updateAccount = async (id: string, data: Partial<Account>) => {
    if (isFirebase && user) {
      const target = accounts.find((a) => a.id === id);
      if (target) {
        await firestoreService.saveAccount({
          ...target,
          ...data,
          updatedAt: new Date().toISOString(),
        });
      }
      return;
    }

    await api.updateAccount(id, data);
    await refreshData();
  };

  const deleteAccount = async (id: string) => {
    if (isFirebase) {
      await firestoreService.deleteAccount(id);
      return;
    }

    await api.deleteAccount(id);
    await refreshData();
  };

  // Transactions
  const addTransaction = async (data: {
    type: 'expense' | 'income';
    amount: number;
    accountId: string;
    category: string;
    date: string;
    notes?: string;
  }) => {
    const parsedAmount = Math.abs(Number(data.amount));
    const now = new Date().toISOString();
    const txId = 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    const targetAcc = accounts.find((a) => a.id === data.accountId);
    if (!targetAcc) throw new Error('Funding account not found');

    if (data.type === 'expense') {
      if (targetAcc.type === 'credit_card' || targetAcc.type === 'paylater') {
        if (targetAcc.creditLimit !== undefined && targetAcc.balance + parsedAmount > targetAcc.creditLimit) {
          const avail = Math.max(0, targetAcc.creditLimit - targetAcc.balance);
          throw new Error(`Limit kredit tidak mencukupi (${avail.toLocaleString('id-ID')}). Pengeluaran tidak dapat disubmit.`);
        }
      } else {
        if (parsedAmount > targetAcc.balance) {
          throw new Error(`Saldo tidak mencukupi (${targetAcc.balance.toLocaleString('id-ID')}). Pengeluaran tidak dapat disubmit.`);
        }
      }
    }

    let updatedAccounts = [...accounts];
    let updatedAcc: Account | null = null;

    if (targetAcc) {
      let newBal = targetAcc.balance;
      if (targetAcc.type === 'credit_card' || targetAcc.type === 'paylater') {
        newBal = data.type === 'expense' ? targetAcc.balance + parsedAmount : targetAcc.balance - parsedAmount;
      } else {
        newBal = data.type === 'expense' ? targetAcc.balance - parsedAmount : targetAcc.balance + parsedAmount;
      }
      updatedAcc = {
        ...targetAcc,
        balance: newBal,
        updatedAt: now,
      };
      updatedAccounts = updatedAccounts.map((a) => (a.id === updatedAcc!.id ? updatedAcc! : a));
    }

    const newTx: Transaction = {
      id: txId,
      userId: user?.id || 'usr_local',
      type: data.type,
      amount: parsedAmount,
      accountId: data.accountId,
      category: data.category,
      date: data.date,
      createdAt: now,
      ...(data.notes?.trim() ? { notes: data.notes.trim() } : {}),
    };

    // Immediate optimistic state update
    const nextTxs = [newTx, ...transactions];
    setAccounts(updatedAccounts);
    setTransactions(nextTxs);
    setStats(computeStats(updatedAccounts, nextTxs, investments, usdIdrRate));

    if (isFirebase && user) {
      const promises: Promise<any>[] = [firestoreService.saveTransaction(newTx)];
      if (updatedAcc) {
        promises.push(firestoreService.saveAccount(updatedAcc));
      }
      await Promise.all(promises);
      return;
    }

    await api.createTransaction(data);
    await refreshData();
  };

  const payCreditCardBill = async (data: {
    creditCardAccountId: string;
    sourceAccountId: string;
    amountIdr: number;
    date?: string;
    notes?: string;
  }) => {
    if (isFirebase && user) {
      const sourceAcc = accounts.find((a) => a.id === data.sourceAccountId);
      const ccAcc = accounts.find((a) => a.id === data.creditCardAccountId);
      if (!sourceAcc || !ccAcc) throw new Error('Accounts not found');

      const amount = Math.abs(Number(data.amountIdr));
      const now = new Date().toISOString();
      const txId = 'tx_cc_' + Date.now();

      await firestoreService.saveAccount({
        ...sourceAcc,
        balance: sourceAcc.balance - amount,
        updatedAt: now,
      });
      await firestoreService.saveAccount({
        ...ccAcc,
        balance: Math.max(0, ccAcc.balance - amount),
        updatedAt: now,
      });

      const tx: Transaction = {
        id: txId,
        userId: user.id,
        type: 'transfer',
        amount,
        accountId: data.sourceAccountId,
        toAccountId: data.creditCardAccountId,
        category: `Credit Card Payment (${ccAcc.name})`,
        date: data.date || now.split('T')[0],
        notes: data.notes || `Paid credit card bill for ${ccAcc.name} from ${sourceAcc.name}`,
        createdAt: now,
      };
      await firestoreService.saveTransaction(tx);
      return;
    }

    await api.payCreditCardBill(data);
    await refreshData();
  };

  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    const oldTx = transactions.find((t) => t.id === id);
    if (!oldTx) return;

    const newAmount = data.amount !== undefined ? Math.abs(Number(data.amount)) : oldTx.amount;
    const newType = (data.type || oldTx.type) as 'expense' | 'income';
    const newAccountId = data.accountId || oldTx.accountId;
    const now = new Date().toISOString();

    const oldAcc = accounts.find((a) => a.id === oldTx.accountId);
    const newAcc = accounts.find((a) => a.id === newAccountId);
    if (!newAcc) throw new Error('Target account not found');

    // Validate available balance/credit for updated expense
    if (newType === 'expense') {
      if (newAcc.type === 'credit_card' || newAcc.type === 'paylater') {
        if (newAcc.creditLimit !== undefined) {
          let revertedDebt = newAcc.balance;
          if (oldAcc && oldAcc.id === newAcc.id && oldTx.type === 'expense') {
            revertedDebt = Math.max(0, revertedDebt - oldTx.amount);
          }
          if (revertedDebt + newAmount > newAcc.creditLimit) {
            const avail = Math.max(0, newAcc.creditLimit - revertedDebt);
            throw new Error(`Limit kredit tidak mencukupi (${avail.toLocaleString('id-ID')}). Pengeluaran tidak dapat disubmit.`);
          }
        }
      } else {
        let revertedBal = newAcc.balance;
        if (oldAcc && oldAcc.id === newAcc.id && oldTx.type === 'expense') {
          revertedBal += oldTx.amount;
        }
        if (newAmount > revertedBal) {
          throw new Error(`Saldo tidak mencukupi (${revertedBal.toLocaleString('id-ID')}). Pengeluaran tidak dapat disubmit.`);
        }
      }
    }

    const updatedTx: Transaction = {
      ...oldTx,
      ...data,
      amount: newAmount,
      type: newType,
      accountId: newAccountId,
    };

    let updatedAccounts = [...accounts];

    if (oldAcc && newAcc && oldAcc.id === newAcc.id) {
      // Modifying transaction within the same account
      let bal = oldAcc.balance;

      // 1. Revert previous transaction effect
      if (oldAcc.type === 'credit_card' || oldAcc.type === 'paylater') {
        if (oldTx.type === 'expense') bal -= oldTx.amount;
        else if (oldTx.type === 'income') bal += oldTx.amount;
      } else {
        if (oldTx.type === 'expense') bal += oldTx.amount;
        else if (oldTx.type === 'income') bal -= oldTx.amount;
      }

      // 2. Apply new transaction effect
      if (oldAcc.type === 'credit_card' || oldAcc.type === 'paylater') {
        if (newType === 'expense') bal += newAmount;
        else if (newType === 'income') bal -= newAmount;
      } else {
        if (newType === 'expense') bal -= newAmount;
        else if (newType === 'income') bal += newAmount;
      }

      const modAcc = { ...oldAcc, balance: bal, updatedAt: now };
      updatedAccounts = updatedAccounts.map((a) => (a.id === modAcc.id ? modAcc : a));

      // Immediate optimistic update
      const nextTxs = transactions.map((t) => (t.id === id ? updatedTx : t));
      setAccounts(updatedAccounts);
      setTransactions(nextTxs);
      setStats(computeStats(updatedAccounts, nextTxs, investments, usdIdrRate));

      if (isFirebase && user) {
        await Promise.all([
          firestoreService.saveTransaction(updatedTx),
          firestoreService.saveAccount(modAcc),
        ]);
        return;
      }
    } else {
      // Account was changed to a different one
      let modOldAcc = oldAcc ? { ...oldAcc } : null;
      let modNewAcc = newAcc ? { ...newAcc } : null;

      if (modOldAcc) {
        let bal = modOldAcc.balance;
        if (modOldAcc.type === 'credit_card' || modOldAcc.type === 'paylater') {
          if (oldTx.type === 'expense') bal -= oldTx.amount;
          else if (oldTx.type === 'income') bal += oldTx.amount;
        } else {
          if (oldTx.type === 'expense') bal += oldTx.amount;
          else if (oldTx.type === 'income') bal -= oldTx.amount;
        }
        modOldAcc.balance = bal;
        modOldAcc.updatedAt = now;
      }

      if (modNewAcc) {
        let bal = modNewAcc.balance;
        if (modNewAcc.type === 'credit_card' || modNewAcc.type === 'paylater') {
          if (newType === 'expense') bal += newAmount;
          else if (newType === 'income') bal -= newAmount;
        } else {
          if (newType === 'expense') bal -= newAmount;
          else if (newType === 'income') bal += newAmount;
        }
        modNewAcc.balance = bal;
        modNewAcc.updatedAt = now;
      }

      if (modOldAcc) {
        updatedAccounts = updatedAccounts.map((a) => (a.id === modOldAcc!.id ? modOldAcc! : a));
      }
      if (modNewAcc) {
        updatedAccounts = updatedAccounts.map((a) => (a.id === modNewAcc!.id ? modNewAcc! : a));
      }

      // Immediate optimistic update
      const nextTxs = transactions.map((t) => (t.id === id ? updatedTx : t));
      setAccounts(updatedAccounts);
      setTransactions(nextTxs);
      setStats(computeStats(updatedAccounts, nextTxs, investments, usdIdrRate));

      if (isFirebase && user) {
        const promises: Promise<any>[] = [firestoreService.saveTransaction(updatedTx)];
        if (modOldAcc) promises.push(firestoreService.saveAccount(modOldAcc));
        if (modNewAcc) promises.push(firestoreService.saveAccount(modNewAcc));
        await Promise.all(promises);
        return;
      }
    }

    await api.updateTransaction(id, data);
    await refreshData();
  };

  const deleteTransaction = async (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;

    const targetAcc = accounts.find((a) => a.id === target.accountId);
    let updatedAccounts = [...accounts];
    let modAcc: Account | null = null;

    if (targetAcc) {
      let newBal = targetAcc.balance;
      if (targetAcc.type === 'credit_card' || targetAcc.type === 'paylater') {
        newBal = target.type === 'expense' ? targetAcc.balance - target.amount : targetAcc.balance + target.amount;
      } else {
        newBal = target.type === 'expense' ? targetAcc.balance + target.amount : targetAcc.balance - target.amount;
      }
      modAcc = {
        ...targetAcc,
        balance: newBal,
        updatedAt: new Date().toISOString(),
      };
      updatedAccounts = updatedAccounts.map((a) => (a.id === modAcc!.id ? modAcc! : a));
    }

    // Immediate optimistic update
    const nextTxs = transactions.filter((t) => t.id !== id);
    setAccounts(updatedAccounts);
    setTransactions(nextTxs);
    setStats(computeStats(updatedAccounts, nextTxs, investments, usdIdrRate));

    if (isFirebase && user) {
      const promises: Promise<any>[] = [firestoreService.deleteTransaction(id)];
      if (modAcc) {
        promises.push(firestoreService.saveAccount(modAcc));
      }
      await Promise.all(promises);
      return;
    }

    await api.deleteTransaction(id);
    await refreshData();
  };

  // Transfers
  const transferFunds = async (data: {
    type: 'account_to_account' | 'bank_to_investment';
    fromAccountId: string;
    toAccountId?: string;
    toInvestmentId?: string;
    newInvestment?: {
      name: string;
      category: InvestmentCategory;
      currency?: 'IDR' | 'USD';
      platform?: string;
      units?: number;
      notes?: string;
    };
    amountIdr: number;
    amountUsd?: number;
    exchangeRate?: number;
    date?: string;
    notes?: string;
  }) => {
    if (isFirebase && user) {
      const now = new Date().toISOString();
      const txId = 'tx_' + Date.now();

      if (data.type === 'account_to_account' && data.toAccountId) {
        const fromAcc = accounts.find((a) => a.id === data.fromAccountId);
        const toAcc = accounts.find((a) => a.id === data.toAccountId);
        if (fromAcc && toAcc) {
          await firestoreService.saveAccount({
            ...fromAcc,
            balance: fromAcc.balance - data.amountIdr,
            updatedAt: now,
          });
          await firestoreService.saveAccount({
            ...toAcc,
            balance: toAcc.balance + data.amountIdr,
            updatedAt: now,
          });
          const tx: Transaction = {
            id: txId,
            userId: user.id,
            type: 'transfer',
            amount: data.amountIdr,
            accountId: data.fromAccountId,
            toAccountId: data.toAccountId,
            category: `Transfer to ${toAcc.name}`,
            date: data.date || now.split('T')[0],
            notes: data.notes,
            createdAt: now,
          };
          await firestoreService.saveTransaction(tx);
        }
      } else if (data.type === 'bank_to_investment') {
        const fromAcc = accounts.find((a) => a.id === data.fromAccountId);
        if (!fromAcc) throw new Error('Source account not found');

        let targetInv = data.toInvestmentId ? investments.find((i) => i.id === data.toInvestmentId) : undefined;
        let targetInvId = data.toInvestmentId;

        // Create new investment directly if newInvestment is specified
        if (!targetInv && data.newInvestment) {
          const targetCurrency = data.newInvestment.currency || ((data.newInvestment.category === 'USD' || data.newInvestment.category === 'ETF USA') ? 'USD' : 'IDR');
          const isUsd = targetCurrency === 'USD';
          let rate = data.exchangeRate || usdIdrRate;
          let initialCost = data.amountIdr;
          let amountUsd = undefined;

          if (isUsd) {
            const parsedUsd = Number(data.amountUsd);
            if (!isNaN(parsedUsd) && parsedUsd > 0) {
              initialCost = Number(parsedUsd.toFixed(2));
              amountUsd = initialCost;
              if (data.amountIdr > 0) {
                rate = data.exchangeRate || Number((data.amountIdr / initialCost).toFixed(2));
              }
            } else {
              initialCost = Number((data.amountIdr / rate).toFixed(2));
              amountUsd = initialCost;
            }
          }

          targetInvId = 'inv_' + Date.now();
          targetInv = {
            id: targetInvId,
            userId: user.id,
            name: data.newInvestment.name.trim(),
            category: data.newInvestment.category,
            currency: targetCurrency,
            amountInvested: initialCost,
            currentValue: initialCost,
            customExchangeRate: isUsd ? rate : undefined,
            createdAt: now,
            updatedAt: now,
            ...(data.newInvestment.units !== undefined ? { units: data.newInvestment.units } : {}),
            ...(data.newInvestment.platform?.trim() ? { platform: data.newInvestment.platform.trim() } : {}),
            ...(data.newInvestment.notes?.trim() ? { notes: data.newInvestment.notes.trim() } : {}),
          };
          await firestoreService.saveInvestment(targetInv);

          // Deduct from source bank/cash
          await firestoreService.saveAccount({
            ...fromAcc,
            balance: fromAcc.balance - data.amountIdr,
            updatedAt: now,
          });

          // Log transaction
          const tx: Transaction = {
            id: txId,
            userId: user.id,
            type: 'bank_to_investment',
            amount: data.amountIdr,
            accountId: data.fromAccountId,
            toInvestmentId: targetInvId,
            amountUsd: isUsd ? amountUsd : undefined,
            exchangeRate: isUsd ? rate : undefined,
            category: `Funded ${targetInv.name}`,
            date: data.date || now.split('T')[0],
            notes: data.notes || `Initial funding for ${targetInv.name} from ${fromAcc.name}`,
            createdAt: now,
          };
          await firestoreService.saveTransaction(tx);
          return;
        }

        if (fromAcc && targetInv) {
          await firestoreService.saveAccount({
            ...fromAcc,
            balance: fromAcc.balance - data.amountIdr,
            updatedAt: now,
          });
          const isUsd = targetInv.currency === 'USD';
          let rate = data.exchangeRate || targetInv.customExchangeRate || usdIdrRate;
          let addedCost = data.amountIdr;
          let addedVal = data.amountIdr;
          let amountUsd = undefined;

          if (isUsd) {
            const parsedUsd = Number(data.amountUsd);
            if (!isNaN(parsedUsd) && parsedUsd > 0) {
              addedCost = Number(parsedUsd.toFixed(2));
              addedVal = addedCost;
              amountUsd = addedCost;
              if (data.amountIdr > 0) {
                rate = data.exchangeRate || Number((data.amountIdr / addedCost).toFixed(2));
              }
            } else {
              addedCost = Number((data.amountIdr / rate).toFixed(2));
              addedVal = addedCost;
              amountUsd = addedCost;
            }
          }

          await firestoreService.saveInvestment({
            ...targetInv,
            amountInvested: targetInv.amountInvested + addedCost,
            currentValue: targetInv.currentValue + addedVal,
            customExchangeRate: isUsd ? rate : targetInv.customExchangeRate,
            updatedAt: now,
          });
          const tx: Transaction = {
            id: txId,
            userId: user.id,
            type: 'bank_to_investment',
            amount: data.amountIdr,
            accountId: data.fromAccountId,
            toInvestmentId: data.toInvestmentId,
            amountUsd: isUsd ? amountUsd : undefined,
            exchangeRate: isUsd ? rate : undefined,
            category: `Funded ${targetInv.name}`,
            date: data.date || now.split('T')[0],
            notes: data.notes,
            createdAt: now,
          };
          await firestoreService.saveTransaction(tx);
        }
      }
      return;
    }

    // Server / Offline LocalDB mode with new investment
    if (data.type === 'bank_to_investment' && data.newInvestment) {
      const created = await api.createInvestment({
        name: data.newInvestment.name.trim(),
        category: data.newInvestment.category,
        currency: data.newInvestment.currency,
        amountInvested: 0,
        currentValue: 0,
        customExchangeRate: data.exchangeRate,
        platform: data.newInvestment.platform,
        units: data.newInvestment.units,
        notes: data.newInvestment.notes,
      });

      await api.executeTransfer({
        type: 'bank_to_investment',
        fromAccountId: data.fromAccountId,
        toInvestmentId: created.investment.id,
        amountIdr: data.amountIdr,
        amountUsd: data.amountUsd,
        exchangeRate: data.exchangeRate,
        date: data.date,
        notes: data.notes || `Initial funding for ${created.investment.name}`,
      });
      await refreshData();
      return;
    }

    await api.executeTransfer(data);
    await refreshData();
  };

  // Investments
  const addInvestment = async (data: {
    name: string;
    category: InvestmentCategory;
    currency?: 'IDR' | 'USD';
    amountInvested: number;
    currentValue?: number;
    customExchangeRate?: number;
    units?: number;
    platform?: string;
    notes?: string;
  }) => {
    if (isFirebase && user) {
      const now = new Date().toISOString();
      const chosenCurrency = data.currency || (data.category === 'USD' || data.category === 'ETF USA' ? 'USD' : 'IDR');
      const newInv: Investment = {
        id: 'inv_' + Date.now(),
        userId: user.id,
        name: data.name,
        category: data.category,
        currency: chosenCurrency,
        amountInvested: data.amountInvested,
        currentValue: data.currentValue ?? data.amountInvested,
        customExchangeRate: data.customExchangeRate,
        createdAt: now,
        updatedAt: now,
        ...(data.units !== undefined ? { units: data.units } : {}),
        ...(data.platform?.trim() ? { platform: data.platform.trim() } : {}),
        ...(data.notes?.trim() ? { notes: data.notes.trim() } : {}),
      };
      await firestoreService.saveInvestment(newInv);
      return;
    }

    await api.createInvestment(data);
    await refreshData();
  };

  const updateInvestment = async (id: string, data: Partial<Investment>) => {
    if (isFirebase && user) {
      const target = investments.find((i) => i.id === id);
      if (target) {
        const nextCategory = data.category || target.category;
        const nextCurrency =
          data.currency ??
          target.currency ??
          (nextCategory === 'USD' || nextCategory === 'ETF USA' ? 'USD' : 'IDR');

        await firestoreService.saveInvestment({
          ...target,
          ...data,
          currency: nextCurrency,
          updatedAt: new Date().toISOString(),
        });
      }
      return;
    }

    await api.updateInvestment(id, data);
    await refreshData();
  };

  const deleteInvestment = async (id: string) => {
    if (isFirebase) {
      await firestoreService.deleteInvestment(id);
      return;
    }

    await api.deleteInvestment(id);
    await refreshData();
  };

  // Holding Types Operations
  const addHoldingType = async (data: {
    id?: string;
    label: string;
    defaultCurrency: 'IDR' | 'USD';
    example?: string;
    badgeColor?: string;
  }) => {
    const res = await api.addHoldingType(data);
    setHoldingTypes((prev) => [...prev.filter((h) => h.id !== res.holdingType.id), res.holdingType]);
    await refreshData();
  };

  const updateHoldingType = async (id: string, data: Partial<HoldingType>) => {
    const res = await api.updateHoldingType(id, data);
    setHoldingTypes((prev) => prev.map((h) => (h.id === id ? res.holdingType : h)));
    await refreshData();
  };

  const deleteHoldingType = async (id: string) => {
    await api.deleteHoldingType(id);
    setHoldingTypes((prev) => prev.filter((h) => h.id !== id));
    await refreshData();
  };

  // Fetch latest rate from Google Finance / market feeds
  const fetchLatestRate = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setIsRateFetching(true);
    }
    try {
      const res = await exchangeRateService.fetchUsdIdrRate();
      const newRate = res.rate;
      const src = res.source;
      const ts = res.timestamp;

      setUsdIdrRate(newRate);
      setRateSource(src);
      setRateLastUpdated(ts);

      // Recompute stats with new rate
      setStats((prevStats) => {
        if (!prevStats && accounts.length === 0 && investments.length === 0) return prevStats;
        return computeStats(accounts, transactions, investments, newRate);
      });

      if (isFirebase && user) {
        if (settings) {
          await firestoreService.saveSettings({
            ...settings,
            usdIdrRate: newRate,
            rateSource: src,
            rateLastUpdated: ts,
            autoUpdateRate: isRateAutoUpdate,
          });
        }
      } else {
        await api.updateSettings({
          usdIdrRate: newRate,
          rateSource: src,
          rateLastUpdated: ts,
          autoUpdateRate: isRateAutoUpdate,
        });
      }

      return { success: true, rate: newRate };
    } catch (err: any) {
      console.warn('Failed to fetch latest exchange rate:', err);
      return { success: false, error: err?.message || 'Failed to fetch rate' };
    } finally {
      setIsRateFetching(false);
    }
  }, [accounts, transactions, investments, isFirebase, user, settings, isRateAutoUpdate]);

  // Auto update every 12 hours from Google Finance / market feeds
  useEffect(() => {
    if (!isRateAutoUpdate) return;
    const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000; // 12 hours

    // Check on mount if never fetched or older than 12 hours
    const checkOnMount = () => {
      const last = rateLastUpdated ? new Date(rateLastUpdated).getTime() : 0;
      const now = Date.now();
      if (now - last >= TWELVE_HOURS_MS) {
        fetchLatestRate({ silent: true });
      }
    };
    checkOnMount();

    // Set recurring 12-hour timer (43,200,000 ms)
    const intervalId = setInterval(() => {
      fetchLatestRate({ silent: true });
    }, TWELVE_HOURS_MS);

    // Refresh when tab gains focus if stale (> 12 hours)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const last = rateLastUpdated ? new Date(rateLastUpdated).getTime() : 0;
        if (Date.now() - last >= TWELVE_HOURS_MS) {
          fetchLatestRate({ silent: true });
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isRateAutoUpdate, rateLastUpdated, fetchLatestRate]);

  const setIsRateAutoUpdate = async (enabled: boolean) => {
    setIsRateAutoUpdateState(enabled);
    exchangeRateService.setAutoUpdateEnabled(enabled);

    if (isFirebase && user && settings) {
      await firestoreService.saveSettings({
        ...settings,
        autoUpdateRate: enabled,
      });
    } else {
      await api.updateSettings({ autoUpdateRate: enabled });
    }

    if (enabled) {
      fetchLatestRate();
    }
  };

  const updateRate = async (newRate: number, source: string = 'Manual Custom') => {
    const ts = new Date().toISOString();
    setUsdIdrRate(newRate);
    setRateSource(source);
    setRateLastUpdated(ts);
    exchangeRateService.saveLastRateInfo({ source, timestamp: ts });

    setStats((prevStats) => {
      if (!prevStats && accounts.length === 0 && investments.length === 0) return prevStats;
      return computeStats(accounts, transactions, investments, newRate);
    });

    if (isFirebase && user) {
      if (settings) {
        await firestoreService.saveSettings({
          ...settings,
          usdIdrRate: newRate,
          rateSource: source,
          rateLastUpdated: ts,
        });
      }
      return;
    }

    await api.updateSettings({
      usdIdrRate: newRate,
      rateSource: source,
      rateLastUpdated: ts,
    });
    await refreshData();
  };

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        transactions,
        investments,
        stats,
        settings,
        usdIdrRate,
        rateSource,
        rateLastUpdated,
        isRateAutoUpdate,
        setIsRateAutoUpdate,
        isRateFetching,
        fetchLatestRate,
        isLoading,
        isPrivacyMode,
        togglePrivacyMode,
        theme,
        toggleTheme,
        setTheme,
        activeTab,
        setActiveTab,
        announcement,
        refreshAnnouncement,
        refreshData,
        addAccount,
        updateAccount,
        deleteAccount,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        transferFunds,
        addInvestment,
        updateInvestment,
        deleteInvestment,
        updateRate,
        payCreditCardBill,

        // Holding Types (Master Data)
        holdingTypes,
        addHoldingType,
        updateHoldingType,
        deleteHoldingType,

        // Modal states
        isHoldingTypesModalOpen,
        setIsHoldingTypesModalOpen,
        isAddExpenseOpen,
        setIsAddExpenseOpen,
        transactionInitialType,
        setTransactionInitialType,
        isTransferOpen,
        setIsTransferOpen,
        transferInitialMode,
        setTransferInitialMode,
        isAddAccountOpen,
        setIsAddAccountOpen,
        isAddInvestmentOpen,
        setIsAddInvestmentOpen,
        editingAccount,
        setEditingAccount,
        editingInvestment,
        setEditingInvestment,
        editingTransaction,
        setEditingTransaction,
        isFirebaseSetupOpen,
        setIsFirebaseSetupOpen,
        isMobileAppModalOpen,
        setIsMobileAppModalOpen,
        isPayBillOpen,
        setIsPayBillOpen,
        payBillCard,
        setPayBillCard,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
