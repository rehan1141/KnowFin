import React, { useEffect, useState, useCallback } from 'react';
import { PieChart, DollarSign, BarChart3, TrendingUp } from 'lucide-react';
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
import type { CategorySpendingResponse } from '../types';

const COLORS = [
  '#34d399', // emerald-400
  '#2dd4bf', // teal-400
  '#059669', // emerald-600
  '#10b981', // emerald-500
  '#14b8a6', // teal-500
  '#6ee7b7', // emerald-300
  '#a7f3d0', // emerald-200
];

export const AnalyticsPage: React.FC = () => {
  const { formatAmount } = useCurrency();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [data, setData] = useState<CategorySpendingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await analyticsService.getByCategory(selectedMonth, selectedYear);
      setData(res);
    } catch {
      // Handled via interceptor
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const chartData = data?.categories.map((c) => ({
    name: c.category,
    amount: c.total_spent,
    percentage: c.percentage,
  })) || [];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header & Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">Institutional category performance & asset distribution charts</p>
        </div>

        <div className="flex gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3.5 py-2 border border-emerald-800/60 rounded-xl text-sm bg-emerald-950/80 text-slate-200 outline-none"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m} className="bg-emerald-950 text-white">
                {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3.5 py-2 border border-emerald-800/60 rounded-xl text-sm bg-emerald-950/80 text-slate-200 outline-none"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y} className="bg-emerald-950 text-white">
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Total Card */}
      <div className="fintech-card rounded-2xl p-6 flex items-center justify-between shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase text-emerald-400 tracking-widest">Total Period Volume</span>
          <p className="text-3xl font-black text-white mt-1">
            {formatAmount(data?.total_spent || 0)}
          </p>
        </div>
        <div className="p-3.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
          <DollarSign className="w-6 h-6" />
        </div>
      </div>

      {/* Interactive Charts Section */}
      {!isLoading && chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart Card */}
          <div className="fintech-card rounded-2xl p-6 shadow-xs">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-6">
              <BarChart3 className="w-4 h-4 text-emerald-400" /> Category Distribution (Bar Chart)
            </h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} />
                  <XAxis dataKey="name" stroke="#6ee7b7" fontSize={12} tickLine={false} />
                  <YAxis stroke="#6ee7b7" fontSize={12} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => [formatAmount(Number(val)), 'Spent']}
                    contentStyle={{
                      backgroundColor: '#022c22',
                      borderRadius: '12px',
                      border: '1px solid #047857',
                      color: '#ffffff',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    }}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart Card */}
          <div className="fintech-card rounded-2xl p-6 shadow-xs">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-6">
              <PieChart className="w-4 h-4 text-emerald-400" /> Capital Share (Donut Chart)
            </h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="amount"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-pie-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatAmount(Number(val)), 'Amount']}
                    contentStyle={{
                      backgroundColor: '#022c22',
                      borderRadius: '12px',
                      border: '1px solid #047857',
                      color: '#ffffff',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Category Spending Breakdown List */}
      <div className="fintech-card rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-emerald-800/50 flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Granular Category Shares
          </h2>
          <span className="text-xs font-bold text-emerald-400">
            {data?.categories.length || 0} active categories
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
          </div>
        ) : !data || data.categories.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-sm">No expenses recorded for this month.</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {data.categories.map((c, index) => (
              <div key={c.category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shadow-xs"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-bold text-white">{c.category}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-extrabold text-white">{formatAmount(c.total_spent)}</span>
                    <span className="text-xs font-bold text-emerald-400 w-12 text-right">
                      {c.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-3 bg-emerald-950/80 rounded-full overflow-hidden p-0.5 border border-emerald-900">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(c.percentage, 100)}%`,
                      backgroundColor: COLORS[index % COLORS.length],
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
