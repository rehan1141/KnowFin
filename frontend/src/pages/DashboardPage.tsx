import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  ArrowRight,
  ArrowDownRight,
  ArrowUpRight,
  RotateCcw,
  BarChart2,
  Wallet,
  Receipt,
  AlertCircle,
  HelpCircle,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { analyticsService } from '../services/analyticsService';
import { expenseService } from '../services/expenseService';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { CategorySquircle } from '../utils/categoryIcons';
import { formatShortDate } from '../utils/formatters';
import type {
  MonthlySummary,
  Expense,
  ExpenseCreate,
  TransactionType,
  CategorySpending,
  BudgetStatusItem,
} from '../types';

const PALETTE_COLORS = ['#E97962', '#4778E5', '#D99A37', '#4C9B79', '#8B79C6', '#20251F'];

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [categories, setCategories] = useState<CategorySpending[]>([]);
  const [budgets, setBudgets] = useState<BudgetStatusItem[]>([]);
  const [cashFlowData, setCashFlowData] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Quick Add Modal
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<TransactionType>('expense');

  const greeting = (() => {
    const hour = currentDate.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const displayName = user?.full_name ? user.full_name.split(' ')[0] : 'there';

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sumRes, catRes, budRes, flowRes, txRes] = await Promise.all([
        analyticsService.getMonthlySummary(selectedMonth, selectedYear),
        analyticsService.getByCategory(selectedMonth, selectedYear),
        analyticsService.getBudgetStatus(selectedMonth, selectedYear),
        analyticsService.getCashFlow(selectedMonth, selectedYear),
        expenseService.list({ page_size: 5, page: 1 }),
      ]);

      setSummary(sumRes);
      setCategories(catRes.categories || []);
      setBudgets(budRes.budgets || []);
      setCashFlowData(flowRes.points || []);
      setRecentTransactions(txRes.items || []);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Could not load your financial overview.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenQuickAdd = (type: TransactionType = 'expense') => {
    setModalDefaultType(type);
    setIsTxModalOpen(true);
  };

  const handleSaveTransaction = async (data: ExpenseCreate) => {
    await expenseService.create(data);
    await loadData();
  };

  // ════════════════════ STATE 1: LOADING STATE ════════════════════
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-10 h-10 rounded-full border-3 border-[#DDD7CB] border-t-[#D99A37] animate-spin mb-4" />
        <h2 className="text-base font-normal text-[#20251F]">Loading your financial overview...</h2>
        <p className="text-xs text-[#6B7268] mt-1">Fetching your latest account and transaction records.</p>
      </div>
    );
  }

  // ════════════════════ STATE 2: ERROR STATE ════════════════════
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-[16px] bg-[#FDF1EE] border border-[#E97962]/20 flex items-center justify-center text-[#E97962] mb-4">
          <AlertCircle className="w-7 h-7 stroke-[1.75]" />
        </div>
        <h2 className="text-lg font-normal text-[#20251F]">Could not load your overview</h2>
        <p className="text-xs text-[#6B7268] mt-1.5 mb-5 leading-relaxed">{error}</p>
        <button
          type="button"
          onClick={loadData}
          className="py-2.5 px-5 rounded-[12px] bg-[#D99A37] text-white hover:bg-[#C5882B] text-xs font-medium transition-colors shadow-xs active:scale-[0.98]"
        >
          Try again
        </button>
      </div>
    );
  }

  const isBalanceSet = summary?.is_balance_set === true && summary?.total_balance !== null;
  const currentBalance = summary?.total_balance ? Number(summary.total_balance) : 0;
  const totalIncome = summary?.total_income ? Number(summary.total_income) : 0;
  const grossSpending = summary?.gross_spending
    ? Number(summary.gross_spending)
    : Number(summary?.total_spent || 0);
  const totalRefunds = summary?.total_refunds ? Number(summary.total_refunds) : 0;
  const netSpending = summary?.net_spending
    ? Number(summary.net_spending)
    : Math.max(0, grossSpending - totalRefunds);

  // Six-month trend data for comparison chart
  const sixMonthsTrend =
    cashFlowData.length > 0
      ? cashFlowData
      : [
          { month: 'May', income: 0, spending: 0 },
          { month: 'Jun', income: 0, spending: 0 },
          { month: 'Jul', income: 0, spending: 0 },
          { month: 'Aug', income: 0, spending: 0 },
          { month: 'Sep', income: 0, spending: 0 },
          { month: 'Oct', income: totalIncome, spending: grossSpending },
        ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* ── 1. Header: Greeting & Reporting Period Selector ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-normal text-[#20251F] tracking-tight">
            {greeting}, {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7268] mt-0.5">
            Here's your financial picture.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Period Selector */}
          <div className="relative inline-flex items-center">
            <span className="absolute left-3 pointer-events-none text-[#6B7268]">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
            <select
              value={`${selectedYear}-${selectedMonth}`}
              onChange={(e) => {
                const [y, m] = e.target.value.split('-');
                setSelectedYear(Number(y));
                setSelectedMonth(Number(m));
              }}
              aria-label="Select reporting period"
              className="py-2.5 pl-8 pr-3.5 text-xs font-medium text-[#20251F] bg-white border border-[#DDD7CB] rounded-[12px] hover:border-[#C4BEB1] outline-none cursor-pointer shadow-2xs transition-colors"
            >
              <option value="2026-10">October 2026</option>
              <option value="2026-9">September 2026</option>
              <option value="2026-8">August 2026</option>
              <option value="2026-7">July 2026</option>
              <option value="2026-11">November 2026</option>
              <option value="2026-12">December 2026</option>
            </select>
          </div>

          {/* Primary Quick Add Button */}
          <button
            type="button"
            onClick={() => handleOpenQuickAdd('expense')}
            className="inline-flex items-center gap-1.5 py-2.5 px-4 bg-[#D99A37] hover:bg-[#C5882B] text-white text-xs font-medium rounded-[12px] transition-colors shadow-xs active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add transaction</span>
          </button>
        </div>
      </div>

      {/* ── 2. Top Row: Current Balance (Left) & This Month Summary (Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Hero: Current Balance Card (65% width) */}
        <div className="lg:col-span-7 kf-card p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#6B7268]">
                <span>Current balance</span>
                <span title="Calculated from your initial balance plus recorded income and net spending">
                  <HelpCircle className="w-3.5 h-3.5 text-[#8E948B] cursor-help" aria-hidden="true" />
                </span>
              </div>

              {isBalanceSet ? (
                <div className="mt-2.5">
                  <div className="text-3xl sm:text-4xl font-normal text-[#20251F] tracking-tight kf-tnum">
                    {formatAmount(currentBalance)}
                  </div>
                  <p className="text-xs text-[#6B7268] mt-1.5">
                    Based on your opening balance and tracked transactions.
                  </p>
                </div>
              ) : (
                <div className="mt-2.5">
                  <div className="text-2xl sm:text-3xl font-normal text-[#20251F] tracking-tight">
                    Balance not set
                  </div>
                  <p className="text-xs text-[#6B7268] mt-1.5">
                    Operating in cash-flow mode. Set an opening balance in Settings to track your total net worth.
                  </p>
                  <div className="mt-4">
                    <Link
                      to="/settings"
                      className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-[12px] bg-[#FAF8F3] hover:bg-[#F6F2E9] text-[#20251F] text-xs font-medium transition-colors border border-[#DDD7CB] shadow-2xs"
                    >
                      <span>Set opening balance</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#D99A37]" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Subtle Wallet Icon Treatment */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[16px] bg-[#F6F2E9] border border-[#DDD7CB]/80 flex items-center justify-center text-[#D99A37] shrink-0">
              <Wallet className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.75]" aria-hidden="true" />
            </div>
          </div>

          {isBalanceSet && (
            <div className="pt-4 mt-4 border-t border-[#DDD7CB]/60 flex items-center justify-between text-xs">
              <span className="text-[#6B7268]">Tracked across active accounts</span>
              <Link to="/analytics" className="text-[#4778E5] hover:underline font-medium inline-flex items-center gap-1">
                <span>View analytics</span>
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>

        {/* Right Hero: This Month Summary Card (35% width) */}
        <div className="lg:col-span-5 kf-card p-6 sm:p-7 flex flex-col justify-between">
          <div className="pb-3 border-b border-[#DDD7CB]/60 flex items-center justify-between">
            <h2 className="text-xs font-medium text-[#6B7268] uppercase tracking-wider">This month</h2>
            <span className="text-[11px] text-[#8E948B]">Overview</span>
          </div>

          <div className="space-y-3 py-2.5">
            {/* Income */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-[9px] bg-[#EEF7F2] border border-[#4C9B79]/20 flex items-center justify-center text-[#4C9B79] shrink-0">
                  <ArrowUpRight className="w-4 h-4 stroke-[2]" aria-hidden="true" />
                </div>
                <span className="font-normal text-[#20251F]">Income</span>
              </div>
              <span className="font-medium text-[#20251F] kf-tnum">
                {formatAmount(totalIncome)}
              </span>
            </div>

            {/* Spending (Gross) */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-[9px] bg-[#FDF1EE] border border-[#E97962]/20 flex items-center justify-center text-[#E97962] shrink-0">
                  <ArrowDownRight className="w-4 h-4 stroke-[2]" aria-hidden="true" />
                </div>
                <span className="font-normal text-[#20251F]">Gross spending</span>
              </div>
              <span className="font-medium text-[#20251F] kf-tnum">
                {formatAmount(grossSpending)}
              </span>
            </div>

            {/* Refunds */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-[9px] bg-[#EDF3FE] border border-[#4778E5]/20 flex items-center justify-center text-[#4778E5] shrink-0">
                  <RotateCcw className="w-3.5 h-3.5 stroke-[2]" aria-hidden="true" />
                </div>
                <span className="font-normal text-[#20251F]">Refunds</span>
              </div>
              <span className="font-medium text-[#20251F] kf-tnum">
                {formatAmount(totalRefunds)}
              </span>
            </div>

            {/* Net Spending */}
            <div className="pt-2.5 border-t border-[#DDD7CB]/60 flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-[9px] bg-[#FBF4E8] border border-[#D99A37]/25 flex items-center justify-center text-[#D99A37] shrink-0">
                  <BarChart2 className="w-3.5 h-3.5 stroke-[2]" aria-hidden="true" />
                </div>
                <span className="font-medium text-[#20251F]">Net spending</span>
              </div>
              <span className="font-medium text-[#20251F] kf-tnum">
                {formatAmount(netSpending)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Middle Row: Category Breakdown, Income vs Spending, Recent Budgets ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Spending by Category Card */}
        <div className="kf-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#DDD7CB]/60">
            <h2 className="text-sm font-medium text-[#20251F]">Spending by category</h2>
            <Link
              to="/analytics"
              className="text-xs text-[#4778E5] hover:underline font-medium inline-flex items-center gap-0.5"
            >
              <span>Details</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>

          {categories.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8E948B]">
              No categorical spending recorded for this month.
            </div>
          ) : (
            <div className="py-4 space-y-4">
              {/* Donut Chart */}
              <div className="h-40 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="total_spent"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                    >
                      {categories.map((entry, idx) => (
                        <Cell
                          key={`cell-${entry.category_id || idx}`}
                          fill={entry.color || PALETTE_COLORS[idx % PALETTE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => formatAmount(Number(val))}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #DDD7CB',
                        borderRadius: '12px',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center pointer-events-none">
                  <span className="text-xs font-normal text-[#20251F] block kf-tnum">
                    {formatAmount(grossSpending)}
                  </span>
                  <span className="text-[9px] text-[#8E948B] uppercase tracking-wider">
                    Total spent
                  </span>
                </div>
              </div>

              {/* Category Legend list */}
              <div className="space-y-2 pt-1">
                {categories.slice(0, 4).map((cat, idx) => (
                  <div
                    key={cat.category_id || idx}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            cat.color || PALETTE_COLORS[idx % PALETTE_COLORS.length],
                        }}
                      />
                      <span className="text-[#20251F] truncate">{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-[#6B7268] kf-tnum">
                      <span>{cat.percentage}%</span>
                      <span className="font-medium text-[#20251F]">
                        {formatAmount(cat.total_spent)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Income vs Spending Bar Card */}
        <div className="kf-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#DDD7CB]/60">
            <h2 className="text-sm font-medium text-[#20251F]">Income vs. spending</h2>
            <span className="text-[11px] text-[#6B7268]">Last 6 months</span>
          </div>

          <div className="h-48 py-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sixMonthsTrend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#8E948B" fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#8E948B"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) => `€${v}`}
                />
                <Tooltip
                  formatter={(val: any) => formatAmount(Number(val))}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #DDD7CB',
                    borderRadius: '12px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="income" name="Income" fill="#4C9B79" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spending" name="Spending" fill="#E97962" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 text-xs text-[#6B7268]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#4C9B79]" />
              <span>Income</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#E97962]" />
              <span>Spending</span>
            </div>
          </div>
        </div>

        {/* Recent Budgets Card */}
        <div className="kf-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#DDD7CB]/60">
            <h2 className="text-sm font-medium text-[#20251F]">Recent budgets</h2>
            <Link
              to="/budgets"
              className="text-xs text-[#4778E5] hover:underline font-medium inline-flex items-center gap-0.5"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>

          {budgets.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8E948B]">
              No category budgets set for this month.
            </div>
          ) : (
            <div className="space-y-4 py-3">
              {budgets.slice(0, 3).map((bud) => {
                const limit = Number(bud.monthly_limit || 0);
                const spent = Number(bud.total_spent || 0);
                const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
                const isOver = spent > limit && limit > 0;
                const isNear = pct >= 80 && !isOver;

                return (
                  <div key={bud.budget_id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CategorySquircle
                          iconName={bud.category_icon}
                          color={bud.category_color}
                          size="sm"
                        />
                        <span className="font-normal text-[#20251F]">{bud.category_name}</span>
                      </div>
                      <span className="text-[#6B7268] kf-tnum">
                        {formatAmount(spent)} / {formatAmount(limit)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#F6F2E9] rounded-full overflow-hidden p-0.5 border border-[#DDD7CB]/40">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOver ? 'bg-[#E97962]' : isNear ? 'bg-[#D99A37]' : 'bg-[#4C9B79]'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2 text-right">
            <Link
              to="/budgets"
              className="text-[11px] text-[#6B7268] hover:text-[#20251F] inline-flex items-center gap-1"
            >
              <span>Manage budgets</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── 4. Bottom Row: Recent Transactions (Left) & Spending Trend (Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Recent Transactions (8 cols) */}
        <div className="lg:col-span-8 kf-card p-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#DDD7CB]/60 mb-2">
            <div>
              <h2 className="text-sm font-medium text-[#20251F]">Recent transactions</h2>
            </div>
            <Link
              to="/transactions"
              className="text-xs text-[#4778E5] hover:underline font-medium inline-flex items-center gap-0.5"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            /* ════════════════ STATE 3: EMPTY TRANSACTIONS STATE ════════════════ */
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-[14px] bg-[#F6F2E9] border border-[#DDD7CB]/80 flex items-center justify-center text-[#8E948B]">
                <Receipt className="w-6 h-6 stroke-[1.5]" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-[#20251F]">No transactions yet</p>
                <p className="text-xs text-[#6B7268]">
                  Add your first expense, income, or transfer to get started.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenQuickAdd('expense')}
                className="py-2 px-4 rounded-[12px] bg-[#D99A37] text-white hover:bg-[#C5882B] text-xs font-medium transition-colors shadow-xs inline-flex items-center gap-1.5 active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Add transaction</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#DDD7CB]/60">
              {recentTransactions.map((tx) => {
                const isIncome = tx.transaction_type === 'income';
                const isRefund = tx.transaction_type === 'refund';
                const isTransfer = tx.transaction_type === 'transfer';

                return (
                  <div
                    key={tx.id}
                    className="py-3 flex items-center justify-between text-xs hover:bg-[#FAF8F3] px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <CategorySquircle
                        iconName={tx.category_icon}
                        color={tx.category_color}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="font-normal text-[#20251F] truncate">
                          {tx.title}
                        </p>
                        <p className="text-[11px] text-[#6B7268] mt-0.5 truncate">
                          {tx.category} · {formatShortDate(tx.expense_date)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-4">
                      <span
                        className={`font-medium kf-tnum ${
                          isIncome
                            ? 'text-[#4C9B79]'
                            : isRefund
                            ? 'text-[#4778E5]'
                            : isTransfer
                            ? 'text-[#6B7268]'
                            : 'text-[#20251F]'
                        }`}
                      >
                        {isIncome ? '+' : isRefund ? '+' : isTransfer ? '↔ ' : '−'}
                        {formatAmount(tx.amount)}
                      </span>
                      <span className="text-[10px] text-[#8E948B] block capitalize">
                        {tx.transaction_type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Spending Trend (4 cols) */}
        <div className="lg:col-span-4 kf-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#DDD7CB]/60 mb-2">
            <h2 className="text-sm font-medium text-[#20251F]">Spending trend</h2>
            <Link
              to="/analytics"
              className="text-xs text-[#4778E5] hover:underline font-medium inline-flex items-center gap-0.5"
            >
              <span>See insights</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>

          <div className="h-44 py-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sixMonthsTrend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#8E948B" fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#8E948B"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) => `€${v}`}
                />
                <Tooltip
                  formatter={(val: any) => formatAmount(Number(val))}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #DDD7CB',
                    borderRadius: '12px',
                    fontSize: '11px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="spending"
                  stroke="#E97962"
                  strokeWidth={2}
                  fillOpacity={0.12}
                  fill="#E97962"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-[#6B7268] text-center pt-2">
            Monthly net spending trajectory
          </p>
        </div>
      </div>

      {/* Quick Add Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSubmit={handleSaveTransaction}
        defaultType={modalDefaultType}
      />
    </div>
  );
};
