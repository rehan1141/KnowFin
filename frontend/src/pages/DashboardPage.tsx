import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, CreditCard, ArrowUpRight, AlertTriangle, Sparkles, TrendingUp } from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import { expenseService } from '../services/expenseService';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatDate } from '../utils/formatters';
import type { MonthlySummary, BudgetStatusItem, Expense } from '../types';

export const DashboardPage: React.FC = () => {
  const { formatAmount } = useCurrency();
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [budgetStatuses, setBudgetStatuses] = useState<BudgetStatusItem[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [summaryRes, budgetRes, expenseRes] = await Promise.all([
        analyticsService.getMonthlySummary(currentMonth, currentYear),
        analyticsService.getBudgetStatus(currentMonth, currentYear),
        expenseService.list({ page_size: 5, page: 1 }),
      ]);

      setSummary(summaryRes);
      setBudgetStatuses(budgetRes.budgets);
      setRecentExpenses(expenseRes.items);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-transparent p-6 rounded-2xl border border-rose-200/50 backdrop-blur-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 rounded-full text-xs font-semibold text-rose-800 shadow-xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" /> Realtime Financial Overview
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-600 mt-1">
            Overview for {new Date(0, currentMonth - 1).toLocaleString('default', { month: 'long' })} {currentYear}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card glass-card-hover rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/30 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex items-center justify-between text-slate-500 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800/70">Total Spent</span>
            <div className="p-3 bg-gradient-to-br from-rose-400 to-pink-500 text-white rounded-xl shadow-sm">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-4xl font-extrabold text-slate-900">
            {formatAmount(summary?.total_spent || 0)}
          </p>
          <div className="flex items-center gap-1 text-xs text-rose-600 font-medium mt-3">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Recorded for current month</span>
          </div>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200/30 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex items-center justify-between text-slate-500 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-800/70">Transactions</span>
            <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-xl shadow-sm">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <p className="text-4xl font-extrabold text-slate-900">
            {summary?.total_transactions || 0}
          </p>
          <p className="text-xs text-slate-500 mt-3 font-medium">Logged expenses</p>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Budget Health</h2>
            <p className="text-xs text-slate-500">Live progress towards monthly limits</p>
          </div>
          <Link
            to="/budgets"
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 bg-rose-50 border border-rose-200/60 px-3 py-1.5 rounded-xl transition"
          >
            Manage Budgets <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {budgetStatuses.length === 0 ? (
          <p className="text-sm text-slate-500">No budgets set for this month.</p>
        ) : (
          <div className="space-y-6">
            {budgetStatuses.map((b) => {
              const percentageUsed = b.monthly_limit > 0 ? (b.total_spent / b.monthly_limit) * 100 : 0;
              return (
                <div key={b.category_id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-800 flex items-center gap-2">
                      {b.category_name}
                      {b.is_exceeded && (
                        <span className="inline-flex items-center gap-1 text-xs text-rose-700 bg-rose-100/80 px-2.5 py-0.5 rounded-full font-medium">
                          <AlertTriangle className="w-3 h-3" /> Exceeded
                        </span>
                      )}
                    </span>
                    <span className="text-xs font-medium text-slate-600">
                      {formatAmount(b.total_spent)} / {formatAmount(b.monthly_limit)} ({percentageUsed.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-rose-100/50 rounded-full overflow-hidden p-0.5 border border-rose-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        b.is_exceeded
                          ? 'bg-gradient-to-r from-rose-500 to-red-600'
                          : percentageUsed > 80
                          ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                          : 'bg-gradient-to-r from-rose-400 to-pink-500'
                      }`}
                      style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Expenses Table */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
            <p className="text-xs text-slate-500">Latest expense entries</p>
          </div>
          <Link
            to="/expenses"
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 bg-rose-50 border border-rose-200/60 px-3 py-1.5 rounded-xl transition"
          >
            View All <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentExpenses.length === 0 ? (
          <p className="text-sm text-slate-500">No recent expenses found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-rose-100 text-xs font-bold text-rose-900/60 uppercase tracking-wider">
                <tr>
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50">
                {recentExpenses.map((e) => (
                  <tr key={e.id} className="hover:bg-rose-50/40 transition">
                    <td className="py-3.5 font-semibold text-slate-900">{e.title}</td>
                    <td className="py-3.5 text-slate-600">
                      <span className="inline-block bg-rose-100/70 text-rose-900 px-2.5 py-1 rounded-lg text-xs font-medium border border-rose-200/50">
                        {e.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-500 text-xs">{formatDate(e.expense_date)}</td>
                    <td className="py-3.5 text-right font-bold text-slate-900">
                      {formatAmount(e.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
