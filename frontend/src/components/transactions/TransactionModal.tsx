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
  Folder,
  Utensils,
  Car,
  Home,
  Receipt,
  ShoppingBag,
  HeartPulse,
  Gamepad2,
  Tv,
  Plane,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import { accountService } from '../../services/accountService';
import { transferService } from '../../services/transferService';
import { useCurrency } from '../../contexts/CurrencyContext';
import type { Expense, ExpenseCreate, Category, Account, TransactionType } from '../../types';

// Map icon strings to Lucide components
const ICON_MAP: Record<string, React.ElementType> = {
  Utensils,
  Car,
  Home,
  House: Home,
  Receipt,
  ShoppingBag,
  HeartPulse,
  Gamepad2,
  Tv,
  Plane,
  Sparkles,
  GraduationCap,
  Folder,
};

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
    setCategoryError(null);
  };

  const handleAttemptClose = () => {
    // If modal is in success view, close immediately
    if (modalView === 'success') {
      onClose();
      return;
    }
    // If user has typed anything dirty, prompt confirmation
    if (isDirty || (enteredAmount && Number(enteredAmount) > 0) || enteredTitle) {
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

        setSavedSummary({
          amount: data.amount,
          title: data.title ? data.title.trim() : `Transfer to ${toAcc?.name || 'Account'}`,
          categoryName: `Transfer: ${fromAcc?.name} → ${toAcc?.name}`,
          categoryIcon: 'ArrowLeftRight',
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

        setSavedSummary({
          amount: data.amount,
          title: displayTitle,
          categoryName: cat ? cat.name : 'Uncategorized',
          categoryIcon: cat?.icon || 'Folder',
          type: activeType,
          date: data.expense_date,
        });
      }

      setModalView('success');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'We could not reach the server.';
      setErrorMessage(typeof msg === 'string' ? msg : 'Network or server error.');
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

  // Filter categories by active type
  const availableCategories = categories.filter((c) => c.category_type === activeType);

  const CategoryIconComponent = selectedCategory
    ? ICON_MAP[selectedCategory.icon] || Folder
    : Folder;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#20251F]/40 backdrop-blur-xs transition-opacity"
        onClick={handleAttemptClose}
      />

      {/* Modal Dialog (24px radius, calm ivory/stone palette) */}
      <div className="relative w-full max-w-[480px] bg-white rounded-[24px] border border-[#DDD7CB] shadow-2xl overflow-hidden p-6 sm:p-7 z-10 transition-all">
        {/* ── Close Button ── */}
        <button
          onClick={handleAttemptClose}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full text-[#6B7268] hover:text-[#20251F] hover:bg-[#F6F2E9] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ════════════════ VIEW: SUCCESS STATE (State 5) ════════════════ */}
        {modalView === 'success' && savedSummary && (
          <div className="text-center py-4 space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#EAF4EE] flex items-center justify-center text-[#2E7D5B]">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-normal text-[#20251F]">Transaction added</h2>
              <p className="text-base text-[#6B7268]">
                <span className="font-medium text-[#20251F] kf-tnum">
                  {formatAmount(savedSummary.amount)}
                </span>{' '}
                {savedSummary.type === 'expense'
                  ? `spent on ${savedSummary.categoryName}`
                  : savedSummary.type === 'income'
                  ? `earned from ${savedSummary.categoryName}`
                  : savedSummary.categoryName}
              </p>
              <p className="text-xs text-[#8E948B] pt-0.5">
                {new Date(savedSummary.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* Transaction Card */}
            <div className="bg-[#F6F2E9]/70 border border-[#DDD7CB] rounded-[18px] p-4 flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#DDD7CB] flex items-center justify-center text-[#D99A37] shrink-0">
                <CategoryIconComponent className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#20251F] truncate">
                  {savedSummary.title}
                </p>
                <p className="text-xs text-[#8E948B] truncate">
                  {enteredTitle && enteredTitle.trim() ? savedSummary.categoryName : 'No description provided'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetForAnother}
                className="w-full py-3 px-4 rounded-[14px] bg-[#20251F] text-white hover:bg-[#313830] font-medium text-sm transition-colors"
              >
                Add another
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-[14px] bg-[#F6F2E9] text-[#20251F] hover:bg-[#DDD7CB] font-medium text-sm transition-colors border border-[#DDD7CB]"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* ════════════════ VIEW: ERROR STATE (State 6) ════════════════ */}
        {modalView === 'error' && (
          <div className="text-center py-4 space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#FEF3EE] flex items-center justify-center text-[#C2410C]">
              <AlertCircle className="w-8 h-8 stroke-[2]" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-normal text-[#20251F]">Could not save transaction</h2>
              <p className="text-sm text-[#6B7268] max-w-sm mx-auto">
                Please try again. If the problem persists, check your connection and try later.
              </p>
            </div>

            {/* Error Message Box */}
            <div className="bg-[#FEF3EE]/80 border border-[#FDBA74] rounded-[18px] p-4 text-left flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#C2410C] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[#C2410C]">Save error</p>
                <p className="text-xs text-[#9A3412] mt-0.5">{errorMessage}</p>
              </div>
            </div>

            {/* Action Buttons: Preserves entered data */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalView('form')}
                className="w-full py-3 px-4 rounded-[14px] bg-[#D99A37] text-white hover:bg-[#C5882B] font-medium text-sm transition-colors"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-[14px] bg-[#F6F2E9] text-[#20251F] hover:bg-[#DDD7CB] font-medium text-sm transition-colors border border-[#DDD7CB]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ════════════════ VIEW: CONFIRM DISCARD (State 7) ════════════════ */}
        {modalView === 'confirm_discard' && (
          <div className="text-center py-4 space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#FEF8ED] flex items-center justify-center text-[#D99A37]">
              <AlertTriangle className="w-8 h-8 stroke-[2]" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-normal text-[#20251F]">Discard changes?</h2>
              <p className="text-sm text-[#6B7268] max-w-sm mx-auto">
                You have unsaved changes. If you close this window, your entered information will be lost.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-[14px] bg-[#D99A37] text-white hover:bg-[#C5882B] font-medium text-sm transition-colors"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={() => setModalView('form')}
                className="w-full py-3 px-4 rounded-[14px] bg-[#F6F2E9] text-[#20251F] hover:bg-[#DDD7CB] font-medium text-sm transition-colors border border-[#DDD7CB]"
              >
                Keep editing
              </button>
            </div>
          </div>
        )}

        {/* ════════════════ VIEW: DEFAULT FORM (States 1, 2, 3, 4, 8) ════════════════ */}
        {modalView === 'form' && (
          <div className="space-y-5">
            {/* Header */}
            <div>
              <h2 className="text-xl font-medium text-[#20251F]">Add transaction</h2>
              <p className="text-xs text-[#6B7268] mt-0.5">Record your money movement</p>
            </div>

            {/* 3-Segment Type Toggle (Expense | Income | Transfer) */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#F6F2E9] border border-[#DDD7CB] rounded-[16px]">
              <button
                type="button"
                onClick={() => handleTypeToggle('expense')}
                className={`py-2 px-3 text-xs font-medium rounded-[12px] flex items-center justify-center gap-1.5 transition-all ${
                  activeType === 'expense'
                    ? 'bg-[#20251F] text-white shadow-xs'
                    : 'text-[#6B7268] hover:text-[#20251F]'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>Expense</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeToggle('income')}
                className={`py-2 px-3 text-xs font-medium rounded-[12px] flex items-center justify-center gap-1.5 transition-all ${
                  activeType === 'income'
                    ? 'bg-[#20251F] text-white shadow-xs'
                    : 'text-[#6B7268] hover:text-[#20251F]'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Income</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeToggle('transfer')}
                className={`py-2 px-3 text-xs font-medium rounded-[12px] flex items-center justify-center gap-1.5 transition-all ${
                  activeType === 'transfer'
                    ? 'bg-[#20251F] text-white shadow-xs'
                    : 'text-[#6B7268] hover:text-[#20251F]'
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Transfer</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              {/* Amount Field */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#20251F]">
                  Amount <span className="text-[#C2410C]">*</span>
                </label>
                <div
                  className={`relative flex items-center rounded-[14px] border transition-all ${
                    errors.amount
                      ? 'border-[#C2410C] bg-[#FEF3EE]/40 ring-1 ring-[#C2410C]/30'
                      : 'border-[#DDD7CB] bg-white hover:border-[#C4BEB1] focus-within:border-[#D99A37] focus-within:ring-2 focus-within:ring-[#D99A37]/20'
                  }`}
                >
                  <span className="pl-3.5 pr-2 text-sm font-medium text-[#6B7268] select-none">
                    {symbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('amount')}
                    className="w-full py-2.5 pr-3.5 text-base font-normal text-[#20251F] bg-transparent outline-none kf-tnum"
                  />
                </div>
                {errors.amount && (
                  <p className="flex items-center gap-1 text-xs text-[#C2410C] pt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.amount.message}</span>
                  </p>
                )}
              </div>

              {/* ── EXPENSE & INCOME MODE: Category selection ── */}
              {activeType !== 'transfer' && (
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#20251F]">
                    Category <span className="text-[#C2410C]">*</span>
                  </label>
                  <div
                    className={`relative rounded-[14px] border transition-all ${
                      categoryError
                        ? 'border-[#C2410C] bg-[#FEF3EE]/40 ring-1 ring-[#C2410C]/30'
                        : 'border-[#DDD7CB] bg-white hover:border-[#C4BEB1] focus-within:border-[#D99A37]'
                    }`}
                  >
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D99A37] pointer-events-none">
                      <CategoryIconComponent className="w-4 h-4" />
                    </div>
                    <select
                      {...register('category_id')}
                      className="w-full py-2.5 pl-10 pr-8 text-sm text-[#20251F] bg-transparent rounded-[14px] outline-none appearance-none cursor-pointer"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select a category
                      </option>
                      {availableCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {categoryError && (
                    <p className="flex items-center gap-1 text-xs text-[#C2410C] pt-0.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{categoryError}</span>
                    </p>
                  )}
                </div>
              )}

              {/* ── TRANSFER MODE: Source & Destination Accounts (State 8) ── */}
              {activeType === 'transfer' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-[#20251F]">
                      From account <span className="text-[#C2410C]">*</span>
                    </label>
                    <select
                      {...register('account_id')}
                      className="w-full py-2.5 px-3.5 text-sm text-[#20251F] bg-white border border-[#DDD7CB] rounded-[14px] outline-none cursor-pointer hover:border-[#C4BEB1] focus:border-[#D99A37]"
                    >
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.account_type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-[#20251F]">
                      To account <span className="text-[#C2410C]">*</span>
                    </label>
                    <select
                      {...register('to_account_id')}
                      className="w-full py-2.5 px-3.5 text-sm text-[#20251F] bg-white border border-[#DDD7CB] rounded-[14px] outline-none cursor-pointer hover:border-[#C4BEB1] focus:border-[#D99A37]"
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

              {/* Description (Optional) */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#20251F]">
                  Description (optional)
                </label>
                <input
                  type="text"
                  placeholder="What was this for?"
                  {...register('title')}
                  className="w-full py-2.5 px-3.5 text-sm text-[#20251F] bg-white border border-[#DDD7CB] rounded-[14px] outline-none hover:border-[#C4BEB1] focus:border-[#D99A37]"
                />
              </div>

              {/* Date Field */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#20251F]">
                  Date
                </label>
                <input
                  type="date"
                  {...register('expense_date')}
                  className="w-full py-2.5 px-3.5 text-sm text-[#20251F] bg-white border border-[#DDD7CB] rounded-[14px] outline-none hover:border-[#C4BEB1] focus:border-[#D99A37] cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAttemptClose}
                  className="w-full py-3 px-4 rounded-[14px] bg-[#F6F2E9] text-[#20251F] hover:bg-[#DDD7CB] font-medium text-sm transition-colors border border-[#DDD7CB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-[14px] bg-[#D99A37] text-white hover:bg-[#C5882B] disabled:opacity-50 font-medium text-sm transition-colors shadow-xs"
                >
                  {isSubmitting
                    ? 'Saving...'
                    : activeType === 'transfer'
                    ? 'Save transfer'
                    : 'Save transaction'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
