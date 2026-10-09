import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart3,
  Plus,
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
      // Handled
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
        <div className="w-6 h-6 rounded-full border-2 border-neutral-300 border-t-[#164A3A] animate-spin mb-2" />
        <span>Loading monthly analysis...</span>
      </div>
    );
  }

  const totalIncome = Number(summary?.total_income || 0);
  const totalSpent = Number(summary?.total_spent || 0);
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

  const hasActivity = totalTransactions > 0 || totalIncome > 0 || totalSpent > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto">
      {/* Header and Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#E8E6DF]">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-500">
            Reports & Review
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mt-0.5">
            Monthly Analytics
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Understanding your cash flow, spending habits, and net savings
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-1.5 border border-[#E8E6DF] rounded-lg text-xs bg-white text-neutral-900 outline-none font-medium"
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
            className="px-3 py-1.5 border border-[#E8E6DF] rounded-lg text-xs bg-white text-neutral-900 outline-none font-medium"
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
        <div className="bg-white border border-[#E8E6DF] rounded-2xl p-12 text-center shadow-2xs">
          <BarChart3 className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-800 mb-1">
            No transactions recorded for this month
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto mb-5">
            Add a few transactions and KnowFin will show your cash flow, spending categories, and savings rate.
          </p>
          <button
            onClick={() => setIsTxModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#164A3A] text-white text-xs font-bold rounded-lg hover:bg-[#12382c] transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add transaction</span>
          </button>
        </div>
      ) : (
        <>
          {/* 1. Core Financial Questions: Inflow, Outflow, Net, Rate */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E8E6DF] rounded-2xl p-5 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase text-neutral-500 block">
                Total Inflow
              </span>
              <div className="text-2xl font-black text-emerald-700 tracking-tight mt-1">
                +{formatAmount(totalIncome)}
              </div>
              <span className="text-[10px] text-neutral-400 mt-1 block">Income earned</span>
            </div>

            <div className="bg-white border border-[#E8E6DF] rounded-2xl p-5 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase text-neutral-500 block">
                Total Outflow
              </span>
              <div className="text-2xl font-black text-neutral-900 tracking-tight mt-1">
                -{formatAmount(totalSpent)}
              </div>
              <span className="text-[10px] text-neutral-400 mt-1 block">
                Avg {formatAmount(avgDailySpending)} / day
              </span>
            </div>

            <div className="bg-white border border-[#E8E6DF] rounded-2xl p-5 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase text-neutral-500 block">
                Net Savings
              </span>
              <div
                className={`text-2xl font-black tracking-tight mt-1 ${
                  netSavings >= 0 ? 'text-[#164A3A]' : 'text-rose-600'
                }`}
              >
                {netSavings >= 0 ? '+' : ''}
                {formatAmount(netSavings)}
              </div>
              <span className="text-[10px] text-neutral-400 mt-1 block">Saved this month</span>
            </div>

            <div className="bg-white border border-[#E8E6DF] rounded-2xl p-5 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase text-neutral-500 block">
                Savings Rate
              </span>
              <div className="text-2xl font-black text-[#164A3A] tracking-tight mt-1">
                {totalIncome > 0 ? `${savingsRate}%` : '—'}
              </div>
              <span className="text-[10px] text-neutral-400 mt-1 block">
                {totalIncome > 0 ? 'Net income retained' : 'No income recorded'}
              </span>
            </div>
          </div>

          {/* 2. Spending Split: Fixed Commitments vs Variable Expenses */}
          <div className="bg-white border border-[#E8E6DF] rounded-2xl p-5 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-semibold text-neutral-500 block">
                Fixed Commitments (Recurring Rules)
              </span>
              <span className="text-xl font-bold text-neutral-900 mt-0.5 block">
                {formatAmount(fixedExpenses)}
              </span>
              <span className="text-[11px] text-neutral-400">
                Predictable monthly subscriptions & bills
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-neutral-500 block">
                Variable Spending
              </span>
              <span className="text-xl font-bold text-neutral-900 mt-0.5 block">
                {formatAmount(variableExpenses)}
              </span>
              <span className="text-[11px] text-neutral-400">
                Day-to-day dynamic expenses
              </span>
            </div>
          </div>

          {/* 3. Daily Cash Flow Chart */}
          <div className="bg-white border border-[#E8E6DF] rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Cash Flow Timeline</h3>
                <p className="text-[11px] text-neutral-500">Daily income received vs expenses paid</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-neutral-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                  Income
                </span>
                <span className="flex items-center gap-1.5 text-neutral-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-900 inline-block" />
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
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EFEB" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={{ stroke: '#E8E6DF' }}
                      tick={{ fill: '#737373', fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#737373', fontSize: 11 }}
                      tickFormatter={(v) => `${v}`}
                    />
                    <Tooltip
                      formatter={(val: any) => [formatAmount(Number(val)), '']}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E8E6DF',
                        borderRadius: '8px',
                        fontSize: '12px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      }}
                    />
                    <Bar dataKey="Income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="Expense" fill="#171717" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* 4. What did I spend it on? Category Breakdown List */}
          <div className="bg-white border border-[#E8E6DF] rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E6DF] mb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Spending by Category</h3>
                <p className="text-[11px] text-neutral-500">Distribution of monthly expenses</p>
              </div>
              <span className="text-xs font-bold text-neutral-700">
                Total: {formatAmount(totalSpent)}
              </span>
            </div>

            {chartCategories.length === 0 ? (
              <div className="text-center py-8 text-xs text-neutral-400">
                No categorized spending this month.
              </div>
            ) : (
              <div className="space-y-3">
                {chartCategories.map((c) => (
                  <div key={c.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px]"
                          style={{ backgroundColor: c.color || '#1F6B50' }}
                        >
                          <CategoryIcon iconName={c.icon} className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-neutral-800">{c.name}</span>
                        <span className="text-[10px] text-neutral-400">
                          ({c.count} transaction{c.count === 1 ? '' : 's'})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-bold text-neutral-900">
                        <span>{formatAmount(c.amount)}</span>
                        <span className="text-neutral-400 text-[11px] font-normal w-10 text-right">
                          {c.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#164A3A] rounded-full transition-all duration-300"
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
