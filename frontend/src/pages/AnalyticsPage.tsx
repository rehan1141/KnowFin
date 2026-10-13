import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart3,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  PiggyBank,
  Percent,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { analyticsService } from '../services/analyticsService';
import { expenseService } from '../services/expenseService';
import { useCurrency } from '../contexts/CurrencyContext';
import { CategoryIcon } from '../utils/categoryIcons';
import { TransactionModal } from '../components/transactions/TransactionModal';
import type {
  MonthlySummary,
  CategorySpendingResponse,
  CashFlowResponse,
  ExpenseCreate,
} from '../types';

export const AnalyticsPage: React.FC = () => {
  const { formatAmount } = useCurrency();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [categoryData, setCategoryData] = useState<CategorySpendingResponse | null>(null);
  const [cashFlowData, setCashFlowData] = useState<CashFlowResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sumRes, catRes, flowRes] = await Promise.all([
        analyticsService.getMonthlySummary(selectedMonth, selectedYear),
        analyticsService.getByCategory(selectedMonth, selectedYear),
        analyticsService.getCashFlow(selectedMonth, selectedYear),
      ]);
      setSummary(sumRes);
      setCategoryData(catRes);
      setCashFlowData(flowRes);
    } catch {
      // Handled silently
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleCreateTx = async (data: ExpenseCreate) => {
    await expenseService.create(data);
    await loadAnalytics();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-neutral-400 text-xs">
        <div className="w-6 h-6 rounded-full border-2 border-neutral-300 border-t-[var(--kf-ink-deep,#20251F)] animate-spin mb-2" />
        <span>Computing financial insights...</span>
      </div>
    );
  }

  const totalIncome = Number(summary?.total_income || 0);
  const grossSpending = Number(summary?.gross_spending ?? summary?.total_spent ?? 0);
  const totalRefunds = Number(summary?.total_refunds ?? 0);
  const netSpending = Number(summary?.net_spending ?? summary?.total_spent ?? 0);
  const netSavings = Number(summary?.net_savings || 0);
  const savingsRate = summary?.savings_rate || 0;
  const totalTransactions = Number(summary?.total_transactions || 0);
  const fixedExpenses = Number(summary?.fixed_expenses || 0);
  const variableExpenses = Number(summary?.variable_expenses || 0);
  const avgDailySpending = Number(summary?.average_daily_spending || 0);

  const chartCategories =
    categoryData?.categories.map((c) => ({
      name: c.category,
      amount: Number(c.total_spent),
      percentage: Number(c.percentage),
      icon: c.icon,
      color: c.color,
      count: c.transaction_count,
    })) || [];

  const flowPoints =
    cashFlowData?.points.map((p) => ({
      date: p.date.slice(5), // MM-DD
      Income: Number(p.income),
      Expense: Number(p.expense),
    })) || [];

  const hasActivity = totalTransactions > 0 || totalIncome > 0 || grossSpending > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto">
      {/* Header and Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[var(--kf-stone-soft,#DDD7CB)]">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-500">
            Reports & Review
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--kf-ink-deep,#20251F)] mt-0.5">
            Financial Insights
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Understanding your cash flow, net spending burden, and savings rate.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-1.5 border border-[var(--kf-stone-soft,#DDD7CB)] rounded-lg text-xs bg-white text-neutral-900 outline-none font-medium focus:border-[var(--kf-ink-deep,#20251F)] transition"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 border border-[var(--kf-stone-soft,#DDD7CB)] rounded-lg text-xs bg-white text-neutral-900 outline-none font-medium focus:border-[var(--kf-ink-deep,#20251F)] transition"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!hasActivity ? (
        <div className="bg-white border border-[var(--kf-stone-soft,#DDD7CB)] rounded-2xl p-12 text-center shadow-2xs">
          <BarChart3 className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-800 mb-1">
            No transactions recorded for this month
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto mb-5">
            Add transactions for this period and KnowFin will compute your net spending, refunds returned, and savings rate.
          </p>
          <button
            onClick={() => setIsTxModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--kf-ink-deep,#20251F)] text-[var(--kf-ivory-warm,#F6F2E9)] text-xs font-bold rounded-lg hover:opacity-90 transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add transaction</span>
          </button>
        </div>
      ) : (
        <>
          {/* 1. Core Financial Breakdown: Income, Gross, Refunds, Net Spending, Savings, Rate */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white border border-[var(--kf-stone-soft,#DDD7CB)] rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>Total Income</span>
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-bold text-emerald-700 tracking-tight kf-tnum mt-1">
                +{formatAmount(totalIncome)}
              </div>
              <span className="text-[11px] text-neutral-400 mt-0.5 block">Deposits & earnings</span>
            </div>

            <div className="bg-white border border-[var(--kf-stone-soft,#DDD7CB)] rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>Gross Spending</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500" />
              </div>
              <div className="text-xl font-bold text-neutral-800 tracking-tight kf-tnum mt-1">
                −{formatAmount(grossSpending)}
              </div>
              <span className="text-[11px] text-neutral-400 mt-0.5 block">
                {totalRefunds > 0 ? `+${formatAmount(totalRefunds)} refunded` : 'All outflows'}
              </span>
            </div>

            <div className="bg-white border border-[var(--kf-stone-soft,#DDD7CB)] rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="font-semibold text-neutral-700">Net Spending</span>
                <RotateCcw className="w-3.5 h-3.5 text-[var(--kf-amber-warm,#D99A37)]" />
              </div>
              <div className="text-xl font-extrabold text-[var(--kf-ink-deep,#20251F)] tracking-tight kf-tnum mt-1">
                −{formatAmount(netSpending)}
              </div>
              <span className="text-[11px] text-neutral-400 mt-0.5 block">
                Avg {formatAmount(avgDailySpending)} / day
              </span>
            </div>

            <div className="bg-white border border-[var(--kf-stone-soft,#DDD7CB)] rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>Net Savings</span>
                <PiggyBank className="w-3.5 h-3.5 text-neutral-500" />
              </div>
              <div
                className={`text-xl font-bold tracking-tight kf-tnum mt-1 ${
                  netSavings >= 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {netSavings >= 0 ? '+' : ''}
                {formatAmount(netSavings)}
              </div>
              <span className="text-[11px] text-neutral-400 mt-0.5 block flex items-center gap-1">
                <Percent className="w-3 h-3 inline" />
                <span>Rate: {totalIncome > 0 ? `${savingsRate}%` : '—'}</span>
              </span>
            </div>
          </div>

          {/* 2. Spending Breakdown: Predictable Commitments vs Variable Expenses */}
          <div className="bg-white border border-[var(--kf-stone-soft,#DDD7CB)] rounded-2xl p-5 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span>Fixed Commitments (Scheduled / Recurring)</span>
              </div>
              <span className="text-xl font-bold text-neutral-900 kf-tnum mt-1 block">
                {formatAmount(fixedExpenses)}
              </span>
              <span className="text-[11px] text-neutral-400">
                Predictable monthly subscriptions & bills
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
                <Layers className="w-3.5 h-3.5 text-neutral-400" />
                <span>Variable Spending</span>
              </div>
              <span className="text-xl font-bold text-neutral-900 kf-tnum mt-1 block">
                {formatAmount(variableExpenses)}
              </span>
              <span className="text-[11px] text-neutral-400">
                Discretionary and day-to-day dynamic expenses
              </span>
            </div>
          </div>

          {/* 3. Daily Cash Flow Chart */}
          <div className="bg-white border border-[var(--kf-stone-soft,#DDD7CB)] rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Daily Cash Flow</h3>
                <p className="text-[11px] text-neutral-500">Timeline of income received vs expenses paid</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-neutral-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                  Income
                </span>
                <span className="flex items-center gap-1.5 text-neutral-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--kf-ink-deep,#20251F)] inline-block" />
                  Expense
                </span>
              </div>
            </div>

            {flowPoints.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-400">
                No daily cash flow data for this period.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={flowPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDEBE4" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={{ stroke: '#DDD7CB' }}
                      tick={{ fill: '#737373', fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#737373', fontSize: 11 }}
                      tickFormatter={(v) => `${v}`}
                    />
                    <Tooltip
                      formatter={(val: unknown) => [formatAmount(Number(val)), '']}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #DDD7CB',
                        borderRadius: '8px',
                        fontSize: '12px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      }}
                    />
                    <Bar dataKey="Income" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="Expense" fill="#20251F" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* 4. Category Breakdown List */}
          <div className="bg-white border border-[var(--kf-stone-soft,#DDD7CB)] rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--kf-stone-soft,#DDD7CB)] mb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Spending by Category</h3>
                <p className="text-[11px] text-neutral-500">Distribution of monthly expenses</p>
              </div>
              <span className="text-xs font-bold text-neutral-800 kf-tnum">
                Net Total: {formatAmount(netSpending)}
              </span>
            </div>

            {chartCategories.length === 0 ? (
              <div className="text-center py-8 text-xs text-neutral-400">
                No categorized spending this month.
              </div>
            ) : (
              <div className="space-y-3.5">
                {chartCategories.map((c) => (
                  <div key={c.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px]"
                          style={{ backgroundColor: c.color || '#20251F' }}
                        >
                          <CategoryIcon iconName={c.icon} className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-neutral-800">{c.name}</span>
                        <span className="text-[10px] text-neutral-400">
                          ({c.count} transaction{c.count === 1 ? '' : 's'})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-bold text-neutral-900 kf-tnum">
                        <span>{formatAmount(c.amount)}</span>
                        <span className="text-neutral-400 text-[11px] font-normal w-12 text-right">
                          {c.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--kf-ink-deep,#20251F)] rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(c.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSubmit={handleCreateTx}
        defaultType="expense"
      />
    </div>
  );
};
