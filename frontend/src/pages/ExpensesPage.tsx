import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Tag,
} from 'lucide-react';
import { expenseService } from '../services/expenseService';
import { categoryService } from '../services/categoryService';
import { accountService } from '../services/accountService';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatShortDate } from '../utils/formatters';
import { CategoryIcon } from '../utils/categoryIcons';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { CategoryManagerDrawer } from '../components/transactions/CategoryManagerDrawer';
import type { Expense, Category, Account, ExpenseCreate, TransactionType } from '../types';

export const ExpensesPage: React.FC = () => {
  const { formatAmount } = useCurrency();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [pageSize] = useState(15);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  // Filters
  const [activeTypeTab, setActiveTypeTab] = useState<'all' | 'expense' | 'income' | 'transfer'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal / Drawer States
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const typeParam = activeTypeTab === 'all' ? undefined : (activeTypeTab as TransactionType);
      const data = await expenseService.list({
        page,
        page_size: pageSize,
        type: typeParam,
        category: selectedCategory || undefined,
        account_id: selectedAccountId ? Number(selectedAccountId) : undefined,
        search: searchQuery.trim() || undefined,
        sort_by: 'expense_date',
        sort_order: sortOrder,
      });
      setExpenses(data.items);
      setTotal(data.total);
      setPages(data.pages);
      setTotalIncome(Number(data.total_income || 0));
      setTotalExpenses(Number(data.total_expenses || 0));
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, activeTypeTab, selectedCategory, selectedAccountId, searchQuery, sortOrder]);

  const loadMetadata = async () => {
    try {
      const [cats, accs] = await Promise.all([categoryService.list(), accountService.list()]);
      setCategories(cats);
      setAccounts(accs.accounts);
    } catch {
      // Handled
    }
  };

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (data: ExpenseCreate) => {
    await expenseService.create(data);
    await loadData();
  };

  const handleUpdate = async (data: ExpenseCreate) => {
    if (editingExpense) {
      await expenseService.update(editingExpense.id, data);
      await loadData();
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this transaction?')) {
      await expenseService.delete(id);
      await loadData();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto">
      {/* Header and Summary Strip */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#E8E6DF]">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-500">
            Activity Ledger
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mt-0.5">
            Transactions
          </h1>
          <div className="flex items-center gap-2 flex-wrap text-xs text-neutral-500 mt-1.5">
            <span className="font-medium text-neutral-700">{total} transaction{total === 1 ? '' : 's'}</span>
            <span className="text-neutral-300">|</span>
            <span className="text-emerald-700 font-semibold">+{formatAmount(totalIncome)} in</span>
            <span className="text-neutral-300">|</span>
            <span className="text-neutral-800 font-semibold">−{formatAmount(totalExpenses)} out</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCategoryDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E8E6DF] text-neutral-700 text-xs font-semibold rounded-lg hover:bg-neutral-50 transition shadow-2xs"
          >
            <Tag className="w-3.5 h-3.5 text-neutral-500" />
            <span>Manage Categories</span>
          </button>
          <button
            onClick={() => {
              setEditingExpense(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#164A3A] text-white text-xs font-bold rounded-lg hover:bg-[#12382c] transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white border border-[#E8E6DF] rounded-2xl p-4 shadow-2xs space-y-3">
        {/* Top Filter Controls: Type Tabs and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Transaction Type Filter Pills */}
          <div className="inline-flex p-1 bg-neutral-100 rounded-lg text-xs font-semibold">
            <button
              onClick={() => {
                setActiveTypeTab('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTypeTab === 'all'
                  ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => {
                setActiveTypeTab('expense');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTypeTab === 'expense'
                  ? 'bg-white text-rose-700 shadow-2xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => {
                setActiveTypeTab('income');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTypeTab === 'income'
                  ? 'bg-white text-[#164A3A] shadow-2xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => {
                setActiveTypeTab('transfer');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTypeTab === 'transfer'
                  ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Transfers
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3.5 py-2 border border-[#E8E6DF] rounded-lg text-xs text-neutral-900 outline-none placeholder:text-neutral-400"
            />
          </div>
        </div>

        {/* Bottom Filter Controls: Category, Account & Sort */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-[#E8E6DF] text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-500 font-medium">Filter:</span>
          </div>

          {/* Category Select */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 border border-[#E8E6DF] rounded-lg bg-white text-neutral-800 text-xs outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Account Select */}
          <select
            value={selectedAccountId}
            onChange={(e) => {
              setSelectedAccountId(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 border border-[#E8E6DF] rounded-lg bg-white text-neutral-800 text-xs outline-none"
          >
            <option value="">All Accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Sort Order Toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="ml-auto px-2.5 py-1.5 border border-[#E8E6DF] rounded-lg bg-white text-neutral-600 hover:text-neutral-900 font-medium transition"
          >
            {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
          </button>
        </div>
      </div>

      {/* Transactions Ledger List */}
      <div className="bg-white border border-[#E8E6DF] rounded-2xl overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-neutral-400">
            <div className="w-6 h-6 rounded-full border-2 border-neutral-300 border-t-[#164A3A] animate-spin mr-2" />
            <span className="text-xs">Loading ledger...</span>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-16 text-neutral-400 text-xs">
            <p className="text-sm font-semibold text-neutral-700 mb-1">
              {searchQuery || selectedCategory || selectedAccountId || activeTypeTab !== 'all'
                ? 'No transactions match your filters'
                : 'No transactions recorded yet'}
            </p>
            <p className="mb-4">
              {searchQuery || selectedCategory || selectedAccountId || activeTypeTab !== 'all'
                ? 'Try adjusting your search or clearing the filters above.'
                : 'Add your first income or expense to start tracking.'}
            </p>
            {!(searchQuery || selectedCategory || selectedAccountId || activeTypeTab !== 'all') && (
              <button
                onClick={() => {
                  setEditingExpense(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#164A3A] text-white text-xs font-bold rounded-lg hover:bg-[#12382c] transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add transaction</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#E8E6DF]">
            {expenses.map((tx) => {
              const isIncome = tx.transaction_type === 'income';
              const isTransfer = tx.transaction_type === 'transfer';
              return (
                <div
                  key={tx.id}
                  className="p-4 flex items-center justify-between hover:bg-neutral-50/60 transition group"
                >
                  {/* Left: Icon and Details */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                      style={{
                        backgroundColor:
                          tx.category_color ||
                          (isIncome ? '#059669' : isTransfer ? '#475569' : '#1F6B50'),
                      }}
                    >
                      <CategoryIcon iconName={tx.category_icon} className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-neutral-900 truncate">
                          {tx.title}
                        </span>
                        {tx.notes && (
                          <span className="text-[11px] text-neutral-400 truncate hidden sm:inline">
                            · {tx.notes}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                        <span className="font-medium text-neutral-700">{tx.category}</span>
                        {tx.subcategory_name && (
                          <>
                            <span>/</span>
                            <span>{tx.subcategory_name}</span>
                          </>
                        )}
                        <span>·</span>
                        <span>{tx.account_name || 'No account'}</span>
                        <span>·</span>
                        <span>{formatShortDate(tx.expense_date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center gap-4 shrink-0 pl-3">
                    <span
                      className={`text-base font-extrabold tracking-tight ${
                        isIncome
                          ? 'text-emerald-700'
                          : isTransfer
                          ? 'text-neutral-600'
                          : 'text-neutral-900'
                      }`}
                    >
                      {isIncome ? '+' : isTransfer ? '↔ ' : '−'}
                      {formatAmount(tx.amount)}
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => {
                          setEditingExpense(tx);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-neutral-800 rounded-lg"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {pages > 1 && (
          <div className="px-6 py-3.5 border-t border-[#E8E6DF] flex items-center justify-between text-xs text-neutral-600">
            <span>
              Page {page} of {pages} ({total} items)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 border border-[#E8E6DF] rounded-lg bg-white hover:bg-neutral-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 border border-[#E8E6DF] rounded-lg bg-white hover:bg-neutral-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Modal and Category Drawer */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingExpense ? handleUpdate : handleCreate}
        initialData={editingExpense}
        defaultType="expense"
      />
      <CategoryManagerDrawer
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
        onCategoryChange={() => {
          loadMetadata();
          loadData();
        }}
      />
    </div>
  );
};
