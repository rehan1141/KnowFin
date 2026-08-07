import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { budgetService } from '../services/budgetService';
import { categoryService } from '../services/categoryService';
import { analyticsService } from '../services/analyticsService';
import { useCurrency } from '../contexts/CurrencyContext';
import type { Category, BudgetStatusItem } from '../types';

export const BudgetsPage: React.FC = () => {
  const { formatAmount, symbol } = useCurrency();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [categories, setCategories] = useState<Category[]>([]);
  const [budgetStatuses, setBudgetStatuses] = useState<BudgetStatusItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [categoryId, setCategoryId] = useState<string>('');
  const [monthlyLimit, setMonthlyLimit] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [cats, statuses] = await Promise.all([
        categoryService.list(),
        analyticsService.getBudgetStatus(selectedMonth, selectedYear),
      ]);
      setCategories(cats);
      setBudgetStatuses(statuses.budgets);
    } catch {
      // API error handled via interceptor
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !monthlyLimit) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await budgetService.createOrUpdate({
        category_id: Number(categoryId),
        monthly_limit: Number(monthlyLimit),
        month: selectedMonth,
        year: selectedYear,
      });
      setCategoryId('');
      setMonthlyLimit('');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to set budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBudget = async (budgetId: number) => {
    if (confirm('Delete this budget limit?')) {
      await budgetService.delete(budgetId);
      loadData();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Budgets</h1>
          <p className="text-sm text-slate-500 mt-1">Set spending limits and monitor monthly budget health</p>
        </div>

        {/* Date Selector */}
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

      {/* Set Budget Form */}
      <div className="glass-card rounded-2xl p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4">Set Category Budget</h2>
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
            {error}
          </div>
        )}
        <form onSubmit={handleSetBudget} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white outline-none"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            step="0.01"
            placeholder={`Monthly Limit (${symbol})`}
            value={monthlyLimit}
            onChange={(e) => setMonthlyLimit(e.target.value)}
            className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-white"
          />

          <button
            type="submit"
            disabled={isSubmitting || !categoryId || !monthlyLimit}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-medium rounded-xl hover:opacity-95 transition disabled:opacity-50 shadow-xs"
          >
            <Plus className="w-4 h-4" /> Save Budget
          </button>
        </form>
      </div>

      {/* Budget Progress Cards */}
      <div className="glass-card rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-rose-100">
          <h2 className="text-base font-bold text-slate-900">
            Budget Status ({budgetStatuses.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
          </div>
        ) : budgetStatuses.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-sm">No budget targets set for this month.</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {budgetStatuses.map((b) => {
              const percentage = b.monthly_limit > 0 ? (b.total_spent / b.monthly_limit) * 100 : 0;
              return (
                <div key={b.category_id} className="space-y-2 border-b border-rose-50 pb-5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">{b.category_name}</span>
                      {b.is_exceeded ? (
                        <span className="inline-flex items-center gap-1 text-xs text-rose-700 bg-rose-100/80 px-2.5 py-0.5 rounded-full font-medium">
                          <AlertTriangle className="w-3 h-3" /> Over Budget
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full font-medium">
                          <CheckCircle className="w-3 h-3" /> On Track
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-600">
                        {formatAmount(b.total_spent)} / {formatAmount(b.monthly_limit)}
                      </span>
                      {b.category_id && (
                        <button
                          onClick={() => handleDeleteBudget(b.category_id)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="w-full h-3 bg-rose-100/50 rounded-full overflow-hidden p-0.5 border border-rose-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        b.is_exceeded
                          ? 'bg-gradient-to-r from-rose-500 to-red-600'
                          : percentage > 80
                          ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                          : 'bg-gradient-to-r from-rose-400 to-pink-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
