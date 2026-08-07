import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, CreditCard, ArrowUpRight, AlertTriangle, TrendingUp, ShieldCheck } from 'lucide-react';
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-transparent p-6 rounded-2xl border border-emerald-800/50 backdrop-blur-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-300 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Enterprise Financial Overview
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Overview</h1>
          <p className="text-sm text-slate-400 mt-1">
            Performance metrics for {new Date(0, currentMonth - 1).toLocaleString('default', { month: 'long' })} {currentYear}
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="fintech-card fintech-card-hover rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Total Capital Outflow</span>
            <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30 shadow-inner">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-4xl font-black text-white tracking-tight">
            {formatAmount(summary?.total_spent || 0)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-4">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Verified against ledger records</span>
          </div>
        </div>

        <div className="fintech-card fintech-card-hover rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">Executed Transactions</span>
            <div className="p-3 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-500/30 shadow-inner">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <p className="text-4xl font-black text-white tracking-tight">
            {summary?.total_transactions || 0}
          </p>
          <p className="text-xs text-slate-400 font-medium mt-4">Logged expense records</p>
        </div>
      </div>

      {/* Budget Allocation Health */}
      <div className="fintech-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Budget Allocations</h2>
            <p className="text-xs text-slate-400">Realtime tracking against set monthly limits</p>
          </div>
          <Link
            to="/budgets"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-950/60 border border-emerald-800/60 px-3.5 py-2 rounded-xl transition"
          >
            Manage Limits <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {budgetStatuses.length === 0 ? (
          <p className="text-sm text-slate-400">No active budget allocations configured.</p>
        ) : (
          <div className="space-y-6">
            {budgetStatuses.map((b) => {
              const percentageUsed = b.monthly_limit > 0 ? (b.total_spent / b.monthly_limit) * 100 : 0;
              return (
                <div key={b.category_id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-200 flex items-center gap-2">
                      {b.category_name}
                      {b.is_exceeded && (
                        <span className="inline-flex items-center gap-1 text-xs text-rose-300 bg-rose-950/80 border border-rose-800 px-2.5 py-0.5 rounded-full font-semibold">
                          <AlertTriangle className="w-3 h-3" /> Exceeded Limit
                        </span>
                      )}
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      {formatAmount(b.total_spent)} / {formatAmount(b.monthly_limit)} ({percentageUsed.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-emerald-950/80 rounded-full overflow-hidden p-0.5 border border-emerald-900">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        b.is_exceeded
                          ? 'bg-gradient-to-r from-rose-500 to-red-600'
                          : percentageUsed > 80
                          ? 'bg-gradient-to-r from-amber-400 to-emerald-500'
                          : 'bg-gradient-to-r from-emerald-400 to-teal-400'
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

      {/* Recent Transactions Table */}
      <div className="fintech-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Transactions</h2>
            <p className="text-xs text-slate-400">Latest activity log</p>
          </div>
          <Link
            to="/expenses"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-950/60 border border-emerald-800/60 px-3.5 py-2 rounded-xl transition"
          >
            View All <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentExpenses.length === 0 ? (
          <p className="text-sm text-slate-400">No transaction activity logged.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-emerald-800/50 text-xs font-bold text-emerald-400/80 uppercase tracking-wider">
                <tr>
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/40">
                {recentExpenses.map((e) => (
                  <tr key={e.id} className="hover:bg-emerald-900/30 transition">
                    <td className="py-3.5 font-bold text-white">{e.title}</td>
                    <td className="py-3.5 text-slate-300">
                      <span className="inline-block bg-emerald-950 border border-emerald-800 text-emerald-300 px-2.5 py-1 rounded-lg text-xs font-semibold">
                        {e.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-400 text-xs font-medium">{formatDate(e.expense_date)}</td>
                    <td className="py-3.5 text-right font-black text-white">
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
