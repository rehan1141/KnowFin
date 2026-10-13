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
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  ArrowLeftRight,
  X,
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

type TypeTab = 'all' | 'expense' | 'income' | 'refund' | 'transfer';

export const ExpensesPage: React.FC = () => {
  const { formatAmount } = useCurrency();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [pageSize] = useState(15);

  // Financial Ledger Totals
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalRefunds, setTotalRefunds] = useState(0);
  const [netExpenses, setNetExpenses] = useState(0);

  // Filters
  const [activeTypeTab, setActiveTypeTab] = useState<TypeTab>('all');
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
      const inc = Number(data.total_income || 0);
      const exp = Number(data.total_expenses || 0);
      const ref = Number(data.total_refunds || 0);
      const net = data.net_expenses !== undefined ? Number(data.net_expenses) : exp - ref;
      setTotalIncome(inc);
      setTotalExpenses(exp);
      setTotalRefunds(ref);
      setNetExpenses(net);
    } catch {
      // Handled silently
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
      // Handled silently
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
    if (window.confirm('Delete this transaction?')) {
      await expenseService.delete(id);
      await loadData();
    }
  };

  const handleResetFilters = () => {
    setActiveTypeTab('all');
    setSelectedCategory('');
    setSelectedAccountId('');
    setSearchQuery('');
    setPage(1);
  };

  const hasActiveFilters =
    activeTypeTab !== 'all' ||
    selectedCategory !== '' ||
    selectedAccountId !== '' ||
    searchQuery.trim() !== '';

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto">
      {/* Header with Title and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[var(--kf-stone-soft,#DDD7CB)]">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-500">
            Activity Ledger
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--kf-ink-deep,#20251F)] mt-0.5">
            Transactions
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Complete transaction history with net spending accounting and atomic transfers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCategoryDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[var(--kf-stone-soft,#DDD7CB)] text-neutral-700 text-xs font-semibold rounded-lg hover:bg-neutral-50 transition shadow-2xs"
          >
            <Tag className="w-3.5 h-3.5 text-neutral-500" />
            <span>Manage Categories</span>
          </button>
          <button
            onClick={() => {
              setEditingExpense(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--kf-ink-deep,#20251F)] text-[var(--kf-ivory-warm,#F6F2E9)] text-xs font-bold rounded-lg hover:opacity-90 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Summary Strip: Income, Gross Spending, Refunds, Net Spending */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white border border-[var(--kf-stone-soft,#DDD7CB)] rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Income</span>
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-lg font-bold text-emerald-700 kf-tnum mt-1">
            +{formatAmount(totalIncome)}
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5">Earned & deposits</p>
        </div>

        <div className="p-3.5 bg-white border border-[var(--kf-stone-soft,#DDD7CB)] rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Gross Spending</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500" />
          </div>
          <p className="text-lg font-bold text-neutral-800 kf-tnum mt-1">
            −{formatAmount(totalExpenses)}
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5">Outflows before refunds</p>
        </div>

        <div className="p-3.5 bg-white border border-[var(--kf-stone-soft,#DDD7CB)] rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Refunds</span>
            <RotateCcw className="w-3.5 h-3.5 text-[var(--kf-amber-warm,#D99A37)]" />
          </div>
          <p className="text-lg font-bold text-[var(--kf-amber-warm,#D99A37)] kf-tnum mt-1">
            +{formatAmount(totalRefunds)}
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5">Reimbursements returned</p>
        </div>

        <div className="p-3.5 bg-white border border-[var(--kf-stone-soft,#DDD7CB)] rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="font-semibold text-neutral-700">Net Spending</span>
            <span className="text-[10px] uppercase font-bold text-neutral-400">Gross − Ref</span>
          </div>
          <p className="text-lg font-extrabold text-[var(--kf-ink-deep,#20251F)] kf-tnum mt-1">
            −{formatAmount(netExpenses)}
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5">True expense burden</p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white border border-[var(--kf-stone-soft,#DDD7CB)] rounded-2xl p-4 shadow-2xs space-y-3">
        {/* Top Controls: Type Tabs and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Transaction Type Filter Pills */}
          <div className="inline-flex p-1 bg-stone-100 rounded-xl text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => {
                setActiveTypeTab('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition shrink-0 ${
                activeTypeTab === 'all'
                  ? 'bg-white text-[var(--kf-ink-deep,#20251F)] shadow-2xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => {
                setActiveTypeTab('expense');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition shrink-0 ${
                activeTypeTab === 'expense'
                  ? 'bg-white text-neutral-900 shadow-2xs font-bold'
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
              className={`px-3 py-1.5 rounded-lg transition shrink-0 ${
                activeTypeTab === 'income'
                  ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => {
                setActiveTypeTab('refund');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition shrink-0 ${
                activeTypeTab === 'refund'
                  ? 'bg-white text-[var(--kf-amber-warm,#D99A37)] shadow-2xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Refunds
            </button>
            <button
              onClick={() => {
                setActiveTypeTab('transfer');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition shrink-0 ${
                activeTypeTab === 'transfer'
                  ? 'bg-white text-stone-800 shadow-2xs font-bold'
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
              placeholder="Search by title or notes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 border border-[var(--kf-stone-soft,#DDD7CB)] rounded-lg text-xs text-neutral-900 outline-none focus:border-[var(--kf-ink-deep,#20251F)] placeholder:text-neutral-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Controls: Category, Account & Sort */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-[var(--kf-stone-soft,#DDD7CB)] text-xs">
          <div className="flex items-center gap-1.5 text-neutral-500 font-medium">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <span>Filter:</span>
          </div>

          {/* Category Select */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 border border-[var(--kf-stone-soft,#DDD7CB)] rounded-lg bg-white text-neutral-800 text-xs outline-none focus:border-[var(--kf-ink-deep,#20251F)] transition"
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
            className="px-2.5 py-1.5 border border-[var(--kf-stone-soft,#DDD7CB)] rounded-lg bg-white text-neutral-800 text-xs outline-none focus:border-[var(--kf-ink-deep,#20251F)] transition"
          >
            <option value="">All Accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 underline underline-offset-2 ml-1 transition"
            >
              Reset filters
            </button>
          )}

          {/* Sort Order Toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="ml-auto px-2.5 py-1.5 border border-[var(--kf-stone-soft,#DDD7CB)] rounded-lg bg-white text-neutral-600 hover:text-neutral-900 font-medium transition"
          >
            {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
          </button>
        </div>
      </div>

      {/* Transactions Ledger List */}
      <div className="bg-white border border-[var(--kf-stone-soft,#DDD7CB)] rounded-2xl overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="divide-y divide-[var(--kf-stone-soft,#DDD7CB)]">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="p-4 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-stone-100" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-36 bg-stone-100 rounded" />
                    <div className="h-3 w-24 bg-stone-100 rounded" />
                  </div>
                </div>
                <div className="h-5 w-20 bg-stone-100 rounded" />
              </div>
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-16 text-neutral-400 text-xs px-4">
            <p className="text-sm font-semibold text-neutral-800 mb-1">
              {hasActiveFilters
                ? 'No transactions match your current filters'
                : 'No transactions recorded yet'}
            </p>
            <p className="mb-4 text-neutral-500">
              {hasActiveFilters
                ? 'Try adjusting your search query, type filter, or clearing the selections above.'
                : 'Record your first income, expense, or transfer to begin tracking.'}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[var(--kf-stone-soft,#DDD7CB)] text-neutral-700 text-xs font-semibold rounded-lg hover:bg-neutral-50 transition"
              >
                Clear all filters
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditingExpense(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--kf-ink-deep,#20251F)] text-[var(--kf-ivory-warm,#F6F2E9)] text-xs font-bold rounded-lg hover:opacity-90 transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add first transaction</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[var(--kf-stone-soft,#DDD7CB)]">
            {expenses.map((tx) => {
              const isIncome = tx.transaction_type === 'income';
              const isTransfer = tx.transaction_type === 'transfer';
              const isRefund = tx.transaction_type === 'refund';

              // Fallback title to category name if blank
              const displayTitle = tx.title && tx.title.trim() ? tx.title : tx.category || 'Transaction';

              return (
                <div
                  key={tx.id}
                  className="p-4 flex items-center justify-between hover:bg-stone-50/60 transition group"
                >
                  {/* Left: Icon, Details & Type Badge */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                      style={{
                        backgroundColor:
                          tx.category_color ||
                          (isIncome
                            ? '#059669'
                            : isRefund
                            ? '#D99A37'
                            : isTransfer
                            ? '#475569'
                            : '#20251F'),
                      }}
                    >
                      {isTransfer ? (
                        <ArrowLeftRight className="w-5 h-5 text-white" />
                      ) : isRefund ? (
                        <RotateCcw className="w-5 h-5 text-white" />
                      ) : (
                        <CategoryIcon iconName={tx.category_icon} className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-neutral-900 truncate">
                          {displayTitle}
                        </span>

                        {/* Distinct Type Badges */}
                        {isRefund && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-[var(--kf-amber-warm,#D99A37)] border border-amber-200">
                            Refund
                          </span>
                        )}
                        {isIncome && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Income
                          </span>
                        )}
                        {isTransfer && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                            Transfer
                          </span>
                        )}

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

                  {/* Right: Amount & Action Buttons */}
                  <div className="flex items-center gap-3 shrink-0 pl-3">
                    <span
                      className={`text-base font-extrabold tracking-tight kf-tnum ${
                        isIncome
                          ? 'text-emerald-700'
                          : isRefund
                          ? 'text-[var(--kf-amber-warm,#D99A37)]'
                          : isTransfer
                          ? 'text-stone-600'
                          : 'text-neutral-900'
                      }`}
                    >
                      {isIncome ? '+' : isRefund ? '+' : isTransfer ? '↔ ' : '−'}
                      {formatAmount(tx.amount)}
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition">
                      <button
                        onClick={() => {
                          setEditingExpense(tx);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition"
                        title="Edit"
                        aria-label="Edit transaction"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete"
                        aria-label="Delete transaction"
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
          <div className="px-6 py-3.5 border-t border-[var(--kf-stone-soft,#DDD7CB)] flex items-center justify-between text-xs text-neutral-600">
            <span>
              Page {page} of {pages} ({total} items)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 border border-[var(--kf-stone-soft,#DDD7CB)] rounded-lg bg-white hover:bg-stone-50 disabled:opacity-40 transition"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 border border-[var(--kf-stone-soft,#DDD7CB)] rounded-lg bg-white hover:bg-stone-50 disabled:opacity-40 transition"
                aria-label="Next page"
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
        defaultType={
          activeTypeTab === 'income'
            ? 'income'
            : activeTypeTab === 'refund'
            ? 'refund'
            : activeTypeTab === 'transfer'
            ? 'transfer'
            : 'expense'
        }
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
