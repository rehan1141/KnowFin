import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  PieChart,
  CalendarSync,
  Coins,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from '../components/common/LoadingScreen';

const registerSchema = z
  .object({
    full_name: z.string().min(1, 'Full name is required'),
    email: z.string().email('Enter a valid email address'),
    default_currency: z.enum(['EUR', 'USD', 'INR']),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerUser, token, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (token && !isLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, isLoading, navigate]);

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
      setApiError(err.response?.data?.detail || 'Registration failed. Please check your information and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If session is restoring on first mount, show branded loading screen to avoid flash
  if (token && isLoading) {
    return <LoadingScreen message="Getting your finances ready…" />;
  }

  return (
    <div className="min-h-screen bg-[var(--kf-ivory,#F6F2E9)] text-[var(--kf-ink,#20251F)] flex flex-col lg:grid lg:grid-cols-12 selection:bg-[var(--kf-amber,#D99A37)] selection:text-white">
      {/* ── Left Column: Brand & Value Showcase (Desktop) ── */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 flex-col justify-between p-8 xl:p-12 bg-[#FAF8F3] border-r border-[var(--kf-stone,#DDD7CB)] relative overflow-hidden">
        {/* Subtle background glow */}
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[var(--kf-amber,#D99A37)]/5 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Top: Brand Header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <span className="w-9 h-9 rounded-xl bg-[#164A3A] text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-2xs transition-transform group-hover:scale-105">
              K
            </span>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-[var(--kf-ink,#20251F)] leading-none">
                KnowFin
              </span>
              <span className="text-[11px] text-[var(--kf-text-muted,#6B7268)] font-medium mt-0.5">
                Financial Clarity
              </span>
            </div>
          </Link>
        </div>

        {/* Middle: Narrative & Mockup */}
        <div className="relative z-10 my-8 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[var(--kf-stone,#DDD7CB)]/40 text-[var(--kf-text-main,#20251F)]">
              <Sparkles className="w-3.5 h-3.5 text-[var(--kf-amber,#D99A37)]" />
              <span>Honest Student Bookkeeping</span>
            </div>
            <h1 className="text-2xl xl:text-3xl font-bold tracking-tight text-[var(--kf-ink,#20251F)] leading-tight">
              Build financial clarity<br />
              <span className="text-[var(--kf-amber,#D99A37)]">from your very first deposit.</span>
            </h1>
            <p className="text-xs xl:text-sm text-[var(--kf-text-muted,#6B7268)] leading-relaxed max-w-sm">
              Keep your accounts separate, schedule monthly recurring bills, and manage envelopes with transparent arithmetic.
            </p>
          </div>

          {/* Mini Authentic Envelope Mockup (No external image dependencies) */}
          <div className="bg-white border border-[var(--kf-stone,#DDD7CB)] rounded-2xl p-4 xl:p-5 shadow-xs max-w-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--kf-stone,#DDD7CB)]/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[var(--kf-tint-sage-bg)] text-[var(--kf-tint-sage-text)] flex items-center justify-center">
                  <PieChart className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[var(--kf-ink,#20251F)] block leading-tight">
                    Semester Living Budget
                  </span>
                  <span className="text-[10px] text-[var(--kf-text-muted,#6B7268)]">
                    Current Monthly Envelope
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--kf-tint-sage-bg)] text-[var(--kf-tint-sage-text)]">
                On Track
              </span>
            </div>

            {/* Budget Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-[var(--kf-text-muted,#6B7268)]">Spent: €340.00</span>
                <span className="text-[var(--kf-ink,#20251F)] font-semibold">€800.00 Limit</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--kf-stone-light,#ECE8DF)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--kf-sage,#4C9B79)] transition-all"
                  style={{ width: '42.5%' }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-[var(--kf-text-muted,#6B7268)]">
                <span>42.5% consumed</span>
                <span className="text-[var(--kf-tint-sage-text)] font-medium">€460.00 remaining</span>
              </div>
            </div>

            {/* Recurring Plan Preview */}
            <div className="pt-3 border-t border-[var(--kf-stone,#DDD7CB)]/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[var(--kf-tint-lavender-bg)] text-[var(--kf-tint-lavender-text)] flex items-center justify-center">
                  <CalendarSync className="w-3 h-3" />
                </div>
                <span className="text-[11px] text-[var(--kf-text-main,#20251F)] font-medium">
                  Health Insurance (Monthly)
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[var(--kf-ink,#20251F)] tabular-nums">
                €110.00
              </span>
            </div>
          </div>

          {/* Trust Highlights */}
          <div className="space-y-2 text-xs text-[var(--kf-text-muted,#6B7268)]">
            <div className="flex items-center gap-2">
              <Coins className="w-3.5 h-3.5 text-[var(--kf-amber,#D99A37)] shrink-0" />
              <span>Native support for EUR (€), USD ($), and INR (₹)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--kf-sage,#4C9B79)] shrink-0" />
              <span>Independent bank, cash, and savings account tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--kf-cobalt,#4778E5)] shrink-0" />
              <span>No third-party bank scraping or credential storage</span>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="relative z-10 pt-4 border-t border-[var(--kf-stone,#DDD7CB)]/60 text-[11px] text-[var(--kf-text-muted,#6B7268)]">
          KnowFin 2.0 · Safe, private, and built for focused student finances
        </div>
      </div>

      {/* ── Right Column: Form Container (Mobile & Desktop) ── */}
      <div className="flex-1 lg:col-span-7 xl:col-span-7 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12">
        <div className="max-w-md w-full">
          {/* Mobile Header (Shown on < lg screens) */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-[#164A3A] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                K
              </span>
              <span className="text-xl font-bold tracking-tight text-[var(--kf-ink,#20251F)]">
                KnowFin
              </span>
            </Link>
            <p className="mt-1 text-xs text-[var(--kf-text-muted,#6B7268)]">
              Personal Cash Flow & Financial Clarity
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-[var(--kf-stone,#DDD7CB)] rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--kf-ink,#20251F)] tracking-tight">
                Create your account
              </h2>
              <p className="mt-1 text-xs text-[var(--kf-text-muted,#6B7268)]">
                Start managing your cash flow, accounts, and budgets
              </p>
            </div>

            {/* Error Message */}
            {apiError && (
              <div
                role="alert"
                className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="full_name"
                  className="block text-xs font-semibold text-[var(--kf-ink,#20251F)] mb-1"
                >
                  Full Name
                </label>
                <input
                  id="full_name"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Alex Morgan"
                  disabled={isSubmitting}
                  {...register('full_name')}
                  className="w-full px-3.5 py-2 border border-[var(--kf-stone,#DDD7CB)] rounded-xl text-sm text-[var(--kf-ink,#20251F)] outline-none focus:border-[var(--kf-amber,#D99A37)] transition-colors disabled:opacity-60"
                />
                {errors.full_name && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 inline" />
                    <span>{errors.full_name.message}</span>
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-[var(--kf-ink,#20251F)] mb-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@university.edu"
                  disabled={isSubmitting}
                  {...register('email')}
                  className="w-full px-3.5 py-2 border border-[var(--kf-stone,#DDD7CB)] rounded-xl text-sm text-[var(--kf-ink,#20251F)] outline-none focus:border-[var(--kf-amber,#D99A37)] transition-colors disabled:opacity-60"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 inline" />
                    <span>{errors.email.message}</span>
                  </p>
                )}
              </div>

              {/* Primary Currency */}
              <div>
                <label
                  htmlFor="currency"
                  className="block text-xs font-semibold text-[var(--kf-ink,#20251F)] mb-1"
                >
                  Preferred Primary Currency
                </label>
                <select
                  id="currency"
                  disabled={isSubmitting}
                  {...register('default_currency')}
                  className="w-full px-3.5 py-2 border border-[var(--kf-stone,#DDD7CB)] rounded-xl text-sm text-[var(--kf-ink,#20251F)] outline-none focus:border-[var(--kf-amber,#D99A37)] bg-white transition-colors disabled:opacity-60"
                >
                  <option value="EUR">Euro (€ EUR)</option>
                  <option value="USD">US Dollar ($ USD)</option>
                  <option value="INR">Indian Rupee (₹ INR)</option>
                </select>
                <p className="text-[11px] text-[var(--kf-text-muted,#6B7268)] mt-1">
                  You can also switch display currency anytime in Settings.
                </p>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-[var(--kf-ink,#20251F)] mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Min 8 characters"
                    disabled={isSubmitting}
                    {...register('password')}
                    className="w-full px-3.5 py-2 border border-[var(--kf-stone,#DDD7CB)] rounded-xl text-sm text-[var(--kf-ink,#20251F)] outline-none focus:border-[var(--kf-amber,#D99A37)] transition-colors pr-10 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--kf-text-muted,#6B7268)] hover:text-[var(--kf-ink,#20251F)] p-1 rounded-md transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 inline" />
                    <span>{errors.password.message}</span>
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirm_password"
                  className="block text-xs font-semibold text-[var(--kf-ink,#20251F)] mb-1"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    disabled={isSubmitting}
                    {...register('confirm_password')}
                    className="w-full px-3.5 py-2 border border-[var(--kf-stone,#DDD7CB)] rounded-xl text-sm text-[var(--kf-ink,#20251F)] outline-none focus:border-[var(--kf-amber,#D99A37)] transition-colors pr-10 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--kf-text-muted,#6B7268)] hover:text-[var(--kf-ink,#20251F)] p-1 rounded-md transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 inline" />
                    <span>{errors.confirm_password.message}</span>
                  </p>
                )}
              </div>

              {/* Submit Button with Loading Indicator */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-[var(--kf-amber,#D99A37)] hover:bg-[var(--kf-amber-hover,#C5882B)] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-3"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Login */}
            <div className="mt-6 pt-5 border-t border-[var(--kf-stone,#DDD7CB)] text-center">
              <p className="text-xs text-[var(--kf-text-muted,#6B7268)]">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-[var(--kf-amber,#D99A37)] hover:text-[var(--kf-amber-hover,#C5882B)] hover:underline ml-1"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
