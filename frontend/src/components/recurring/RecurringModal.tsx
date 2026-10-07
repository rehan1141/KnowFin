import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, CalendarSync } from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import { accountService } from '../../services/accountService';
import { useCurrency } from '../../contexts/CurrencyContext';
import type {
  RecurringTransaction,
  RecurringTransactionCreate,
  Category,
  Account,
  RecurrenceFrequency,
} from '../../types';

const recurringSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  transaction_type: z.enum(['expense', 'income']),
  category_id: z.coerce.number().optional().nullable(),
  account_id: z.coerce.number().optional().nullable(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  day_of_month: z.coerce.number().min(1).max(31).optional().nullable(),
  start_date: z.string().min(1, 'Start date is required'),
  notes: z.string().optional().nullable(),
});

type RecurringFormData = z.infer<typeof recurringSchema>;

interface RecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RecurringTransactionCreate) => Promise<void>;
  initialData?: RecurringTransaction | null;
}

export const RecurringModal: React.FC<RecurringModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const { symbol } = useCurrency();
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<RecurringFormData>({
    resolver: zodResolver(recurringSchema),
    defaultValues: {
      transaction_type: 'expense',
      frequency: 'monthly',
      day_of_month: 1,
    },
  });

  const selectedFreq = watch('frequency');

  useEffect(() => {
    if (isOpen) {
      categoryService.list('expense').then(setCategories).catch(() => {});
      accountService.list().then((r) => setAccounts(r.accounts)).catch(() => {});

      if (initialData) {
        reset({
          title: initialData.title,
          amount: Number(initialData.amount),
          transaction_type: initialData.transaction_type,
          category_id: initialData.category_id || null,
          account_id: initialData.account_id || null,
          frequency: initialData.frequency,
          day_of_month: initialData.day_of_month || 1,
          start_date: initialData.start_date.split('T')[0],
          notes: initialData.notes || '',
        });
      } else {
        reset({
          title: '',
          amount: '' as any,
          transaction_type: 'expense',
          category_id: null,
          account_id: null,
          frequency: 'monthly',
          day_of_month: 1,
          start_date: new Date().toISOString().split('T')[0],
          notes: '',
        });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: RecurringFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        title: data.title,
        amount: data.amount,
        transaction_type: data.transaction_type,
        category_id: data.category_id ? Number(data.category_id) : null,
        account_id: data.account_id ? Number(data.account_id) : null,
        frequency: data.frequency as RecurrenceFrequency,
        day_of_month: data.frequency === 'monthly' ? Number(data.day_of_month) : null,
        start_date: `${data.start_date}T00:00:00`,
        notes: data.notes || undefined,
        is_active: true,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save recurring payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E8E6DF] animate-in fade-in duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E6DF]">
          <div className="flex items-center gap-2">
            <CalendarSync className="w-4 h-4 text-[#164A3A]" />
            <h2 className="text-base font-bold text-neutral-900">
              {initialData ? 'Edit Recurring Bill' : 'New Recurring Bill'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-neutral-400 hover:text-neutral-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3.5 pt-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Title / Provider
            </label>
            <input
              type="text"
              placeholder="e.g. Rent, Phone, Spotify, Gym, Cloud Hosting"
              {...register('title')}
              className="w-full px-3.5 py-2 border border-[#E8E6DF] rounded-xl text-sm text-neutral-900 outline-none"
              autoFocus
            />
            {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">
                Amount ({symbol})
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('amount')}
                className="w-full px-3.5 py-2 border border-[#E8E6DF] rounded-xl text-sm text-neutral-900 font-bold outline-none"
              />
              {errors.amount && <p className="mt-1 text-xs text-rose-600">{errors.amount.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">
                Frequency
              </label>
              <select
                {...register('frequency')}
                className="w-full px-3 py-2 border border-[#E8E6DF] rounded-xl text-sm text-neutral-900 outline-none bg-white"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">
                Category
              </label>
              <select
                {...register('category_id')}
                className="w-full px-3 py-2 border border-[#E8E6DF] rounded-xl text-sm text-neutral-900 outline-none bg-white"
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">
                Account
              </label>
              <select
                {...register('account_id')}
                className="w-full px-3 py-2 border border-[#E8E6DF] rounded-xl text-sm text-neutral-900 outline-none bg-white"
              >
                <option value="">None</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">
                Start Date
              </label>
              <input
                type="date"
                {...register('start_date')}
                className="w-full px-3 py-2 border border-[#E8E6DF] rounded-xl text-sm text-neutral-900 outline-none"
              />
            </div>

            {selectedFreq === 'monthly' && (
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  Due Day of Month
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="1-31"
                  {...register('day_of_month')}
                  className="w-full px-3 py-2 border border-[#E8E6DF] rounded-xl text-sm text-neutral-900 outline-none"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E8E6DF]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#164A3A] text-white text-xs font-bold rounded-xl hover:bg-[#12382c] transition shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Recurring Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
