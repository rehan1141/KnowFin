import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart3,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { analyticsService } from '../services/analyticsService';
import { useCurrency } from '../contexts/CurrencyContext';
import { CategoryIcon } from '../utils/categoryIcons';
import type {
  MonthlySummary,
  CategorySpendingResponse,
  CashFlowResponse,
} from '../types';

const CHART_PALETTE = [
  '#164A3A',
  '#1F6B50',
  '#2E7D5B',
  '#5C7C64',
  '#D97706',
  '#DC2626',
  '#3B82F6',
  '#8B5CF6',
  '#0D9488',
  '#6B7280',
];

export const AnalyticsPage: React.FC = () => {
  const { formatAmount } = useCurrency();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [categoryData, setCategoryData] = useState<CategorySpendingResponse | null>(null);
  const [cashFlowData, setCashFlowData] = useState<CashFlowResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-neutral-400 text-xs">
        <div className="w-6 h-6 rounded-full border-2 border-neutral-300 border-t-[#164A3A] animate-spin mb-2" />
        <span>Computing financial intelligence...</span>
      </div>
    );
  }

  const chartCategories = categoryData?.categories.map((c) => ({
    name: c.category,
    amount: Number(c.total_spent),
    percentage: c.percentage,
    icon: c.icon,
  })) || [];

  const flowPoints = cashFlowData?.points.map((p) => ({
    date: p.date.slice(5), // MM-DD
    Income: Number(p.income),
    Expense: Number(p.expense),
  })) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#E8E6DF]">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-500">
            Intelligence & Reports
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mt-0.5">
            Financial Analytics
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Cash-flow trajectory, capital distribution, and savings efficiency
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

      {/* Top Financial Health Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E8E6DF] rounded-2xl p-5 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase text-neutral-500 block">
            Total Inflow
          </span>
          <div className="text-2xl font-black text-emerald-700 tracking-tight mt-1">
            +{formatAmount(summary?.total_income || 0)}
          </div>
          <span className="text-[10px] text-neutral-400 mt-1 block">Income this period</span>
        </div>

        <div className="bg-white border border-[#E8E6DF] rounded-2xl p-5 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase text-neutral-500 block">
            Total Outflow
          </span>
          <div className="text-2xl font-black text-neutral-900 tracking-tight mt-1">
            -{formatAmount(summary?.total_spent || 0)}
          </div>
          <span className="text-[10px] text-neutral-400 mt-1 block">
            Avg {formatAmount(summary?.average_daily_spending || 0)} / day
          </span>
        </div>

        <div className="bg-white border border-[#E8E6DF] rounded-2xl p-5 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase text-neutral-500 block">
            Net Savings
          </span>
          <div
            className={`text-2xl font-black tracking-tight mt-1 ${
              (summary?.net_savings || 0) >= 0 ? 'text-[#164A3A]' : 'text-rose-600'
            }`}
          >
            {(summary?.net_savings || 0) >= 0 ? '+' : ''}
            {formatAmount(summary?.net_savings || 0)}
          </div>
          <span className="text-[10px] text-neutral-400 mt-1 block">Saved this month</span>
        </div>

        <div className="bg-white border border-[#E8E6DF] rounded-2xl p-5 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase text-neutral-500 block">
            Savings Rate
          </span>
          <div className="text-2xl font-black text-[#164A3A] tracking-tight mt-1">
            {summary?.savings_rate || 0}%
          </div>
          <span className="text-[10px] text-neutral-400 mt-1 block">Net income retained</span>
        </div>
      </div>

      {/* Fixed vs Variable Spending Split */}
      <div className="bg-white border border-[#E8E6DF] rounded-2xl p-5 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <span className="text-xs font-semibold text-neutral-500 block">
            Fixed Commitments (Subscriptions & Recurring)
          </span>
          <span className="text-xl font-bold text-neutral-900 mt-0.5 block">
            {formatAmount(summary?.fixed_expenses || 0)}
          </span>
          <span className="text-[11px] text-neutral-400">
            Predictable recurring baseline
          </span>
        </div>
        <div>
          <span className="text-xs font-semibold text-neutral-500 block">
            Variable Discretionary Spending
          </span>
          <span className="text-xl font-bold text-neutral-900 mt-0.5 block">
            {formatAmount(summary?.variable_expenses || 0)}
          </span>
          <span className="text-[11px] text-neutral-400">
            Day-to-day dynamic expenses
          </span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Cash Flow Bar Chart */}
        <div className="lg:col-span-7 bg-white border border-[#E8E6DF] rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#164A3A]" />
              <span>Daily Cash Flow</span>
            </h3>
            <span className="text-xs text-neutral-400">Income vs Expenses</span>
          </div>

          <div className="h-64 w-full">
            {flowPoints.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-neutral-400">
                No activity recorded for this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={flowPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EFEA" vertical={false} />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => [formatAmount(Number(val)), '']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E8E6DF',
                      color: '#171717',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    }}
                  />
                  <Bar dataKey="Income" fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expense" fill="#171717" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Spending Donut Chart */}
        <div className="lg:col-span-5 bg-white border border-[#E8E6DF] rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-[#164A3A]" />
              <span>Category Share</span>
            </h3>
            <span className="text-xs text-neutral-400">Expense Distribution</span>
          </div>

          <div className="h-64 w-full">
            {chartCategories.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-neutral-400">
                No categorized spending for this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={chartCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="amount"
                  >
                    {chartCategories.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_PALETTE[index % CHART_PALETTE.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatAmount(Number(val)), 'Spent']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E8E6DF',
                      color: '#171717',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Top Spending Categories Ranked */}
      <div className="bg-white border border-[#E8E6DF] rounded-2xl p-6 shadow-2xs">
        <h3 className="text-sm font-bold text-neutral-900 mb-4">
          Spending by Category Breakdown
        </h3>

        {chartCategories.length === 0 ? (
          <div className="text-center py-8 text-xs text-neutral-400">
            No spending recorded for this month.
          </div>
        ) : (
          <div className="space-y-4">
            {categoryData?.categories.map((c, idx) => (
              <div key={c.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: c.color || CHART_PALETTE[idx % CHART_PALETTE.length] }}
                    >
                      <CategoryIcon iconName={c.icon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-neutral-900">{c.category}</span>
                    <span className="text-[11px] text-neutral-400">
                      ({c.transaction_count} transaction{c.transaction_count === 1 ? '' : 's'})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-neutral-900">
                      {formatAmount(c.total_spent)}
                    </span>
                    <span className="text-neutral-500 font-semibold w-12 text-right">
                      {c.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(c.percentage, 100)}%`,
                      backgroundColor: c.color || CHART_PALETTE[idx % CHART_PALETTE.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
