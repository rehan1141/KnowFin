import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Clock,
  Landmark,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import { expenseService } from '../services/expenseService';
import { accountService } from '../services/accountService';
import { recurringService } from '../services/recurringService';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatDate, formatMonthYear } from '../utils/formatters';
import { CategoryIcon } from '../utils/categoryIcons';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { AccountModal } from '../components/accounts/AccountModal';
import type {
  MonthlySummary,
  BudgetStatusItem,
  Expense,
  Account,
  RecurringTransaction,
  ExpenseCreate,
  AccountCreate,
} from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [budgetStatuses, setBudgetStatuses] = useState<BudgetStatusItem[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<RecurringTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const greeting = (() => {
    const hour = currentDate.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const displayName = user?.full_name || 'Rehan Multani';

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
      setBudgetStatuses(budRes.budgets);
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
        <div className="w-8 h-8 rounded-full border-2 border-neutral-300 border-t-[#164A3A] animate-spin mb-3" />
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

  const totalBalance = summary?.total_balance ?? 0;
  const netSavings = summary?.net_savings ?? 0;
  const totalIncome = summary?.total_income ?? 0;
  const totalSpent = summary?.total_spent ?? 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Editorial Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#E8E6DF]">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-500">
            {formatMonthYear(currentMonth, currentYear)} · Wealth Overview
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 mt-1">
            {greeting}, {displayName.split(' ')[0]}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAccountModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E8E6DF] text-neutral-700 text-xs font-semibold rounded-lg hover:bg-neutral-50 transition shadow-2xs"
          >
            <Landmark className="w-3.5 h-3.5 text-neutral-500" />
            <span>Add Account</span>
          </button>
          <button
            onClick={() => setIsTxModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#164A3A] text-white text-xs font-bold rounded-lg hover:bg-[#12382c] transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* Hero Financial Balance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Hero Card: Total Balance & Net Cash Flow */}
        <div className="lg:col-span-7 bg-white border border-[#E8E6DF] rounded-2xl p-7 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-3">
              <span className="uppercase tracking-wider font-semibold">Total Net Balance</span>
              <span className="text-[11px] bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md font-medium">
                All Active Accounts
              </span>
            </div>
            <div className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tight">
              {formatAmount(totalBalance)}
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs">
              <span
                className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md ${
                  netSavings >= 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                }`}
              >
                {netSavings >= 0 ? '+' : ''}
                {formatAmount(netSavings)}
              </span>
              <span className="text-neutral-500">net cash flow this month</span>
            </div>
          </div>

          {/* Quick Cash Flow Mini-Breakdown */}
          <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-[#E8E6DF]">
            <div>
              <span className="text-[11px] text-neutral-500 block font-medium">Income</span>
              <span className="text-base font-bold text-emerald-700 tracking-tight">
                +{formatAmount(totalIncome)}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-neutral-500 block font-medium">Expenses</span>
              <span className="text-base font-bold text-neutral-900 tracking-tight">
                -{formatAmount(totalSpent)}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-neutral-500 block font-medium">Savings Rate</span>
              <span className="text-base font-bold text-[#164A3A] tracking-tight">
                {summary?.savings_rate ?? 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Accounts Breakdown List */}
        <div className="lg:col-span-5 bg-white border border-[#E8E6DF] rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-neutral-900 tracking-tight">Accounts & Wallets</h3>
              <Link
                to="/accounts"
                className="text-xs text-[#164A3A] hover:underline font-semibold flex items-center gap-0.5"
              >
                Manage <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {accounts.length === 0 ? (
              <div className="text-center py-8 text-neutral-400 text-xs">
                No accounts set up yet. Click "Add Account" above.
              </div>
            ) : (
              <div className="space-y-2.5">
                {accounts.slice(0, 4).map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-[#E8E6DF] hover:border-neutral-300 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
                        <Landmark className="w-4 h-4" />
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
                    <span className="text-sm font-extrabold text-neutral-900">
                      {formatAmount(acc.current_balance)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-[#E8E6DF] text-right">
            <span className="text-[11px] text-neutral-500">
              {accounts.length} registered account{accounts.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Upcoming Recurring Bills & Budget Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upcoming Fixed Payments (Subscriptions, Rent, Phone) */}
        <div className="lg:col-span-6 bg-white border border-[#E8E6DF] rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Upcoming Fixed Bills</h3>
              <p className="text-[11px] text-neutral-500">Scheduled in next 30 days</p>
            </div>
            <Link
              to="/recurring"
              className="text-xs text-[#164A3A] hover:underline font-semibold flex items-center gap-0.5"
            >
              All Bills <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingBills.length === 0 ? (
            <div className="text-center py-10 text-neutral-400 text-xs">
              <Clock className="w-5 h-5 mx-auto mb-2 text-neutral-300" />
              <span>No upcoming payments scheduled.</span>
            </div>
          ) : (
            <div className="divide-y divide-[#E8E6DF]">
              {upcomingBills.slice(0, 4).map((bill) => (
                <div key={bill.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: bill.category_color || '#3B82F6' }}
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
                    <span className="text-xs font-extrabold text-neutral-900 block">
                      {formatAmount(bill.amount)}
                    </span>
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                      {bill.days_until_due === 0
                        ? 'Due today'
                        : bill.days_until_due === 1
                        ? 'Due tomorrow'
                        : `in ${bill.days_until_due} days`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Budget Health Indicator */}
        <div className="lg:col-span-6 bg-white border border-[#E8E6DF] rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Budget Allocations</h3>
              <p className="text-[11px] text-neutral-500">Track spending vs monthly target</p>
            </div>
            <Link
              to="/budgets"
              className="text-xs text-[#164A3A] hover:underline font-semibold flex items-center gap-0.5"
            >
              Budgets <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {budgetStatuses.length === 0 ? (
            <div className="text-center py-10 text-neutral-400 text-xs">
              <ShieldCheck className="w-5 h-5 mx-auto mb-2 text-neutral-300" />
              <span>No budgets set for this month. Set one in Budgets.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {budgetStatuses.slice(0, 4).map((b) => (
                <div key={b.category_id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-800">{b.category_name}</span>
                    <span className="font-bold text-neutral-900">
                      {formatAmount(b.total_spent)} / {formatAmount(b.monthly_limit)} ({b.percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        b.status === 'exceeded'
                          ? 'bg-rose-600'
                          : b.status === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-[#164A3A]'
                      }`}
                      style={{ width: `${Math.min(b.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white border border-[#E8E6DF] rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E6DF] mb-2">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Recent Transactions</h3>
            <p className="text-xs text-neutral-500">Latest financial activities across all accounts</p>
          </div>
          <Link
            to="/expenses"
            className="text-xs font-semibold text-[#164A3A] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentExpenses.length === 0 ? (
          <div className="text-center py-12 text-neutral-400 text-xs">
            <p className="font-medium text-neutral-600 mb-1">No transactions recorded yet.</p>
            <p>Start tracking your money by recording your first income or expense.</p>
            <button
              onClick={() => setIsTxModalOpen(true)}
              className="mt-3 px-3 py-1.5 bg-[#164A3A] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Transaction</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E6DF]">
            {recentExpenses.map((tx) => {
              const isIncome = tx.transaction_type === 'income';
              return (
                <div key={tx.id} className="py-3.5 flex items-center justify-between hover:bg-neutral-50/50 px-1 rounded-lg transition">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: tx.category_color || (isIncome ? '#059669' : '#1F6B50') }}
                    >
                      <CategoryIcon iconName={tx.category_icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-neutral-900 block leading-tight">
                        {tx.title}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {tx.category} {tx.account_name ? `· ${tx.account_name}` : ''} · {formatDate(tx.expense_date)}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-sm font-extrabold tracking-tight ${
                      isIncome ? 'text-emerald-700' : 'text-neutral-900'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
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
        defaultType="expense"
      />
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSubmit={handleCreateAccount}
      />
    </div>
  );
};
