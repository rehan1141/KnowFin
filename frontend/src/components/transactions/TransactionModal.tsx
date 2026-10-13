import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, ArrowDownRight, ArrowUpRight, ArrowLeftRight, ChevronDown, ChevronUp } from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import { accountService } from '../../services/accountService';
import { useCurrency } from '../../contexts/CurrencyContext';
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

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultType = 'expense',
}) => {
  const { symbol } = useCurrency();
  const [activeType, setActiveType] = useState<TransactionType>(defaultType);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      transaction_type: defaultType,
    },
  });

  const selectedCategoryId = watch('category_id');
  const selectedCategory = categories.find((c) => c.id === Number(selectedCategoryId));

  useEffect(() => {
    if (isOpen) {
      categoryService.list().then(setCategories).catch(() => {});
      accountService.list().then((res) => setAccounts(res.accounts)).catch(() => {});

      if (initialData) {
        setActiveType(initialData.transaction_type);
        setShowMoreOptions(true);
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
        setShowMoreOptions(false);
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
  }, [isOpen, initialData, defaultType, reset]);

  const handleTypeToggle = (type: TransactionType) => {
    setActiveType(type);
    setValue('transaction_type', type);
    setValue('category_id', null);
    setValue('subcategory_id', null);
  };

  if (!isOpen) return null;

  const handleFormSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (activeType === 'transfer') {
        const fromAccount = accounts.find((a) => a.id === Number(data.account_id));
        const toAccount = accounts.find((a) => a.id === Number(data.to_account_id));
        const txDate = data.expense_date ? `${data.expense_date}T12:00:00` : undefined;

        // Record transfer out from source account
        await onSubmit({
          title: data.title || `Transfer to ${toAccount ? toAccount.name : 'Account'}`,
          amount: data.amount,
          transaction_type: 'transfer',
          category: 'Transfer',
          account_id: data.account_id ? Number(data.account_id) : null,
          expense_date: txDate,
          notes: data.notes || (toAccount ? `Transfer to ${toAccount.name}` : undefined),
        });

        // If a destination account was picked, record matching transfer in
        if (toAccount && (!initialData || data.to_account_id)) {
          await onSubmit({
            title: `Transfer from ${fromAccount ? fromAccount.name : 'Account'}`,
            amount: data.amount,
            transaction_type: 'transfer',
            category: 'Transfer',
            account_id: toAccount.id,
            expense_date: txDate,
            notes: data.notes || (fromAccount ? `Transfer from ${fromAccount.name}` : undefined),
          });
        }
      } else {
        const selectedCat = categories.find((c) => c.id === Number(data.category_id));
        await onSubmit({
          title: data.title,
          amount: data.amount,
          transaction_type: activeType,
          category: selectedCat ? selectedCat.name : 'Uncategorized',
          category_id: data.category_id ? Number(data.category_id) : null,
          subcategory_id: data.subcategory_id ? Number(data.subcategory_id) : null,
          account_id: data.account_id ? Number(data.account_id) : null,
          expense_date: data.expense_date ? `${data.expense_date}T12:00:00` : undefined,
          notes: data.notes || undefined,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.category_type === activeType);

  const getSubmitLabel = () => {
    if (isSubmitting) return 'Saving...';
    if (initialData) return 'Save changes';
    if (activeType === 'expense') return 'Add expense';
    if (activeType === 'income') return 'Add income';
    return 'Record transfer';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E8E6DF] animate-in fade-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E6DF]">
          <h2 className="text-base font-bold text-neutral-900">
            {initialData ? 'Edit transaction' : 'Add transaction'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Segment Type Toggle: Expense | Income | Transfer */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-100 rounded-xl my-4">
          <button
            type="button"
            onClick={() => handleTypeToggle('expense')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeType === 'expense'
                ? 'bg-white text-rose-700 shadow-2xs font-bold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
            <span>Expense</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeToggle('income')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeType === 'income'
                ? 'bg-white text-[#164A3A] shadow-2xs font-bold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-[#164A3A]" />
            <span>Income</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeToggle('transfer')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeType === 'transfer'
                ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-neutral-700" />
            <span>Transfer</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3.5">
          {/* Amount Field (Hero Number) */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Amount ({symbol})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-semibold text-lg">
                {symbol}
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                autoFocus
                {...register('amount')}
                className="w-full pl-9 pr-3.5 py-2.5 border border-[#E8E6DF] rounded-xl text-xl font-bold text-neutral-900 outline-none transition focus:border-[#164A3A]"
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-xs text-rose-600">{errors.amount.message}</p>
            )}
          </div>

          {/* Title / Description */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Description
            </label>
            <input
              type="text"
              placeholder={
                activeType === 'expense'
                  ? 'e.g. Groceries, Dinner, Metro'
                  : activeType === 'income'
                  ? 'e.g. Salary, Client payout, Dividend'
                  : 'e.g. Move to savings, ATM withdrawal'
              }
              {...register('title')}
              className="w-full px-3.5 py-2 border border-[#E8E6DF] rounded-xl text-sm text-neutral-900 outline-none transition focus:border-[#164A3A]"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>
            )}
          </div>

          {/* Account & Category (or Transfer from/to) */}
          {activeType === 'transfer' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  From Account
                </label>
                <select
                  {...register('account_id')}
                  className="w-full px-3 py-2 border border-[#E8E6DF] rounded-xl text-xs text-neutral-900 outline-none bg-white"
                >
                  <option value="">Select source</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  To Account
                </label>
                <select
                  {...register('to_account_id')}
                  className="w-full px-3 py-2 border border-[#E8E6DF] rounded-xl text-xs text-neutral-900 outline-none bg-white"
                >
                  <option value="">Select destination</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  Account
                </label>
                <select
                  {...register('account_id')}
                  className="w-full px-3 py-2 border border-[#E8E6DF] rounded-xl text-xs text-neutral-900 outline-none bg-white"
                >
                  <option value="">Select Account</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  Category
                </label>
                <select
                  {...register('category_id')}
                  className="w-full px-3 py-2 border border-[#E8E6DF] rounded-xl text-xs text-neutral-900 outline-none bg-white"
                >
                  <option value="">Uncategorized</option>
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Collapsible More Options (Date, Subcategory, Notes) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-800 flex items-center gap-1 transition"
            >
              <span>{showMoreOptions ? 'Fewer options' : 'More options (date, notes)'}</span>
              {showMoreOptions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showMoreOptions && (
              <div className="space-y-3 pt-3 mt-2 border-t border-[#E8E6DF]/70 animate-in fade-in duration-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Date</label>
                    <input
                      type="date"
                      {...register('expense_date')}
                      className="w-full px-3 py-1.5 border border-[#E8E6DF] rounded-xl text-xs text-neutral-900 outline-none"
                    />
                  </div>

                  {activeType !== 'transfer' && (
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1">
                        Subcategory
                      </label>
                      <select
                        {...register('subcategory_id')}
                        disabled={!selectedCategory || !selectedCategory.subcategories?.length}
                        className="w-full px-3 py-1.5 border border-[#E8E6DF] rounded-xl text-xs text-neutral-900 outline-none bg-white disabled:opacity-50"
                      >
                        <option value="">None</option>
                        {selectedCategory?.subcategories?.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    placeholder="Optional memo..."
                    {...register('notes')}
                    className="w-full px-3 py-1.5 border border-[#E8E6DF] rounded-xl text-xs text-neutral-900 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end items-center gap-2.5 pt-4 border-t border-[#E8E6DF]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50 ${
                activeType === 'expense'
                  ? 'bg-neutral-900 hover:bg-neutral-800'
                  : activeType === 'income'
                  ? 'bg-[#164A3A] hover:bg-[#12382c]'
                  : 'bg-neutral-800 hover:bg-neutral-700'
              }`}
            >
              {getSubmitLabel()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
