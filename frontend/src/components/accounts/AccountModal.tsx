import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Landmark } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';
import type { Account, AccountCreate, AccountType, Currency } from '../../types';

const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  account_type: z.enum(['bank', 'cash', 'savings', 'credit_card', 'investment']),
  currency: z.enum(['EUR', 'USD', 'INR']),
  initial_balance: z.string().optional().nullable(),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AccountCreate) => Promise<void>;
  initialData?: Account | null;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const { currency: defaultCurr, symbol } = useCurrency();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      account_type: 'bank',
      currency: defaultCurr,
      initial_balance: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          account_type: initialData.account_type,
          currency: initialData.currency,
          initial_balance:
            initialData.initial_balance !== null && initialData.initial_balance !== undefined
              ? String(initialData.initial_balance)
              : '',
        });
      } else {
        reset({
          name: '',
          account_type: 'bank',
          currency: defaultCurr,
          initial_balance: '',
        });
      }
    }
  }, [isOpen, initialData, defaultCurr, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: AccountFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const parsedBalance =
        data.initial_balance === '' || data.initial_balance === null || data.initial_balance === undefined
          ? null
          : Number(data.initial_balance);

      await onSubmit({
        name: data.name,
        account_type: data.account_type as AccountType,
        currency: data.currency as Currency,
        initial_balance: parsedBalance,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[var(--kf-stone-soft,#DDD7CB)] animate-in fade-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--kf-stone-soft,#DDD7CB)]">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-[var(--kf-ink-deep,#20251F)]" />
            <h3 className="text-base font-bold text-neutral-900">
              {initialData ? 'Edit Account' : 'New Account'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Account Name
            </label>
            <input
              type="text"
              placeholder="e.g. Main Checking, Savings, Cash"
              {...register('name')}
              className="w-full px-3.5 py-2 border border-[var(--kf-stone-soft,#DDD7CB)] rounded-xl text-xs text-neutral-900 outline-none focus:border-[var(--kf-ink-deep,#20251F)] transition"
              autoFocus
            />
            {errors.name && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Account Type
              </label>
              <select
                {...register('account_type')}
                className="w-full px-3 py-2 border border-[var(--kf-stone-soft,#DDD7CB)] rounded-xl text-xs text-neutral-900 outline-none bg-white focus:border-[var(--kf-ink-deep,#20251F)] transition"
              >
                <option value="bank">Bank Account</option>
                <option value="cash">Cash / Wallet</option>
                <option value="savings">Savings Account</option>
                <option value="credit_card">Credit Card</option>
                <option value="investment">Investment / Brokerage</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Currency
              </label>
              <select
                {...register('currency')}
                className="w-full px-3 py-2 border border-[var(--kf-stone-soft,#DDD7CB)] rounded-xl text-xs text-neutral-900 outline-none bg-white focus:border-[var(--kf-ink-deep,#20251F)] transition"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-neutral-700">
                Opening Balance ({symbol})
              </label>
              <span className="text-[10px] text-neutral-400">Optional</span>
            </div>
            <input
              type="number"
              step="0.01"
              placeholder="Leave blank for unset"
              {...register('initial_balance')}
              className="w-full px-3.5 py-2 border border-[var(--kf-stone-soft,#DDD7CB)] rounded-xl text-xs text-neutral-900 outline-none focus:border-[var(--kf-ink-deep,#20251F)] transition kf-tnum"
            />
            <p className="text-[11px] text-neutral-400 mt-1">
              Leave blank to track pure cash flow without assuming an opening bank balance.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[var(--kf-stone-soft,#DDD7CB)] text-neutral-700 text-xs font-semibold rounded-lg hover:bg-stone-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[var(--kf-ink-deep,#20251F)] text-white text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition cursor-pointer shadow-xs"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update Account' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
