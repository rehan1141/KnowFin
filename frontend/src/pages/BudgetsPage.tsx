import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  AlertCircle,
} from 'lucide-react';
import { budgetService } from '../services/budgetService';
import { categoryService } from '../services/categoryService';
import { analyticsService } from '../services/analyticsService';
import { useCurrency } from '../contexts/CurrencyContext';
import { CategorySquircle } from '../utils/categoryIcons';
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
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form State
  const [categoryId, setCategoryId] = useState<string>('');
  const [monthlyLimit, setMonthlyLimit] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [cats, statuses] = await Promise.all([
        categoryService.list('expense'),
        analyticsService.getBudgetStatus(selectedMonth, selectedYear),
      ]);
      setCategories(cats);
      setBudgetStatuses(statuses.budgets);
      setTotalBudgeted(Number(statuses.total_budgeted || 0));
      setTotalSpentBudgeted(Number(statuses.total_spent_budgeted || 0));
    } catch (err: any) {
      setLoadError(err?.response?.data?.detail || 'Could not load your monthly budgets.');
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
    setFormError(null);
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
      setFormError(err.response?.data?.detail || 'Failed to save budget limit.');
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

  // ════════════════════ STATE 1: LOADING STATE ════════════════════
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-10 h-10 rounded-full border-3 border-[#DDD7CB] border-t-[#D99A37] animate-spin mb-4" />
        <h2 className="text-base font-normal text-[#20251F]">Loading your budgets...</h2>
        <p className="text-xs text-[#6B7268] mt-1">Comparing spending targets against current activity.</p>
      </div>
    );
  }

  // ════════════════════ STATE 2: ERROR STATE ════════════════════
  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-[16px] bg-[#FDF1EE] border border-[#E97962]/20 flex items-center justify-center text-[#E97962] mb-4">
          <AlertCircle className="w-7 h-7 stroke-[1.75]" />
        </div>
        <h2 className="text-lg font-normal text-[#20251F]">Could not load budgets</h2>
        <p className="text-xs text-[#6B7268] mt-1.5 mb-5 leading-relaxed">{loadError}</p>
        <button
          type="button"
          onClick={loadData}
          className="py-2.5 px-5 rounded-[12px] bg-[#D99A37] text-white hover:bg-[#C5882B] text-xs font-medium transition-colors shadow-xs active:scale-[0.98]"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto pb-12">
      {/* ── 1. Page Header & Date Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DDD7CB]/70">
        <div>
          <h1 className="text-2xl sm:text-3xl font-normal text-[#20251F] tracking-tight">
            Budgets
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7268] mt-0.5">
            Set target limits by category to guard against overspending.
          </p>
        </div>

        {/* Month & Year Filter */}
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

      {/* ── 2. Aggregate Budget Banner (Envelope) ── */}
      <div className="bg-white border border-[#DDD7CB] rounded-[18px] p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-[#6B7268]">
              Total Budgeted Envelope
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-normal text-[#20251F] tracking-tight kf-tnum">
                {formatAmount(totalSpentBudgeted)}
              </span>
              <span className="text-sm font-normal text-[#6B7268] kf-tnum">
                of {formatAmount(totalBudgeted)}
              </span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs font-medium text-[#20251F] block kf-tnum">
              {overallPercentage.toFixed(0)}% Utilized
            </span>
            <span className="text-[11px] text-[#8E948B]">
              {totalBudgeted - totalSpentBudgeted >= 0
                ? `${formatAmount(totalBudgeted - totalSpentBudgeted)} remaining`
                : `${formatAmount(Math.abs(totalBudgeted - totalSpentBudgeted))} over budget`}
            </span>
          </div>
        </div>

        <div className="w-full h-2.5 bg-[#F6F2E9] rounded-full overflow-hidden border border-[#DDD7CB]/40">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              overallPercentage > 100
                ? 'bg-[#E97962]'
                : overallPercentage >= 85
                ? 'bg-[#D99A37]'
                : 'bg-[#4C9B79]'
            }`}
            style={{ width: `${Math.min(overallPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* ── 3. Quick Add Budget Form ── */}
      <div className="bg-white border border-[#DDD7CB] rounded-[18px] p-5 shadow-2xs">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[#6B7268] mb-3">
          Set or Update Category Limit
        </h2>
        {formError && (
          <div className="p-3 bg-[#FDF1EE] border border-[#E97962]/20 rounded-[12px] text-[#E97962] text-xs mb-3">
            {formError}
          </div>
        )}
        <form onSubmit={handleSetBudget} className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            aria-label="Select expense category"
            className="w-full sm:flex-1 px-3.5 py-2.5 border border-[#DDD7CB] rounded-[12px] text-xs text-[#20251F] outline-none bg-white hover:border-[#C4BEB1] focus:border-[#D99A37] transition-colors cursor-pointer"
          >
            <option value="">Select Expense Category...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-48">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E948B] text-xs font-medium">
              {symbol}
            </span>
            <input
              type="number"
              step="0.01"
              placeholder="Monthly Limit"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              aria-label="Monthly limit"
              className="w-full pl-8 pr-3.5 py-2.5 border border-[#DDD7CB] rounded-[12px] text-xs text-[#20251F] outline-none focus:border-[#D99A37] transition-colors kf-tnum bg-white placeholder:text-[#8E948B]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !categoryId || !monthlyLimit}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#D99A37] hover:bg-[#C5882B] text-white text-xs font-medium rounded-[12px] disabled:opacity-50 transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Save Limit</span>
          </button>
        </form>
      </div>

      {/* ── 4. Category Budgets Grid ── */}
      {budgetStatuses.length === 0 ? (
        /* ════════════════ STATE 3: EMPTY BUDGETS STATE ════════════════ */
        <div className="bg-white border border-[#DDD7CB] rounded-[18px] p-12 text-center text-xs shadow-2xs space-y-3">
          <div className="w-12 h-12 mx-auto rounded-[14px] bg-[#F6F2E9] border border-[#DDD7CB]/80 flex items-center justify-center text-[#8E948B]">
            <Target className="w-6 h-6 stroke-[1.5]" aria-hidden="true" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-medium text-[#20251F]">No budgets set for this month</h3>
            <p className="text-[#6B7268]">
              Use the form above to set monthly spending ceilings for key categories.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetStatuses.map((b) => {
            const isOver = b.is_exceeded;
            const pct = b.percentage;

            return (
              <div
                key={b.budget_id}
                className="bg-white border border-[#DDD7CB] rounded-[18px] p-5 shadow-2xs space-y-3.5 group hover:border-[#C4BEB1] hover:shadow-xs transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <CategorySquircle
                      iconName={b.category_icon}
                      color={b.category_color}
                      size="md"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium text-[#20251F] truncate">{b.category_name}</h4>
                      <span className="text-[11px] text-[#6B7268]">Monthly Ceiling</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOver ? (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-[#B03A24] bg-[#FDF1EE] px-2 py-0.5 rounded-[6px] border border-[#E97962]/25">
                        <AlertTriangle className="w-3 h-3 stroke-[2]" aria-hidden="true" /> Over Budget
                      </span>
                    ) : pct >= 85 ? (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-[#8C5C15] bg-[#FBF4E8] px-2 py-0.5 rounded-[6px] border border-[#D99A37]/25">
                        <Clock className="w-3 h-3 stroke-[2]" aria-hidden="true" /> Approaching
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-[#28664D] bg-[#EEF7F2] px-2 py-0.5 rounded-[6px] border border-[#4C9B79]/25">
                        <CheckCircle className="w-3 h-3 stroke-[2]" aria-hidden="true" /> On Track
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteBudget(b.budget_id, b.category_name)}
                      className="p-1.5 text-[#8E948B] hover:text-[#E97962] hover:bg-[#FDF1EE] rounded-[8px] opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                      title="Remove budget"
                      aria-label="Remove budget"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-medium text-[#20251F] kf-tnum">
                    {formatAmount(b.total_spent)}
                    <span className="font-normal text-[#6B7268] text-[11px] ml-1">
                      spent of {formatAmount(b.monthly_limit)}
                    </span>
                  </span>
                  <span className="font-medium text-[#20251F] kf-tnum">
                    {pct.toFixed(0)}%
                  </span>
                </div>

                <div className="w-full h-2 bg-[#F6F2E9] rounded-full overflow-hidden border border-[#DDD7CB]/40">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver
                        ? 'bg-[#E97962]'
                        : pct >= 85
                        ? 'bg-[#D99A37]'
                        : 'bg-[#4C9B79]'
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
