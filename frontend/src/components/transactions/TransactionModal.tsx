import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  X,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  Check,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import { accountService } from '../../services/accountService';
import { transferService } from '../../services/transferService';
import { useCurrency } from '../../contexts/CurrencyContext';
import { CategoryIcon, CategorySquircle } from '../../utils/categoryIcons';
import type { Expense, ExpenseCreate, Category, Account, TransactionType } from '../../types';

const transactionSchema = z.object({
  title: z.string(),
  amount: z.coerce.number().positive('Please enter an amount.'),
  transaction_type: z.enum(['expense', 'income', 'transfer', 'refund']),
  category_id: z.coerce.number().optional().nullable(),
  subcategory_id: z.coerce.number().optional().nullable(),
  account_id: z.coerce.number().optional().nullable(),
  to_account_id: z.coerce.number().optional().nullable(),
  expense_date: z.string().min(1, 'Date is required'),
  notes: z.string().optional().nullable(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseCreate) => Promise<void>;
  initialData?: Expense | null;
  defaultType?: TransactionType;
}

type ModalView = 'form' | 'success' | 'error' | 'confirm_discard';

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultType = 'expense',
}) => {
  const { symbol, formatAmount } = useCurrency();
  const [activeType, setActiveType] = useState<TransactionType>(defaultType);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalView, setModalView] = useState<ModalView>('form');
  const [savedSummary, setSavedSummary] = useState<{
    amount: number;
    title: string;
    categoryName: string;
    categoryIcon: string;
    categoryColor?: string | null;
    type: TransactionType;
    date: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      title: '',
      amount: '' as any,
      transaction_type: defaultType,
      category_id: null,
      subcategory_id: null,
      account_id: null,
      to_account_id: null,
      expense_date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const selectedCategoryId = watch('category_id');
  const selectedFromAccountId = watch('account_id');
  const enteredAmount = watch('amount');
  const enteredTitle = watch('title');

  const selectedCategory = categories.find((c) => c.id === Number(selectedCategoryId));

  useEffect(() => {
    if (isOpen) {
      categoryService.list().then(setCategories).catch(() => {});
      accountService
        .list()
        .then((res) => {
          setAccounts(res.accounts);
          if (!initialData && res.accounts.length > 0) {
            setValue('account_id', res.accounts[0].id);
            if (res.accounts.length > 1) {
              setValue('to_account_id', res.accounts[1].id);
            }
          }
        })
        .catch(() => {});

      setModalView('form');
      setCategoryError(null);
      setErrorMessage('');

      if (initialData) {
        setActiveType(initialData.transaction_type);
        reset({
          title: initialData.title,
          amount: Number(initialData.amount),
          transaction_type: initialData.transaction_type,
          category_id: initialData.category_id || null,
          subcategory_id: initialData.subcategory_id || null,
          account_id: initialData.account_id || null,
          to_account_id: null,
          expense_date: initialData.expense_date.split('T')[0],
          notes: initialData.notes || '',
        });
      } else {
        setActiveType(defaultType);
        reset({
          title: '',
          amount: '' as any,
          transaction_type: defaultType,
          category_id: null,
          subcategory_id: null,
          account_id: null,
          to_account_id: null,
          expense_date: new Date().toISOString().split('T')[0],
          notes: '',
        });
      }
    }
  }, [isOpen, initialData, defaultType, reset, setValue]);

  if (!isOpen) return null;

  const handleTypeToggle = (type: TransactionType) => {
    setActiveType(type);
    setValue('transaction_type', type);
    setValue('category_id', null);
    setCategoryError(null);
  };

  const handleAttemptClose = () => {
    if (modalView === 'success') {
      onClose();
      return;
    }
    // Prompt confirmation if user has entered an amount, description, or selected a category
    const hasUnsavedChanges =
      isDirty ||
      Boolean(enteredAmount && Number(enteredAmount) > 0) ||
      Boolean(enteredTitle && enteredTitle.trim()) ||
      Boolean(selectedCategoryId);

    if (hasUnsavedChanges) {
      setModalView('confirm_discard');
    } else {
      onClose();
    }
  };

  const handleFormSubmit = async (data: TransactionFormData) => {
    // 1. Validation check for category in expense/income mode
    if (activeType !== 'transfer' && !data.category_id) {
      setCategoryError('Please select a category.');
      return;
    }
    setCategoryError(null);

    // 2. Validation check for transfer accounts
    if (activeType === 'transfer') {
      if (!data.account_id || !data.to_account_id) {
        setErrorMessage('Please select both source and destination accounts.');
        setModalView('error');
        return;
      }
      if (Number(data.account_id) === Number(data.to_account_id)) {
        setErrorMessage('Source and destination accounts must be different.');
        setModalView('error');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (activeType === 'transfer') {
        const fromAcc = accounts.find((a) => a.id === Number(data.account_id));
        const toAcc = accounts.find((a) => a.id === Number(data.to_account_id));
        await transferService.createTransfer({
          from_account_id: Number(data.account_id),
          to_account_id: Number(data.to_account_id),
          amount: data.amount,
          description: data.title ? data.title.trim() : undefined,
          date: data.expense_date ? `${data.expense_date}T12:00:00` : undefined,
        });

        // Show success ONLY after server confirmation
        setSavedSummary({
          amount: data.amount,
          title: data.title ? data.title.trim() : `Transfer to ${toAcc?.name || 'Account'}`,
          categoryName: `Transfer: ${fromAcc?.name} → ${toAcc?.name}`,
          categoryIcon: 'ArrowLeftRight',
          categoryColor: '#4778E5',
          type: 'transfer',
          date: data.expense_date,
        });
      } else {
        const cat = categories.find((c) => c.id === Number(data.category_id));
        const fallbackTitle = cat ? cat.name : activeType === 'income' ? 'Income' : 'Expense';
        const displayTitle = data.title && data.title.trim() ? data.title.trim() : fallbackTitle;

        await onSubmit({
          title: displayTitle,
          amount: data.amount,
          transaction_type: activeType,
          category: cat ? cat.name : 'Uncategorized',
          category_id: data.category_id ? Number(data.category_id) : null,
          subcategory_id: data.subcategory_id ? Number(data.subcategory_id) : null,
          account_id: data.account_id ? Number(data.account_id) : null,
          expense_date: data.expense_date ? `${data.expense_date}T12:00:00` : undefined,
          notes: data.notes || undefined,
        });

        // Show success ONLY after server confirmation
        setSavedSummary({
          amount: data.amount,
          title: displayTitle,
          categoryName: cat ? cat.name : 'Uncategorized',
          categoryIcon: cat?.icon || 'Folder',
          categoryColor: cat?.color,
          type: activeType,
          date: data.expense_date,
        });
      }

      setModalView('success');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'We could not reach the server.';
      setErrorMessage(typeof msg === 'string' ? msg : 'Network or server error.');
      // View switches to error, but form values remain preserved in useForm
      setModalView('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForAnother = () => {
    reset({
      title: '',
      amount: '' as any,
      transaction_type: activeType,
      category_id: null,
      subcategory_id: null,
      account_id: accounts.length > 0 ? accounts[0].id : null,
      to_account_id: accounts.length > 1 ? accounts[1].id : null,
      expense_date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setCategoryError(null);
    setErrorMessage('');
    setModalView('form');
  };

  // Filter categories by active type (expense or income)
  const availableCategories = categories.filter((c) => c.category_type === activeType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#20251F]/40 backdrop-blur-xs transition-opacity"
        onClick={handleAttemptClose}
      />

      {/* Modal Dialog: 24px radius, clean elevated surface */}
      <div className="relative w-full max-w-[500px] bg-white rounded-[24px] border border-[var(--kf-stone,#DDD7CB)] shadow-2xl overflow-hidden p-6 sm:p-7 z-10 transition-all">
        {/* Close Button */}
        <button
          onClick={handleAttemptClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-800 hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ════════════════ VIEW: SUCCESS STATE ════════════════ */}
        {modalView === 'success' && savedSummary && (
          <div className="text-center py-4 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-16 h-16 mx-auto rounded-full kf-tint-sage flex items-center justify-center text-[#28664D]">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-medium text-[var(--kf-ink,#20251F)]">Transaction recorded</h2>
              <p className="text-sm text-neutral-600">
                <span className="font-semibold text-neutral-900 kf-tnum">
                  {formatAmount(savedSummary.amount)}
                </span>{' '}
                {savedSummary.type === 'expense'
                  ? `spent on ${savedSummary.categoryName}`
                  : savedSummary.type === 'income'
                  ? `earned from ${savedSummary.categoryName}`
                  : savedSummary.categoryName}
              </p>
              <p className="text-xs text-neutral-400 pt-0.5">
                {new Date(savedSummary.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* Receipt Card */}
            <div className="bg-[var(--kf-ivory,#F6F2E9)]/60 border border-[var(--kf-stone,#DDD7CB)] rounded-2xl p-4 flex items-center gap-3.5 text-left">
              <CategorySquircle
                iconName={savedSummary.categoryIcon}
                color={savedSummary.categoryColor}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-neutral-900 truncate">
                  {savedSummary.title}
                </p>
                <p className="text-xs text-neutral-500 truncate mt-0.5">
                  {savedSummary.categoryName}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleResetForAnother}
                className="w-full py-2.5 px-4 rounded-xl bg-[var(--kf-ink,#20251F)] text-white hover:opacity-90 font-medium text-xs transition-colors cursor-pointer"
              >
                Add another
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-100 text-neutral-800 hover:bg-stone-200 font-medium text-xs transition-colors border border-[var(--kf-stone,#DDD7CB)] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* ════════════════ VIEW: ERROR STATE ════════════════ */}
        {modalView === 'error' && (
          <div className="text-center py-4 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-16 h-16 mx-auto rounded-full kf-tint-coral flex items-center justify-center text-[#B03A24]">
              <AlertCircle className="w-8 h-8 stroke-[2]" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-medium text-[var(--kf-ink,#20251F)]">Could not record transaction</h2>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Your entered data has been preserved. Please check the details and try again.
              </p>
            </div>

            <div className="kf-tint-coral rounded-2xl p-3.5 text-left flex items-start gap-3 text-xs">
              <AlertCircle className="w-4 h-4 text-[#B03A24] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#B03A24]">Server response:</p>
                <p className="text-[11px] mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setModalView('form')}
                className="w-full py-2.5 px-4 rounded-xl bg-[var(--kf-amber,#D99A37)] text-white hover:bg-[var(--kf-amber-hover,#C5882B)] font-medium text-xs transition-colors cursor-pointer"
              >
                Review and retry
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-100 text-neutral-800 hover:bg-stone-200 font-medium text-xs transition-colors border border-[var(--kf-stone,#DDD7CB)] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ════════════════ VIEW: CONFIRM DISCARD ════════════════ */}
        {modalView === 'confirm_discard' && (
          <div className="text-center py-4 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-16 h-16 mx-auto rounded-full kf-tint-amber flex items-center justify-center text-[#8C5C15]">
              <AlertTriangle className="w-8 h-8 stroke-[2]" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-medium text-[var(--kf-ink,#20251F)]">Discard unsaved entry?</h2>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                You have started entering this transaction. If you close now, your inputs will be discarded.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-[var(--kf-coral,#E97962)] text-white hover:opacity-90 font-medium text-xs transition-colors cursor-pointer"
              >
                Discard entry
              </button>
              <button
                type="button"
                onClick={() => setModalView('form')}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-100 text-neutral-800 hover:bg-stone-200 font-medium text-xs transition-colors border border-[var(--kf-stone,#DDD7CB)] cursor-pointer"
              >
                Keep editing
              </button>
            </div>
          </div>
        )}

        {/* ════════════════ VIEW: FORM VIEW ════════════════ */}
        {modalView === 'form' && (
          <div className="space-y-5 animate-in fade-in duration-100">
            {/* Modal Header */}
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400">
                Quick Add
              </span>
              <h2 className="text-lg font-bold tracking-tight text-[var(--kf-ink,#20251F)] mt-0.5">
                Record Transaction
              </h2>
            </div>

            {/* Distinct 3-Segment Type Toggle (Coral for Expense, Sage for Income, Cobalt for Transfer) */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100/80 border border-[var(--kf-stone,#DDD7CB)] rounded-2xl">
              <button
                type="button"
                onClick={() => handleTypeToggle('expense')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeType === 'expense'
                    ? 'bg-white text-[#B03A24] border border-[#E97962]/40 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/60'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>Expense</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeToggle('income')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeType === 'income'
                    ? 'bg-white text-[#28664D] border border-[#4C9B79]/40 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/60'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Income</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeToggle('transfer')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeType === 'transfer'
                    ? 'bg-white text-[#2953B2] border border-[#4778E5]/40 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/60'
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Transfer</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              {/* Prominent Amount Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-neutral-700">
                    Amount <span className="text-[var(--kf-coral,#E97962)]">*</span>
                  </label>
                  <span className="text-[10px] text-neutral-400">Required</span>
                </div>
                <div
                  className={`relative flex items-center rounded-2xl border transition-all ${
                    errors.amount
                      ? 'border-[#E97962] bg-[#FEF3EE]/40 ring-2 ring-[#E97962]/20'
                      : 'border-[var(--kf-stone,#DDD7CB)] bg-white hover:border-neutral-400 focus-within:border-[var(--kf-amber,#D99A37)] focus-within:ring-3 focus-within:ring-[#D99A37]/15'
                  }`}
                >
                  <span className="pl-4 pr-1 text-xl font-bold text-neutral-400 select-none">
                    {symbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    autoFocus
                    {...register('amount')}
                    className="w-full py-3 pr-4 text-2xl font-bold text-[var(--kf-ink,#20251F)] bg-transparent outline-none kf-tnum"
                  />
                </div>
                {errors.amount && (
                  <p className="flex items-center gap-1 text-xs text-[#B03A24] pt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.amount.message}</span>
                  </p>
                )}
              </div>

              {/* ── EXPENSE & INCOME MODE: Category Selection with Expressive Squircles ── */}
              {activeType !== 'transfer' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-neutral-700">
                      Category <span className="text-[var(--kf-coral,#E97962)]">*</span>
                    </label>
                    <span className="text-[10px] text-neutral-400">
                      {selectedCategory ? selectedCategory.name : 'Choose one'}
                    </span>
                  </div>

                  {/* Primary Category Selector with Squircle Preview */}
                  <div
                    className={`relative flex items-center rounded-xl border bg-white transition-all ${
                      categoryError
                        ? 'border-[#E97962] bg-[#FEF3EE]/40 ring-2 ring-[#E97962]/20'
                        : 'border-[var(--kf-stone,#DDD7CB)] hover:border-neutral-400 focus-within:border-[var(--kf-amber,#D99A37)]'
                    }`}
                  >
                    <div className="pl-3 py-2 shrink-0">
                      <CategoryIcon
                        iconName={selectedCategory?.icon}
                        color={selectedCategory?.color}
                        variant="tinted"
                        size="sm"
                      />
                    </div>

                    <select
                      {...register('category_id')}
                      value={selectedCategoryId ? String(selectedCategoryId) : ''}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : null;
                        setValue('category_id', val, { shouldDirty: true, shouldValidate: true });
                        if (val) setCategoryError(null);
                      }}
                      className="w-full py-2.5 pl-2.5 pr-8 text-xs font-medium text-neutral-900 bg-transparent rounded-xl outline-none appearance-none cursor-pointer"
                    >
                      <option value="" disabled>
                        Select a category...
                      </option>
                      {availableCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 pointer-events-none" />
                  </div>

                  {/* Quick Select Category Chips (Most common 5 categories for quick access) */}
                  {availableCategories.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
                      {availableCategories.slice(0, 5).map((cat) => {
                        const isSelected = Number(selectedCategoryId) === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setValue('category_id', cat.id, { shouldDirty: true, shouldValidate: true });
                              setCategoryError(null);
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 ${
                              isSelected
                                ? 'bg-[var(--kf-ink,#20251F)] text-white shadow-2xs font-semibold'
                                : 'bg-stone-100 text-neutral-700 hover:bg-stone-200/80 border border-transparent'
                            }`}
                          >
                            <CategoryIcon
                              iconName={cat.icon}
                              className="w-3 h-3"
                              variant="raw"
                            />
                            <span>{cat.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {categoryError && (
                    <p className="flex items-center gap-1 text-xs text-[#B03A24] pt-0.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{categoryError}</span>
                    </p>
                  )}
                </div>
              )}

              {/* ── TRANSFER MODE: Source & Destination Accounts ── */}
              {activeType === 'transfer' && (
                <div className="space-y-3 bg-stone-50/70 border border-[var(--kf-stone,#DDD7CB)] rounded-2xl p-3.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-neutral-700">
                      From Account <span className="text-[var(--kf-coral,#E97962)]">*</span>
                    </label>
                    <select
                      {...register('account_id')}
                      className="w-full py-2 px-3 text-xs font-medium text-neutral-900 bg-white border border-[var(--kf-stone,#DDD7CB)] rounded-xl outline-none cursor-pointer focus:border-[var(--kf-amber,#D99A37)]"
                    >
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.account_type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-neutral-700">
                      To Destination Account <span className="text-[var(--kf-coral,#E97962)]">*</span>
                    </label>
                    <select
                      {...register('to_account_id')}
                      className="w-full py-2 px-3 text-xs font-medium text-neutral-900 bg-white border border-[var(--kf-stone,#DDD7CB)] rounded-xl outline-none cursor-pointer focus:border-[var(--kf-amber,#D99A37)]"
                    >
                      {accounts
                        .filter((a) => a.id !== Number(selectedFromAccountId))
                        .map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name} ({acc.account_type})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Optional Description (Falls back to category name if left blank) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-neutral-700">
                    Description
                  </label>
                  <span className="text-[10px] text-neutral-400">
                    Optional (defaults to category)
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Lunch with team, monthly train pass"
                  {...register('title')}
                  className="w-full py-2 px-3.5 text-xs text-neutral-900 bg-white border border-[var(--kf-stone,#DDD7CB)] rounded-xl outline-none hover:border-neutral-400 focus:border-[var(--kf-amber,#D99A37)] transition"
                />
              </div>

              {/* Date & Account (For Expense/Income) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-neutral-700">
                    Date
                  </label>
                  <input
                    type="date"
                    {...register('expense_date')}
                    className="w-full py-2 px-3 text-xs text-neutral-900 bg-white border border-[var(--kf-stone,#DDD7CB)] rounded-xl outline-none hover:border-neutral-400 focus:border-[var(--kf-amber,#D99A37)] cursor-pointer transition"
                  />
                </div>

                {activeType !== 'transfer' && (
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-neutral-700">
                      Paid from Account
                    </label>
                    <select
                      {...register('account_id')}
                      className="w-full py-2 px-3 text-xs font-medium text-neutral-900 bg-white border border-[var(--kf-stone,#DDD7CB)] rounded-xl outline-none hover:border-neutral-400 focus:border-[var(--kf-amber,#D99A37)] cursor-pointer transition"
                    >
                      <option value="">No account (Cash flow)</option>
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAttemptClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-stone-100 text-neutral-800 hover:bg-stone-200 font-medium text-xs transition-colors border border-[var(--kf-stone,#DDD7CB)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-[var(--kf-amber,#D99A37)] text-white hover:bg-[var(--kf-amber-hover,#C5882B)] disabled:opacity-50 font-semibold text-xs transition-colors shadow-xs cursor-pointer active:scale-[0.98]"
                >
                  {isSubmitting
                    ? 'Saving...'
                    : activeType === 'transfer'
                    ? 'Record Transfer'
                    : 'Record Transaction'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
