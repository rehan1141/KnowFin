import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Tag,
  ArrowDownRight,
  ArrowUpRight,
  RotateCcw,
  BarChart2,
  X,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { expenseService } from '../services/expenseService';
import { categoryService } from '../services/categoryService';
import { accountService } from '../services/accountService';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatShortDate } from '../utils/formatters';
import { CategorySquircle } from '../utils/categoryIcons';
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

  // Financial Ledger Totals from API
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
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const activeReqId = useRef(0);

  const loadData = useCallback(async () => {
    const reqId = ++activeReqId.current;
    setIsLoading(true);
    setError(null);
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
      if (reqId !== activeReqId.current) return;
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
    } catch (err: any) {
      if (reqId !== activeReqId.current) return;
      setError(err?.response?.data?.detail || 'Could not load your transactions.');
    } finally {
      if (reqId === activeReqId.current) {
        setIsLoading(false);
      }
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
    <div className="space-y-6 kf-page-transition max-w-5xl mx-auto pb-12">
      {/* ── 1. Page Header: Title and Action Buttons ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DDD7CB]/70">
        <div>
          <h1 className="text-2xl sm:text-3xl font-normal text-[#20251F] tracking-tight">
            Transactions
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7268] mt-0.5">
            Complete transaction activity with net spending accounting and transfers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setIsCategoryDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-[#DDD7CB] text-[#20251F] text-xs font-medium rounded-[12px] hover:bg-[#FAF8F3] hover:border-[#C4BEB1] transition-colors shadow-2xs active:scale-[0.98]"
          >
            <Tag className="w-3.5 h-3.5 text-[#6B7268]" aria-hidden="true" />
            <span>Manage categories</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingExpense(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#D99A37] hover:bg-[#C5882B] text-white text-xs font-medium rounded-[12px] transition-colors shadow-xs active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add transaction</span>
          </button>
        </div>
      </div>

      {/* ── 2. Summary Strip: Income, Gross Spending, Refunds, Net Spending ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Income Card */}
        <div className="p-4 bg-white border border-[#DDD7CB] rounded-[16px] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#6B7268]">
            <span className="font-normal">Income</span>
            <div className="w-6 h-6 rounded-[8px] bg-[#EEF7F2] border border-[#4C9B79]/20 flex items-center justify-center text-[#4C9B79]">
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2]" aria-hidden="true" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-normal text-[#4C9B79] kf-tnum mt-2">
            +{formatAmount(totalIncome)}
          </p>
          <p className="text-[11px] text-[#8E948B] mt-0.5">Earned & inflows</p>
        </div>

        {/* Gross Spending Card */}
        <div className="p-4 bg-white border border-[#DDD7CB] rounded-[16px] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#6B7268]">
            <span className="font-normal">Gross spending</span>
            <div className="w-6 h-6 rounded-[8px] bg-[#FDF1EE] border border-[#E97962]/20 flex items-center justify-center text-[#E97962]">
              <ArrowDownRight className="w-3.5 h-3.5 stroke-[2]" aria-hidden="true" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-normal text-[#E97962] kf-tnum mt-2">
            −{formatAmount(totalExpenses)}
          </p>
          <p className="text-[11px] text-[#8E948B] mt-0.5">Outflows before refunds</p>
        </div>

        {/* Refunds Card */}
        <div className="p-4 bg-white border border-[#DDD7CB] rounded-[16px] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#6B7268]">
            <span className="font-normal">Refunds</span>
            <div className="w-6 h-6 rounded-[8px] bg-[#EDF3FE] border border-[#4778E5]/20 flex items-center justify-center text-[#4778E5]">
              <RotateCcw className="w-3 h-3 stroke-[2]" aria-hidden="true" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-normal text-[#4778E5] kf-tnum mt-2">
            +{formatAmount(totalRefunds)}
          </p>
          <p className="text-[11px] text-[#8E948B] mt-0.5">Reimbursements returned</p>
        </div>

        {/* Net Spending Card */}
        <div className="p-4 bg-white border border-[#DDD7CB] rounded-[16px] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#6B7268]">
            <span className="font-medium text-[#20251F]">Net spending</span>
            <div className="w-6 h-6 rounded-[8px] bg-[#FBF4E8] border border-[#D99A37]/25 flex items-center justify-center text-[#D99A37]">
              <BarChart2 className="w-3.5 h-3.5 stroke-[2]" aria-hidden="true" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-medium text-[#20251F] kf-tnum mt-2">
            −{formatAmount(netExpenses)}
          </p>
          <p className="text-[11px] text-[#8E948B] mt-0.5">Gross minus refunds</p>
        </div>
      </div>

      {/* ── 3. Filter and Control Bar ── */}
      <div className="bg-white border border-[#DDD7CB] rounded-[18px] p-4 shadow-2xs space-y-3.5">
        {/* Top Controls: Type Tabs and Search Box */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Transaction Type Filter Tabs */}
          <div className="inline-flex p-1 bg-[#F6F2E9] rounded-[12px] text-xs font-medium overflow-x-auto border border-[#DDD7CB]/50">
            <button
              type="button"
              onClick={() => {
                setActiveTypeTab('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-[9px] transition-all shrink-0 ${
                activeTypeTab === 'all'
                  ? 'bg-white text-[#20251F] shadow-2xs font-semibold'
                  : 'text-[#6B7268] hover:text-[#20251F]'
              }`}
            >
              All types
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTypeTab('expense');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-[9px] transition-all shrink-0 ${
                activeTypeTab === 'expense'
                  ? 'bg-white text-[#E97962] shadow-2xs font-semibold'
                  : 'text-[#6B7268] hover:text-[#20251F]'
              }`}
            >
              Expenses
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTypeTab('income');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-[9px] transition-all shrink-0 ${
                activeTypeTab === 'income'
                  ? 'bg-white text-[#4C9B79] shadow-2xs font-semibold'
                  : 'text-[#6B7268] hover:text-[#20251F]'
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTypeTab('refund');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-[9px] transition-all shrink-0 ${
                activeTypeTab === 'refund'
                  ? 'bg-white text-[#4778E5] shadow-2xs font-semibold'
                  : 'text-[#6B7268] hover:text-[#20251F]'
              }`}
            >
              Refunds
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTypeTab('transfer');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-[9px] transition-all shrink-0 ${
                activeTypeTab === 'transfer'
                  ? 'bg-white text-[#20251F] shadow-2xs font-semibold'
                  : 'text-[#6B7268] hover:text-[#20251F]'
              }`}
            >
              Transfers
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E948B]" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by title or notes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              aria-label="Search transactions"
              className="w-full pl-9 pr-8 py-2 border border-[#DDD7CB] rounded-[12px] text-xs text-[#20251F] bg-white outline-none focus:border-[#D99A37] placeholder:text-[#8E948B] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setPage(1);
                }}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E948B] hover:text-[#20251F] transition-colors"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Controls: Category, Account, Reset, and Sort Order */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2.5 border-t border-[#DDD7CB]/60 text-xs">
          <div className="flex items-center gap-1.5 text-[#6B7268] font-medium">
            <Filter className="w-3.5 h-3.5 text-[#8E948B]" aria-hidden="true" />
            <span>Filter:</span>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by category"
            className="px-2.5 py-1.5 border border-[#DDD7CB] rounded-[10px] bg-white text-[#20251F] text-xs outline-none hover:border-[#C4BEB1] focus:border-[#D99A37] transition-colors cursor-pointer"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Account Filter */}
          <select
            value={selectedAccountId}
            onChange={(e) => {
              setSelectedAccountId(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by account"
            className="px-2.5 py-1.5 border border-[#DDD7CB] rounded-[10px] bg-white text-[#20251F] text-xs outline-none hover:border-[#C4BEB1] focus:border-[#D99A37] transition-colors cursor-pointer"
          >
            <option value="">All accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-medium text-[#4778E5] hover:underline ml-1 transition-colors"
            >
              Reset filters
            </button>
          )}

          {/* Sort Order Toggle */}
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="ml-auto px-3 py-1.5 border border-[#DDD7CB] rounded-[10px] bg-white text-[#20251F] hover:bg-[#FAF8F3] hover:border-[#C4BEB1] font-medium transition-colors shadow-2xs"
          >
            {sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
          </button>
        </div>
      </div>

      {/* ── 4. Transactions Ledger List ── */}
      <div className="bg-white border border-[#DDD7CB] rounded-[18px] overflow-hidden shadow-2xs">
        {isLoading ? (
          /* Skeleton Loading State */
          <div className="divide-y divide-[#DDD7CB]/60">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="p-4 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-[12px] bg-[#F6F2E9]" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-36 bg-[#F6F2E9] rounded" />
                    <div className="h-3 w-24 bg-[#F6F2E9] rounded" />
                  </div>
                </div>
                <div className="h-5 w-20 bg-[#F6F2E9] rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <div className="text-center py-14 px-4 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-[14px] bg-[#FDF1EE] border border-[#E97962]/20 flex items-center justify-center text-[#E97962]">
              <AlertCircle className="w-6 h-6 stroke-[1.75]" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-[#20251F]">Could not load transactions</p>
            <p className="text-xs text-[#6B7268] max-w-sm mx-auto">{error}</p>
            <button
              type="button"
              onClick={loadData}
              className="py-2 px-4 rounded-[12px] bg-[#D99A37] text-white hover:bg-[#C5882B] text-xs font-medium transition-colors shadow-xs"
            >
              Try again
            </button>
          </div>
        ) : expenses.length === 0 ? (
          /* Empty States (distinguishing active filters vs no records) */
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-[14px] bg-[#F6F2E9] border border-[#DDD7CB]/80 flex items-center justify-center text-[#8E948B]">
              <Calendar className="w-6 h-6 stroke-[1.5]" aria-hidden="true" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <p className="text-sm font-medium text-[#20251F]">
                {hasActiveFilters
                  ? 'No transactions match your current filters'
                  : 'No transactions recorded yet'}
              </p>
              <p className="text-xs text-[#6B7268]">
                {hasActiveFilters
                  ? 'Try adjusting your search query, type filter, or clearing the selections above.'
                  : 'Record your first expense, income, or transfer to begin tracking.'}
              </p>
            </div>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#DDD7CB] text-[#20251F] text-xs font-medium rounded-[12px] hover:bg-[#FAF8F3] transition-colors shadow-2xs"
              >
                Clear all filters
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditingExpense(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#D99A37] hover:bg-[#C5882B] text-white text-xs font-medium rounded-[12px] transition-colors shadow-xs active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Add first transaction</span>
              </button>
            )}
          </div>
        ) : (
          /* Populated Transaction Ledger */
          <div className="divide-y divide-[#DDD7CB]/60">
            {expenses.map((tx) => {
              const isIncome = tx.transaction_type === 'income';
              const isTransfer = tx.transaction_type === 'transfer';
              const isRefund = tx.transaction_type === 'refund';

              const displayTitle = tx.title && tx.title.trim() ? tx.title : tx.category || 'Transaction';

              // Icon determination using CategorySquircle
              const iconName = isTransfer ? 'ArrowLeftRight' : isRefund ? 'RotateCcw' : tx.category_icon;

              return (
                <div
                  key={tx.id}
                  className="p-4 flex items-center justify-between hover:bg-[#FAF8F3] transition-colors group"
                >
                  {/* Left: Squircle Icon, Details & Type Badges */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <CategorySquircle
                      iconName={iconName}
                      color={tx.category_color}
                      size="md"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-[#20251F] truncate">
                          {displayTitle}
                        </span>

                        {/* Distinct Type Badges */}
                        {isRefund && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-[6px] text-[10px] font-medium bg-[#EDF3FE] text-[#2953B2] border border-[#4778E5]/25">
                            Refund
                          </span>
                        )}
                        {isIncome && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-[6px] text-[10px] font-medium bg-[#EEF7F2] text-[#28664D] border border-[#4C9B79]/25">
                            Income
                          </span>
                        )}
                        {isTransfer && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-[6px] text-[10px] font-medium bg-[#F6F2E9] text-[#6B7268] border border-[#DDD7CB]">
                            Transfer
                          </span>
                        )}

                        {tx.notes && (
                          <span className="text-[11px] text-[#8E948B] truncate hidden sm:inline">
                            · {tx.notes}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#6B7268] mt-0.5 flex-wrap">
                        <span className="font-medium text-[#20251F]">{tx.category}</span>
                        {tx.subcategory_name && (
                          <>
                            <span className="text-[#DDD7CB]">/</span>
                            <span>{tx.subcategory_name}</span>
                          </>
                        )}
                        <span className="text-[#DDD7CB]">·</span>
                        <span>{tx.account_name || 'No account'}</span>
                        <span className="text-[#DDD7CB]">·</span>
                        <span>{formatShortDate(tx.expense_date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Action Buttons */}
                  <div className="flex items-center gap-3 shrink-0 pl-3">
                    <span
                      className={`text-sm sm:text-base font-medium kf-tnum ${
                        isIncome
                          ? 'text-[#4C9B79]'
                          : isRefund
                          ? 'text-[#4778E5]'
                          : isTransfer
                          ? 'text-[#6B7268]'
                          : 'text-[#20251F]'
                      }`}
                    >
                      {isIncome ? '+' : isRefund ? '+' : isTransfer ? '↔ ' : '−'}
                      {formatAmount(tx.amount)}
                    </span>

                    {/* Action Buttons: Edit and Delete */}
                    <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingExpense(tx);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-[#6B7268] hover:text-[#20251F] hover:bg-[#F6F2E9] rounded-[8px] transition-colors"
                        title="Edit transaction"
                        aria-label="Edit transaction"
                      >
                        <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(tx.id)}
                        className="p-1.5 text-[#8E948B] hover:text-[#E97962] hover:bg-[#FDF1EE] rounded-[8px] transition-colors"
                        title="Delete transaction"
                        aria-label="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── 5. Pagination Bar ── */}
        {pages > 1 && (
          <div className="px-6 py-3.5 border-t border-[#DDD7CB]/70 flex items-center justify-between text-xs text-[#6B7268]">
            <span>
              Page {page} of {pages} ({total} items)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 border border-[#DDD7CB] rounded-[8px] bg-white hover:bg-[#FAF8F3] disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 border border-[#DDD7CB] rounded-[8px] bg-white hover:bg-[#FAF8F3] disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 6. Modals and Drawers ── */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExpense(null);
        }}
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
