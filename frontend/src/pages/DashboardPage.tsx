import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, CreditCard, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import { expenseService } from '../services/expenseService';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { MonthlySummary, BudgetStatusItem, Expense } from '../types';

export const DashboardPage: React.FC = () => {
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview for current billing period</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-4">
            <span className="text-sm font-medium">Total Spent</span>
            <div className="p-2 bg-slate-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-slate-700" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {formatCurrency(summary?.total_spent || 0)}
          </p>
          <p className="text-xs text-slate-500 mt-2">Current month</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-4">
            <span className="text-sm font-medium">Transactions</span>
            <div className="p-2 bg-slate-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-slate-700" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {summary?.total_transactions || 0}
          </p>
          <p className="text-xs text-slate-500 mt-2">Recorded expenses</p>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-slate-900">Budget Progress</h2>
          <Link
            to="/budgets"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            Manage Budgets <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {budgetStatuses.length === 0 ? (
          <p className="text-sm text-slate-500">No budgets set for this month.</p>
        ) : (
          <div className="space-y-5">
            {budgetStatuses.map((b) => {
              const percentageUsed = b.monthly_limit > 0 ? (b.total_spent / b.monthly_limit) * 100 : 0;
              return (
                <div key={b.category_id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 flex items-center gap-2">
                      {b.category_name}
                      {b.is_exceeded && (
                        <span className="inline-flex items-center gap-1 text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-normal">
                          <AlertTriangle className="w-3 h-3" /> Exceeded
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatCurrency(b.total_spent)} / {formatCurrency(b.monthly_limit)} ({percentageUsed.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        b.is_exceeded
                          ? 'bg-rose-500'
                          : percentageUsed > 80
                          ? 'bg-amber-500'
                          : 'bg-slate-900'
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
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-slate-900">Recent Expenses</h2>
          <Link
            to="/expenses"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            View All <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentExpenses.length === 0 ? (
          <p className="text-sm text-slate-500">No recent expenses found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentExpenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-medium text-slate-900">{e.title}</td>
                    <td className="py-3 text-slate-600">
                      <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-xs">
                        {e.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 text-xs">{formatDate(e.expense_date)}</td>
                    <td className="py-3 text-right font-medium text-slate-900">
                      {formatCurrency(e.amount)}
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
