import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart3,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  RotateCcw,
  PiggyBank,
  Percent,
  Calendar,
  Layers,
  AlertCircle,
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
import { CategorySquircle } from '../utils/categoryIcons';
import { TransactionModal } from '../components/transactions/TransactionModal';
import type {
  MonthlySummary,
  CategorySpendingResponse,
  CashFlowResponse,
  ExpenseCreate,
} from '../types';

export const AnalyticsPage: React.FC = () => {
  const { formatAmount, convertAmount, symbol } = useCurrency();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [categoryData, setCategoryData] = useState<CategorySpendingResponse | null>(null);
  const [cashFlowData, setCashFlowData] = useState<CashFlowResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sumRes, catRes, flowRes] = await Promise.all([
        analyticsService.getMonthlySummary(selectedMonth, selectedYear),
        analyticsService.getByCategory(selectedMonth, selectedYear),
        analyticsService.getCashFlow(selectedMonth, selectedYear),
      ]);
      setSummary(sumRes);
      setCategoryData(catRes);
      setCashFlowData(flowRes);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Could not load your financial insights.');
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

  // ════════════════════ STATE 1: LOADING STATE ════════════════════
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-10 h-10 rounded-full border-3 border-[#DDD7CB] border-t-[#D99A37] animate-spin mb-4" />
        <h2 className="text-base font-normal text-[#20251F]">Computing financial insights...</h2>
        <p className="text-xs text-[#6B7268] mt-1">Analyzing your cash flow and spending distribution.</p>
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
        <h2 className="text-lg font-normal text-[#20251F]">Could not load insights</h2>
        <p className="text-xs text-[#6B7268] mt-1.5 mb-5 leading-relaxed">{error}</p>
        <button
          type="button"
          onClick={loadAnalytics}
          className="py-2.5 px-5 rounded-[12px] bg-[#D99A37] text-white hover:bg-[#C5882B] text-xs font-medium transition-colors shadow-xs active:scale-[0.98]"
        >
          Try again
        </button>
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
      Income: convertAmount(Number(p.income)),
      Expense: convertAmount(Number(p.expense)),
    })) || [];

  const hasActivity = totalTransactions > 0 || totalIncome > 0 || grossSpending > 0;

  return (
    <div className="space-y-6 kf-page-transition max-w-5xl mx-auto pb-12">
      {/* ── 1. Page Header and Period Selector ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DDD7CB]/70">
        <div>
          <h1 className="text-2xl sm:text-3xl font-normal text-[#20251F] tracking-tight">
            Financial Insights
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7268] mt-0.5">
            Understanding your cash flow, net spending burden, and savings rate.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            aria-label="Select month"
            className="px-3 py-2 border border-[#DDD7CB] rounded-[12px] text-xs bg-white text-[#20251F] outline-none font-medium hover:border-[#C4BEB1] focus:border-[#D99A37] transition-colors cursor-pointer shadow-2xs"
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
            aria-label="Select year"
            className="px-3 py-2 border border-[#DDD7CB] rounded-[12px] text-xs bg-white text-[#20251F] outline-none font-medium hover:border-[#C4BEB1] focus:border-[#D99A37] transition-colors cursor-pointer shadow-2xs"
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
        /* ════════════════ STATE 3: EMPTY INSIGHTS STATE ════════════════ */
        <div className="bg-white border border-[#DDD7CB] rounded-[18px] p-12 text-center shadow-2xs space-y-3">
          <div className="w-12 h-12 mx-auto rounded-[14px] bg-[#F6F2E9] border border-[#DDD7CB]/80 flex items-center justify-center text-[#8E948B]">
            <BarChart3 className="w-6 h-6 stroke-[1.5]" aria-hidden="true" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-medium text-[#20251F]">
              No transactions recorded for this month
            </h3>
            <p className="text-xs text-[#6B7268]">
              Record income or expenses for this period to see your cash flow, refunds, and savings rate analysis.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsTxModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#D99A37] hover:bg-[#C5882B] text-white text-xs font-medium rounded-[12px] transition-colors shadow-xs active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add transaction</span>
          </button>
        </div>
      ) : (
        <>
          {/* ── 2. Summary Metric Cards: Income, Gross, Net Spending, Net Savings ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {/* Total Income Card */}
            <div className="bg-white border border-[#DDD7CB] rounded-[16px] p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-[#6B7268]">
                <span className="font-normal">Total Income</span>
                <div className="w-6 h-6 rounded-[8px] bg-[#EEF7F2] border border-[#4C9B79]/20 flex items-center justify-center text-[#4C9B79]">
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2]" aria-hidden="true" />
                </div>
              </div>
              <div className="text-lg sm:text-xl font-normal text-[#4C9B79] tracking-tight kf-tnum mt-2">
                +{formatAmount(totalIncome)}
              </div>
              <span className="text-[11px] text-[#8E948B] mt-0.5 block">Deposits & earnings</span>
            </div>

            {/* Gross Spending Card */}
            <div className="bg-white border border-[#DDD7CB] rounded-[16px] p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-[#6B7268]">
                <span className="font-normal">Gross Spending</span>
                <div className="w-6 h-6 rounded-[8px] bg-[#FDF1EE] border border-[#E97962]/20 flex items-center justify-center text-[#E97962]">
                  <ArrowDownRight className="w-3.5 h-3.5 stroke-[2]" aria-hidden="true" />
                </div>
              </div>
              <div className="text-lg sm:text-xl font-normal text-[#E97962] tracking-tight kf-tnum mt-2">
                −{formatAmount(grossSpending)}
              </div>
              <span className="text-[11px] text-[#8E948B] mt-0.5 block">
                {totalRefunds > 0 ? `+${formatAmount(totalRefunds)} refunded` : 'All outflows'}
              </span>
            </div>

            {/* Net Spending Card */}
            <div className="bg-white border border-[#DDD7CB] rounded-[16px] p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-[#6B7268]">
                <span className="font-medium text-[#20251F]">Net Spending</span>
                <div className="w-6 h-6 rounded-[8px] bg-[#FBF4E8] border border-[#D99A37]/25 flex items-center justify-center text-[#D99A37]">
                  <RotateCcw className="w-3 h-3 stroke-[2]" aria-hidden="true" />
                </div>
              </div>
              <div className="text-lg sm:text-xl font-medium text-[#20251F] tracking-tight kf-tnum mt-2">
                −{formatAmount(netSpending)}
              </div>
              <span className="text-[11px] text-[#8E948B] mt-0.5 block">
                Avg {formatAmount(avgDailySpending)} / day
              </span>
            </div>

            {/* Net Savings Card */}
            <div className="bg-white border border-[#DDD7CB] rounded-[16px] p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-[#6B7268]">
                <span className="font-normal">Net Savings</span>
                <div
                  className={`w-6 h-6 rounded-[8px] flex items-center justify-center ${
                    netSavings >= 0
                      ? 'bg-[#EEF7F2] border border-[#4C9B79]/20 text-[#4C9B79]'
                      : 'bg-[#FDF1EE] border border-[#E97962]/20 text-[#E97962]'
                  }`}
                >
                  <PiggyBank className="w-3.5 h-3.5 stroke-[1.75]" aria-hidden="true" />
                </div>
              </div>
              <div
                className={`text-lg sm:text-xl font-normal tracking-tight kf-tnum mt-2 ${
                  netSavings >= 0 ? 'text-[#4C9B79]' : 'text-[#E97962]'
                }`}
              >
                {netSavings >= 0 ? '+' : ''}
                {formatAmount(netSavings)}
              </div>
              <span className="text-[11px] text-[#8E948B] mt-0.5 block flex items-center gap-1">
                <Percent className="w-3 h-3 text-[#8B79C6]" aria-hidden="true" />
                <span>Rate: {totalIncome > 0 ? `${savingsRate}%` : '—'}</span>
              </span>
            </div>
          </div>

          {/* ── 3. Spending Breakdown: Predictable Commitments vs Variable Expenses ── */}
          <div className="bg-white border border-[#DDD7CB] rounded-[18px] p-5 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-[#FAF8F3] rounded-[14px] border border-[#DDD7CB]/50">
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#6B7268]">
                <Calendar className="w-3.5 h-3.5 text-[#D99A37]" aria-hidden="true" />
                <span>Fixed Commitments (Scheduled / Recurring)</span>
              </div>
              <span className="text-xl font-normal text-[#20251F] kf-tnum mt-1 block">
                {formatAmount(fixedExpenses)}
              </span>
              <span className="text-[11px] text-[#8E948B] mt-0.5 block">
                Recurring templates are recorded upon transaction execution
              </span>
            </div>

            <div className="p-3 bg-[#FAF8F3] rounded-[14px] border border-[#DDD7CB]/50">
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#6B7268]">
                <Layers className="w-3.5 h-3.5 text-[#4778E5]" aria-hidden="true" />
                <span>Variable Spending</span>
              </div>
              <span className="text-xl font-normal text-[#20251F] kf-tnum mt-1 block">
                {formatAmount(variableExpenses)}
              </span>
              <span className="text-[11px] text-[#8E948B] mt-0.5 block">
                Discretionary and day-to-day dynamic expenses
              </span>
            </div>
          </div>

          {/* ── 4. Daily Cash Flow Chart ── */}
          <div className="bg-white border border-[#DDD7CB] rounded-[18px] p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-medium text-[#20251F]">Daily Cash Flow</h2>
                <p className="text-[11px] text-[#6B7268] mt-0.5">Timeline of income received vs expenses paid</p>
              </div>
              <div className="flex items-center gap-5 text-xs">
                <span className="flex items-center gap-1.5 text-[#6B7268]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4C9B79] inline-block" />
                  Income
                </span>
                <span className="flex items-center gap-1.5 text-[#6B7268]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E97962] inline-block" />
                  Expense
                </span>
              </div>
            </div>

            {flowPoints.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#8E948B]">
                No daily cash flow data for this period.
              </div>
            ) : (
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={flowPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE6DC" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={{ stroke: '#DDD7CB' }}
                      tick={{ fill: '#8E948B', fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#8E948B', fontSize: 11 }}
                      tickFormatter={(v) => `${symbol}${v}`}
                    />
                    <Tooltip
                      formatter={(val: unknown) => [formatAmount(Number(val), { skipConversion: true }), '']}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #DDD7CB',
                        borderRadius: '12px',
                        fontSize: '11px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                      }}
                    />
                    <Bar dataKey="Income" name="Income" fill="#4C9B79" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="Expense" name="Expense" fill="#E97962" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* ── 5. Category Breakdown List ── */}
          <div className="bg-white border border-[#DDD7CB] rounded-[18px] p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDD7CB]/60 mb-4">
              <div>
                <h2 className="text-sm font-medium text-[#20251F]">Spending by Category</h2>
                <p className="text-[11px] text-[#6B7268] mt-0.5">Distribution of monthly expenses</p>
              </div>
              <span className="text-xs font-medium text-[#20251F] kf-tnum">
                Net total: {formatAmount(netSpending)}
              </span>
            </div>

            {chartCategories.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#8E948B]">
                No categorized spending this month.
              </div>
            ) : (
              <div className="space-y-4">
                {chartCategories.map((c) => (
                  <div key={c.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <CategorySquircle
                          iconName={c.icon}
                          color={c.color}
                          size="sm"
                        />
                        <span className="font-normal text-[#20251F]">{c.name}</span>
                        <span className="text-[10px] text-[#8E948B]">
                          ({c.count} transaction{c.count === 1 ? '' : 's'})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-medium text-[#20251F] kf-tnum">
                        <span>{formatAmount(c.amount)}</span>
                        <span className="text-[#6B7268] text-[11px] font-normal w-12 text-right">
                          {c.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-1.5 bg-[#F6F2E9] rounded-full overflow-hidden border border-[#DDD7CB]/40">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: c.color || '#4778E5',
                          width: `${Math.min(c.percentage, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Quick Add Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSubmit={handleCreateTx}
        defaultType="expense"
      />
    </div>
  );
};
