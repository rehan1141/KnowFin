import React, { useEffect, useState, useCallback } from 'react';
import { PieChart, DollarSign } from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import { formatCurrency } from '../utils/formatters';
import type { CategorySpendingResponse } from '../types';

export const AnalyticsPage: React.FC = () => {
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

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header & Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Detailed breakdown of expense distribution and category shares</p>
        </div>

        <div className="flex gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white outline-none"
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
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white outline-none"
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
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Total Month Spending</span>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {formatCurrency(data?.total_spent || 0)}
          </p>
        </div>
        <div className="p-3 bg-slate-100 rounded-xl text-slate-700">
          <DollarSign className="w-6 h-6" />
        </div>
      </div>

      {/* Category Spending Breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-slate-500" /> Spending Distribution by Category
          </h2>
          <span className="text-xs text-slate-500">
            {data?.categories.length || 0} active categories
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          </div>
        ) : !data || data.categories.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-sm">No expenses recorded for this month.</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {data.categories.map((c) => (
              <div key={c.category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                    <span className="font-medium text-slate-900">{c.category}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-slate-900">{formatCurrency(c.total_spent)}</span>
                    <span className="text-xs text-slate-500 w-12 text-right">{c.percentage.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-900 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(c.percentage, 100)}%` }}
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
