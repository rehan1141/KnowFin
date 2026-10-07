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
  initial_balance: z.coerce.number(),
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
      account_type: 'bank',
      currency: defaultCurr,
      initial_balance: 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          account_type: initialData.account_type,
          currency: initialData.currency,
          initial_balance: Number(initialData.initial_balance),
        });
      } else {
        reset({
          name: '',
          account_type: 'bank',
          currency: defaultCurr,
          initial_balance: 0,
        });
      }
    }
  }, [isOpen, initialData, defaultCurr, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: AccountFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: data.name,
        account_type: data.account_type as AccountType,
        currency: data.currency as Currency,
        initial_balance: data.initial_balance,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E8E6DF] animate-in fade-in duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E6DF]">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-[#164A3A]" />
            <h2 className="text-base font-bold text-neutral-900">
              {initialData ? 'Edit Account' : 'New Account'}
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

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Account Name
            </label>
            <input
              type="text"
              placeholder="e.g. Main Bank, Wallet Cash, Emergency Savings"
              {...register('name')}
              className="w-full px-3.5 py-2 border border-[#E8E6DF] rounded-xl text-sm text-neutral-900 outline-none"
              autoFocus
            />
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">
                Account Type
              </label>
              <select
                {...register('account_type')}
                className="w-full px-3 py-2 border border-[#E8E6DF] rounded-xl text-sm text-neutral-900 outline-none bg-white"
              >
                <option value="bank">Bank Account</option>
                <option value="cash">Cash / Wallet</option>
                <option value="savings">Savings Account</option>
                <option value="credit_card">Credit Card</option>
                <option value="investment">Investment / Brokerage</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">
                Currency
              </label>
              <select
                {...register('currency')}
                className="w-full px-3 py-2 border border-[#E8E6DF] rounded-xl text-sm text-neutral-900 outline-none bg-white"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Opening / Initial Balance ({symbol})
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('initial_balance')}
              className="w-full px-3.5 py-2 border border-[#E8E6DF] rounded-xl text-sm text-neutral-900 outline-none"
            />
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
              {isSubmitting ? 'Saving...' : 'Save Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
