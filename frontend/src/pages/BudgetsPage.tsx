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
      // Handled silently
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
    if (window.confirm(`Remove monthly budget for "${name}"?`)) {
      await budgetService.delete(budgetId);
      await loadData();
    }
  };

  const overallPercentage = totalBudgeted > 0 ? (totalSpentBudgeted / totalBudgeted) * 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto">
      {/* Header & Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[var(--kf-stone-soft,#DDD7CB)]">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-500">
            Monthly Targets
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--kf-ink-deep,#20251F)] mt-0.5">
            Budgets
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Set target limits by category to guard against overspending.
          </p>
        </div>

        {/* Month & Year Filter */}
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

      {/* Aggregate Budget Bar */}
      <div className="bg-white border border-[var(--kf-stone-soft,#DDD7CB)] rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Total Budgeted Envelope
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-[var(--kf-ink-deep,#20251F)] tracking-tight kf-tnum">
                {formatAmount(totalSpentBudgeted)}
              </span>
              <span className="text-sm font-semibold text-neutral-500 kf-tnum">
                of {formatAmount(totalBudgeted)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-neutral-700 block kf-tnum">
              {overallPercentage.toFixed(0)}% Utilized
            </span>
            <span className="text-[11px] text-neutral-400">
              {totalBudgeted - totalSpentBudgeted >= 0
                ? `${formatAmount(totalBudgeted - totalSpentBudgeted)} remaining`
                : `${formatAmount(Math.abs(totalBudgeted - totalSpentBudgeted))} over budget`}
            </span>
          </div>
        </div>

        <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              overallPercentage > 100
                ? 'bg-rose-500'
                : overallPercentage > 85
                ? 'bg-[var(--kf-amber-warm,#D99A37)]'
                : 'bg-[var(--kf-ink-deep,#20251F)]'
            }`}
            style={{ width: `${Math.min(overallPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Quick Add Budget Form */}
      <div className="bg-white border border-[var(--kf-stone-soft,#DDD7CB)] rounded-2xl p-5 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
          Set or Update Category Limit
        </h3>
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs mb-3">
            {error}
          </div>
        )}
        <form onSubmit={handleSetBudget} className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full sm:flex-1 px-3 py-2 border border-[var(--kf-stone-soft,#DDD7CB)] rounded-xl text-xs text-neutral-900 outline-none bg-white focus:border-[var(--kf-ink-deep,#20251F)] transition"
          >
            <option value="">Select Expense Category...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-44">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold">
              {symbol}
            </span>
            <input
              type="number"
              step="0.01"
              placeholder="Monthly Limit"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              className="w-full pl-7 pr-3 py-2 border border-[var(--kf-stone-soft,#DDD7CB)] rounded-xl text-xs text-neutral-900 outline-none focus:border-[var(--kf-ink-deep,#20251F)] transition kf-tnum"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !categoryId || !monthlyLimit}
            className="w-full sm:w-auto px-4 py-2 bg-[var(--kf-ink-deep,#20251F)] text-white text-xs font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Save Limit</span>
          </button>
        </form>
      </div>

      {/* Category Budgets Grid */}
      {isLoading ? (
        <div className="text-center py-24 text-neutral-400 text-xs">Loading budgets...</div>
      ) : budgetStatuses.length === 0 ? (
        <div className="bg-white border border-[var(--kf-stone-soft,#DDD7CB)] rounded-2xl p-12 text-center text-neutral-500 text-xs shadow-2xs">
          <p className="text-sm font-semibold text-neutral-800 mb-1">No budgets set for this month</p>
          <p>Use the form above to set monthly spending ceilings for key categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetStatuses.map((b) => {
            const isOver = b.is_exceeded;
            const pct = b.percentage;

            return (
              <div
                key={b.budget_id}
                className="bg-white border border-[var(--kf-stone-soft,#DDD7CB)] rounded-2xl p-5 shadow-2xs space-y-3 group hover:border-neutral-400 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: b.category_color || '#20251F' }}
                    >
                      <CategoryIcon iconName={b.category_icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900">{b.category_name}</h4>
                      <span className="text-[11px] text-neutral-400">Monthly Ceiling</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOver ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        <AlertTriangle className="w-3 h-3" /> Over Budget
                      </span>
                    ) : pct >= 85 ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[var(--kf-amber-warm,#D99A37)] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Clock className="w-3 h-3" /> Approaching
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle className="w-3 h-3" /> On Track
                      </span>
                    )}

                    <button
                      onClick={() => handleDeleteBudget(b.budget_id, b.category_name)}
                      className="p-1 text-neutral-400 hover:text-rose-600 rounded opacity-70 group-hover:opacity-100 transition"
                      title="Remove budget"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-extrabold text-neutral-900 kf-tnum">
                    {formatAmount(b.total_spent)}
                    <span className="font-normal text-neutral-400 text-[11px] ml-1">
                      spent of {formatAmount(b.monthly_limit)}
                    </span>
                  </span>
                  <span className="font-bold text-neutral-700 kf-tnum">
                    {pct.toFixed(0)}%
                  </span>
                </div>

                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver
                        ? 'bg-rose-500'
                        : pct >= 85
                        ? 'bg-[var(--kf-amber-warm,#D99A37)]'
                        : 'bg-[var(--kf-ink-deep,#20251F)]'
                    }`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
