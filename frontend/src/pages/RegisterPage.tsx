import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const registerSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Enter a valid email address'),
  default_currency: z.enum(['EUR', 'USD', 'INR']),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      default_currency: 'EUR',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);
    setIsSubmitting(true);
    try {
      await registerUser(data.email, data.password, data.full_name, data.default_currency);
      navigate('/dashboard');
    } catch (err: any) {
      setApiError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3EE] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#164A3A] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
              K
            </span>
            <span className="text-xl font-bold tracking-tight text-neutral-900">KnowFin</span>
          </Link>
          <h2 className="mt-4 text-2xl font-bold text-neutral-900 tracking-tight">
            Create your account
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Start managing your personal cash flow and budgets
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E8E6DF] rounded-2xl p-7 shadow-2xs">
          {apiError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <div>
              <label htmlFor="full_name" className="block text-xs font-semibold text-neutral-700 mb-1">
                Full Name
              </label>
              <input
                id="full_name"
                type="text"
                autoComplete="name"
                placeholder="e.g. Rehan Multani"
                {...register('full_name')}
                className="w-full px-3.5 py-2 border border-[#E8E6DF] rounded-xl text-sm text-neutral-900 outline-none"
              />
              {errors.full_name && (
                <p className="mt-1 text-xs text-rose-600">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-neutral-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register('email')}
                className="w-full px-3.5 py-2 border border-[#E8E6DF] rounded-xl text-sm text-neutral-900 outline-none"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="currency" className="block text-xs font-semibold text-neutral-700 mb-1">
                Preferred Primary Currency
              </label>
              <select
                id="currency"
                {...register('default_currency')}
                className="w-full px-3.5 py-2 border border-[#E8E6DF] rounded-xl text-sm text-neutral-900 outline-none bg-white"
              >
                <option value="EUR">Euro (€ EUR)</option>
                <option value="USD">US Dollar ($ USD)</option>
                <option value="INR">Indian Rupee (₹ INR)</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-neutral-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min 8 characters"
                  {...register('password')}
                  className="w-full px-3.5 py-2 border border-[#E8E6DF] rounded-xl text-sm text-neutral-900 outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirm_password" className="block text-xs font-semibold text-neutral-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirm_password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Re-enter password"
                {...register('confirm_password')}
                className="w-full px-3.5 py-2 border border-[#E8E6DF] rounded-xl text-sm text-neutral-900 outline-none"
              />
              {errors.confirm_password && (
                <p className="mt-1 text-xs text-rose-600">{errors.confirm_password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-[#164A3A] hover:bg-[#12382c] text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5 mt-2"
            >
              <span>{isSubmitting ? 'Creating account...' : 'Create Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E8E6DF] text-center">
            <p className="text-xs text-neutral-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[#164A3A] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
