import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Edit2, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { expenseService } from '../services/expenseService';
import { categoryService } from '../services/categoryService';
import { ExpenseModal } from '../components/expenses/ExpenseModal';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatDate } from '../utils/formatters';
import type { Expense, Category, ExpenseCreate } from '../types';

export const ExpensesPage: React.FC = () => {
  const { formatAmount } = useCurrency();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [pageSize] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const loadExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await expenseService.list({
        page,
        page_size: pageSize,
        category: selectedCategory || undefined,
        sort_by: 'expense_date',
        sort_order: sortOrder,
      });
      setExpenses(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      // API error handled via interceptor/UI
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, selectedCategory, sortOrder]);

  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleCreate = async (data: ExpenseCreate) => {
    await expenseService.create(data);
    loadExpenses();
  };

  const handleUpdate = async (data: ExpenseCreate) => {
    if (editingExpense) {
      await expenseService.update(editingExpense.id, data);
      loadExpenses();
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      await expenseService.delete(id);
      loadExpenses();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Expenses</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track your daily spending ({total} total)</p>
        </div>
        <button
          onClick={() => {
            setEditingExpense(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-medium rounded-xl hover:opacity-95 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Controls Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-rose-400" />
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 border border-rose-200/80 rounded-xl text-sm bg-white/80 outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Sort Date:</span>
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-3 py-1.5 border border-rose-200/80 rounded-xl text-sm bg-white/80 hover:bg-rose-50 font-medium text-rose-900"
          >
            {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="glass-card rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p>No expenses found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-rose-50/50 border-b border-rose-100 text-xs font-bold text-rose-900/60 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Title</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5 text-right">Amount</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-rose-50/40 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900">{e.title}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="inline-block bg-rose-100/70 text-rose-900 px-2.5 py-1 rounded-lg text-xs font-medium border border-rose-200/50">
                        {e.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(e.expense_date)}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      {formatAmount(e.amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingExpense(e);
                            setIsModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-700 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pages > 1 && (
          <div className="px-6 py-4 border-t border-rose-100 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Page {page} of {pages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 border border-rose-200/80 rounded-lg bg-white hover:bg-rose-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 border border-rose-200/80 rounded-lg bg-white hover:bg-rose-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingExpense ? handleUpdate : handleCreate}
        initialData={editingExpense}
        title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
      />
    </div>
  );
};
