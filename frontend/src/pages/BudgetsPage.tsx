import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { budgetService } from '../services/budgetService';
import { categoryService } from '../services/categoryService';
import { analyticsService } from '../services/analyticsService';
import { useCurrency } from '../contexts/CurrencyContext';
import { CategoryIcon } from '../utils/categoryIcons';
import type { Category, BudgetStatusItem } from '../types';

export const BudgetsPage: React.FC = () => {
  const { formatAmount, symbol } = useCurrency();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [categories, setCategories] = useState<Category[]>([]);
  const [budgetStatuses, setBudgetStatuses] = useState<BudgetStatusItem[]>([]);
  const [totalBudgeted, setTotalBudgeted] = useState(0);
  const [totalSpentBudgeted, setTotalSpentBudgeted] = useState(0);
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
        categoryService.list('expense'),
        analyticsService.getBudgetStatus(selectedMonth, selectedYear),
      ]);
      setCategories(cats);
      setBudgetStatuses(statuses.budgets);
      setTotalBudgeted(Number(statuses.total_budgeted || 0));
      setTotalSpentBudgeted(Number(statuses.total_spent_budgeted || 0));
    } catch {
      // Handled
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
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save budget limit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBudget = async (budgetId: number, name: string) => {
    if (confirm(`Remove monthly budget for "${name}"?`)) {
      await budgetService.delete(budgetId);
      await loadData();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#E8E6DF]">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-500">
            Monthly Budgets
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mt-0.5">
            Budgets
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Set target limits by category to prevent overspending
          </p>
        </div>

        {/* Month & Year Filter Pills */}
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

      {/* Aggregate Budget Pulse */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E8E6DF] rounded-2xl p-5 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase text-neutral-500">
            Total Budgeted
          </span>
          <div className="text-2xl font-black text-neutral-900 tracking-tight mt-1">
            {formatAmount(totalBudgeted)}
          </div>
        </div>
        <div className="bg-white border border-[#E8E6DF] rounded-2xl p-5 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase text-neutral-500">
            Actual Spent
          </span>
          <div className="text-2xl font-black text-neutral-900 tracking-tight mt-1">
            {formatAmount(totalSpentBudgeted)}
          </div>
        </div>
        <div className="bg-white border border-[#E8E6DF] rounded-2xl p-5 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase text-neutral-500">
            Remaining Room
          </span>
          <div
            className={`text-2xl font-black tracking-tight mt-1 ${
              totalBudgeted - totalSpentBudgeted >= 0 ? 'text-[#164A3A]' : 'text-rose-600'
            }`}
          >
            {formatAmount(totalBudgeted - totalSpentBudgeted)}
          </div>
        </div>
      </div>

      {/* Set Category Budget Form */}
      <div className="bg-white border border-[#E8E6DF] rounded-2xl p-5 shadow-2xs">
        <h2 className="text-sm font-bold text-neutral-900 mb-3">Set Category Budget</h2>
        {error && (
          <div className="mb-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleSetBudget} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="px-3.5 py-2 border border-[#E8E6DF] rounded-xl text-xs bg-white text-neutral-900 outline-none"
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
            placeholder={`Monthly Target (${symbol})`}
            value={monthlyLimit}
            onChange={(e) => setMonthlyLimit(e.target.value)}
            className="px-3.5 py-2 border border-[#E8E6DF] rounded-xl text-xs text-neutral-900 outline-none"
          />

          <button
            type="submit"
            disabled={isSubmitting || !categoryId || !monthlyLimit}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#164A3A] text-white text-xs font-bold rounded-xl hover:bg-[#12382c] transition disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Save Budget
          </button>
        </form>
      </div>

      {/* Budget Status Ledger */}
      <div className="bg-white border border-[#E8E6DF] rounded-2xl p-6 shadow-2xs">
        <h2 className="text-sm font-bold text-neutral-900 mb-4">
          Allocated Categories ({budgetStatuses.length})
        </h2>

        {isLoading ? (
          <div className="text-center py-12 text-neutral-400 text-xs">Loading budgets...</div>
        ) : budgetStatuses.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 text-xs">
            No budget targets set for this month. Set one above.
          </div>
        ) : (
          <div className="space-y-5">
            {budgetStatuses.map((b) => (
              <div key={b.category_id} className="space-y-1.5 pb-4 border-b border-[#E8E6DF] last:border-0 last:pb-0">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: b.category_color || '#1F6B50' }}
                    >
                      <CategoryIcon iconName={b.category_icon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-neutral-900">{b.category_name}</span>

                    {/* Status Badge */}
                    {b.status === 'exceeded' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full font-bold">
                        <AlertTriangle className="w-3 h-3" /> Over budget
                      </span>
                    ) : b.status === 'warning' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                        <Clock className="w-3 h-3" /> Approaching ({b.percentage.toFixed(0)}%)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                        <CheckCircle className="w-3 h-3" /> On track ({b.percentage.toFixed(0)}%)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-neutral-900">
                      {formatAmount(b.total_spent)} / {formatAmount(b.monthly_limit)}
                    </span>
                    <button
                      onClick={() => handleDeleteBudget(b.budget_id, b.category_name)}
                      className="text-neutral-400 hover:text-rose-600 p-1"
                      title="Remove budget"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
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
  );
};
