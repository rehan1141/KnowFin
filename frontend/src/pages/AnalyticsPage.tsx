import React, { useEffect, useState, useCallback } from 'react';
import { PieChart, DollarSign, BarChart3 } from 'lucide-react';
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
  '#f43f5e', // rose-500
  '#ec4899', // pink-500
  '#fb7185', // rose-400
  '#e11d48', // rose-600
  '#be123c', // rose-700
  '#fda4af', // rose-300
  '#f472b6', // pink-400
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Detailed visual analytics and category spending distributions</p>
        </div>

        <div className="flex gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-1.5 border border-rose-200/80 rounded-xl text-sm bg-white/80 outline-none"
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
            className="px-3 py-1.5 border border-rose-200/80 rounded-xl text-sm bg-white/80 outline-none"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Total Card */}
      <div className="glass-card rounded-2xl p-6 flex items-center justify-between shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase text-rose-800/70 tracking-wider">Total Month Spending</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">
            {formatAmount(data?.total_spent || 0)}
          </p>
        </div>
        <div className="p-3.5 bg-gradient-to-br from-rose-400 to-pink-500 text-white rounded-xl shadow-sm">
          <DollarSign className="w-6 h-6" />
        </div>
      </div>

      {/* Interactive Charts Section */}
      {!isLoading && chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart Card */}
          <div className="glass-card rounded-2xl p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-6">
              <BarChart3 className="w-4 h-4 text-rose-500" /> Category Breakdown (Bar Chart)
            </h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fbcfe8" vertical={false} />
                  <XAxis dataKey="name" stroke="#9f1239" fontSize={12} tickLine={false} />
                  <YAxis stroke="#9f1239" fontSize={12} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => [formatAmount(Number(val)), 'Spent']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '12px',
                      border: '1px solid #fecdd3',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
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
          <div className="glass-card rounded-2xl p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-6">
              <PieChart className="w-4 h-4 text-rose-500" /> Spending Distribution (Pie Chart)
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
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '12px',
                      border: '1px solid #fecdd3',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Category Spending Breakdown List */}
      <div className="glass-card rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-rose-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-rose-500" /> Detailed Share Breakdown
          </h2>
          <span className="text-xs font-medium text-slate-500">
            {data?.categories.length || 0} active categories
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
          </div>
        ) : !data || data.categories.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
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
                    <span className="font-semibold text-slate-900">{c.category}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-900">{formatAmount(c.total_spent)}</span>
                    <span className="text-xs font-semibold text-rose-800/70 w-12 text-right">
                      {c.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-3 bg-rose-100/50 rounded-full overflow-hidden p-0.5 border border-rose-100">
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
