import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  ArrowRight,
  ChevronRight,
  Clock,
  Landmark,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { analyticsService } from '../services/analyticsService';
import { expenseService } from '../services/expenseService';
import { accountService } from '../services/accountService';
import { recurringService } from '../services/recurringService';
import { CategoryIcon } from '../utils/categoryIcons';
import { formatShortDate, formatMonthYear } from '../utils/formatters';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { AccountModal } from '../components/accounts/AccountModal';
import type {
  MonthlySummary,
  Expense,
  Account,
  RecurringTransaction,
  ExpenseCreate,
  AccountCreate,
  TransactionType,
} from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [totalBudgeted, setTotalBudgeted] = useState<number>(0);
  const [totalSpentBudgeted, setTotalSpentBudgeted] = useState<number>(0);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<RecurringTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalDefaultType, setTxModalDefaultType] = useState<TransactionType>('expense');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const greeting = (() => {
    const hour = currentDate.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const displayName = user?.full_name || 'there';

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sumRes, budRes, txRes, accRes, upRes] = await Promise.all([
        analyticsService.getMonthlySummary(currentMonth, currentYear),
        analyticsService.getBudgetStatus(currentMonth, currentYear),
        expenseService.list({ page_size: 6, page: 1 }),
        accountService.list(),
        recurringService.getUpcoming(30),
      ]);
      setSummary(sumRes);
      setTotalBudgeted(Number(budRes.total_budgeted || 0));
      setTotalSpentBudgeted(Number(budRes.total_spent_budgeted || 0));
      setRecentExpenses(txRes.items);
      setAccounts(accRes.accounts);
      setUpcomingBills(upRes.items);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Unable to load financial overview.');
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleOpenTxModal = (type: TransactionType = 'expense') => {
    setTxModalDefaultType(type);
    setIsTxModalOpen(true);
  };

  const handleCreateTx = async (data: ExpenseCreate) => {
    await expenseService.create(data);
    await fetchDashboardData();
  };

  const handleCreateAccount = async (data: AccountCreate) => {
    await accountService.create(data);
    await fetchDashboardData();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-neutral-500">
        <div className="w-6 h-6 rounded-full border-2 border-neutral-300 border-t-[#164A3A] animate-spin mb-3" />
        <span className="text-xs font-medium">Gathering your financial picture...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm max-w-xl mx-auto my-12 text-center">
        <p className="font-semibold mb-2">Unable to load finances</p>
        <p className="text-xs text-rose-700 mb-4">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-rose-700 text-white text-xs font-semibold rounded-lg hover:bg-rose-800 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const totalBalance = Number(summary?.total_balance ?? 0);
  const netSavings = Number(summary?.net_savings ?? 0);
  const totalIncome = Number(summary?.total_income ?? 0);
  const totalSpent = Number(summary?.total_spent ?? 0);
  const totalTxCount = Number(summary?.total_transactions ?? 0);

  const remainingBudget = Math.max(0, totalBudgeted - totalSpentBudgeted);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-5xl mx-auto">
      {/* 1. Daily Rhythm Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E8E6DF]">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-500">
            {formatMonthYear(currentMonth, currentYear)} · Your money at a glance
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-neutral-900 mt-1">
            {greeting}, {displayName.split(' ')[0]}.
          </h1>
        </div>

        {/* Quick Add Bar: Expense | Income | Transfer */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenTxModal('expense')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition shadow-xs"
          >
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
            <span>Add expense</span>
          </button>
          <button
            onClick={() => handleOpenTxModal('income')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#164A3A] text-white text-xs font-bold rounded-xl hover:bg-[#12382c] transition shadow-xs"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-300" />
            <span>Add income</span>
          </button>
          <button
            onClick={() => handleOpenTxModal('transfer')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E8E6DF] text-neutral-700 text-xs font-semibold rounded-xl hover:bg-neutral-50 transition shadow-2xs"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-neutral-500" />
            <span>Transfer</span>
          </button>
        </div>
      </div>

      {/* 2. Primary Financial Anchor: Total Balance + This Month Summary */}
      <div className="bg-white border border-[#E8E6DF] rounded-2xl p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-6 pb-6 border-b border-[#E8E6DF]">
          <div>
            <span className="text-xs font-semibold uppercase text-neutral-400 tracking-wider block">
              Total available balance
            </span>
            <div className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tight mt-1">
              {formatAmount(totalBalance)}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span
                className={`font-semibold px-2 py-0.5 rounded-md ${
                  netSavings >= 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                }`}
              >
                {netSavings >= 0 ? '+' : ''}
                {formatAmount(netSavings)} this month
              </span>
              <span className="text-neutral-400">across {accounts.length} active account{accounts.length === 1 ? '' : 's'}</span>
            </div>
          </div>

          {/* This Month Compact Summary Strip */}
          <div className="grid grid-cols-3 gap-6 sm:gap-8 pt-4 md:pt-0">
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 block uppercase">Income</span>
              <span className="text-lg font-bold text-emerald-700 block mt-0.5">
                +{formatAmount(totalIncome)}
              </span>
              <span className="text-[10px] text-neutral-400">earned this month</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 block uppercase">Spent</span>
              <span className="text-lg font-bold text-neutral-900 block mt-0.5">
                -{formatAmount(totalSpent)}
              </span>
              <span className="text-[10px] text-neutral-400">
                across {totalTxCount} transaction{totalTxCount === 1 ? '' : 's'}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 block uppercase">Saved</span>
              <span className="text-lg font-bold text-[#164A3A] block mt-0.5">
                {netSavings >= 0 ? '+' : ''}{formatAmount(netSavings)}
              </span>
              <span className="text-[10px] text-neutral-400">
                {totalIncome > 0 ? `${summary?.savings_rate}% savings rate` : 'no income yet'}
              </span>
            </div>
          </div>
        </div>

        {/* Budget Health / Available to Spend row */}
        {totalBudgeted > 0 && (
          <div className="pt-5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-700">Monthly budget</span>
                <span className="text-neutral-500">
                  {formatAmount(totalSpentBudgeted)} of {formatAmount(totalBudgeted)}
                </span>
              </div>
              <span className="font-bold text-[#164A3A]">
                {formatAmount(remainingBudget)} remaining
              </span>
            </div>
            <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  totalSpentBudgeted > totalBudgeted ? 'bg-rose-500' : 'bg-[#164A3A]'
                }`}
                style={{ width: `${Math.min((totalSpentBudgeted / totalBudgeted) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Daily Money Flow: Coming Up & Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Coming Up (Upcoming Bills) */}
        <div className="lg:col-span-7 bg-white border border-[#E8E6DF] rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E6DF] mb-3">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Coming up</h2>
              <p className="text-[11px] text-neutral-500">Fixed bills & recurring payments</p>
            </div>
            <Link
              to="/recurring"
              className="text-xs text-[#164A3A] hover:underline font-semibold flex items-center gap-0.5"
            >
              All recurring <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingBills.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              <Clock className="w-5 h-5 mx-auto mb-1.5 text-neutral-300" />
              <span>No upcoming payments due in the next 30 days.</span>
            </div>
          ) : (
            <div className="divide-y divide-[#E8E6DF]">
              {upcomingBills.slice(0, 4).map((bill) => (
                <div key={bill.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: bill.category_color || '#1F6B50' }}
                    >
                      <CategoryIcon iconName={bill.category_icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-neutral-900 block leading-tight">
                        {bill.title}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        {bill.category_name || 'Bill'} · {bill.frequency}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-neutral-900 block">
                      {formatAmount(bill.amount)}
                    </span>
                    <span className="text-[10px] font-semibold text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded">
                      {bill.days_until_due === 0
                        ? 'Due today'
                        : bill.days_until_due === 1
                        ? 'Due tomorrow'
                        : `Due in ${bill.days_until_due} days`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Your Accounts */}
        <div className="lg:col-span-5 bg-white border border-[#E8E6DF] rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E6DF] mb-3">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Your accounts</h2>
              <p className="text-[11px] text-neutral-500">Where your money lives</p>
            </div>
            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="text-xs text-[#164A3A] hover:underline font-semibold flex items-center gap-0.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {accounts.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              <Landmark className="w-5 h-5 mx-auto mb-1.5 text-neutral-300" />
              <span>No accounts registered yet.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {accounts.slice(0, 4).map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-[#E8E6DF] hover:border-neutral-300 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
                      <Landmark className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-neutral-900 block leading-tight">
                        {acc.name}
                      </span>
                      <span className="text-[10px] text-neutral-500 capitalize">
                        {acc.account_type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-neutral-900">
                    {formatAmount(acc.current_balance)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 mt-3 border-t border-[#E8E6DF] text-right">
            <Link
              to="/accounts"
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 inline-flex items-center gap-1"
            >
              <span>Manage accounts</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Recent Transactions Section */}
      <div className="bg-white border border-[#E8E6DF] rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E6DF] mb-2">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Recent transactions</h2>
            <p className="text-[11px] text-neutral-500">Latest activity across accounts</p>
          </div>
          <Link
            to="/expenses"
            className="text-xs font-semibold text-[#164A3A] hover:underline flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentExpenses.length === 0 ? (
          <div className="text-center py-10 text-neutral-400 text-xs">
            <p className="font-medium text-neutral-700 mb-1">No transactions recorded yet.</p>
            <p className="mb-3">Add your first expense or income to begin tracking.</p>
            <button
              onClick={() => handleOpenTxModal('expense')}
              className="px-3.5 py-1.5 bg-[#164A3A] text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add transaction</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E6DF]">
            {recentExpenses.slice(0, 5).map((tx) => {
              const isIncome = tx.transaction_type === 'income';
              const isTransfer = tx.transaction_type === 'transfer';
              return (
                <div
                  key={tx.id}
                  className="py-3.5 flex items-center justify-between hover:bg-neutral-50/60 -mx-1 px-1 rounded-lg transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                      style={{
                        backgroundColor:
                          tx.category_color || (isIncome ? '#059669' : isTransfer ? '#475569' : '#1F6B50'),
                      }}
                    >
                      <CategoryIcon iconName={tx.category_icon} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[13px] font-semibold text-neutral-900 block leading-tight truncate">
                        {tx.title}
                      </span>
                      <span className="text-[11px] text-neutral-500 block mt-0.5">
                        {tx.category}{tx.account_name ? ` · ${tx.account_name}` : ''} · {formatShortDate(tx.expense_date)}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[13px] font-extrabold tracking-tight shrink-0 ml-3 ${
                      isIncome
                        ? 'text-emerald-700'
                        : isTransfer
                        ? 'text-neutral-600'
                        : 'text-neutral-900'
                    }`}
                  >
                    {isIncome ? '+' : isTransfer ? '↔ ' : '−'}
                    {formatAmount(tx.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction & Account Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSubmit={handleCreateTx}
        defaultType={txModalDefaultType}
      />
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSubmit={handleCreateAccount}
      />
    </div>
  );
};
