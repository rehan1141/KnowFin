import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import { useCurrency } from '../../contexts/CurrencyContext';
import type { Expense, ExpenseCreate, Category } from '../../types';

const expenseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  category_id: z.coerce.number().optional().nullable(),
  expense_date: z.string().min(1, 'Date is required'),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseCreate) => Promise<void>;
  initialData?: Expense | null;
  title: string;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}) => {
  const { symbol } = useCurrency();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
  });

  useEffect(() => {
    if (isOpen) {
      categoryService.list().then(setCategories).catch(() => {});
      if (initialData) {
        reset({
          title: initialData.title,
          amount: Number(initialData.amount),
          category_id: initialData.category_id || null,
          expense_date: initialData.expense_date.split('T')[0],
        });
      } else {
        reset({
          title: '',
          amount: 0,
          category_id: null,
          expense_date: new Date().toISOString().split('T')[0],
        });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const selectedCategoryObj = categories.find((c) => c.id === Number(data.category_id));
      await onSubmit({
        ...data,
        category: selectedCategoryObj ? selectedCategoryObj.name : 'Uncategorized',
        category_id: data.category_id ? Number(data.category_id) : null,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              placeholder="Groceries, Rent, Coffee..."
              {...register('title')}
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-rose-400/20 ${
                errors.title ? 'border-rose-400' : 'border-slate-200'
              }`}
            />
            {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Amount ({symbol})</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount')}
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-rose-400/20 ${
                errors.amount ? 'border-rose-400' : 'border-slate-200'
              }`}
            />
            {errors.amount && <p className="mt-1 text-xs text-rose-600">{errors.amount.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              {...register('category_id')}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-rose-400/20 bg-white"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
            <input
              type="date"
              {...register('expense_date')}
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-rose-400/20 ${
                errors.expense_date ? 'border-rose-400' : 'border-slate-200'
              }`}
            />
            {errors.expense_date && (
              <p className="mt-1 text-xs text-rose-600">{errors.expense_date.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-rose-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-medium rounded-xl hover:opacity-95 transition shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
