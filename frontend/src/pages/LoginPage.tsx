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
  TrendingUp,
  GraduationCap,
  Briefcase,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from '../components/common/LoadingScreen';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login, token, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
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
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      setApiError(err.response?.data?.detail || 'Incorrect email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If session is restoring on first mount, show branded loading screen to avoid flash
  if (token && isLoading) {
    return <LoadingScreen message="Checking active session..." />;
  }

  return (
    <div className="min-h-screen bg-[var(--kf-ivory,#F6F2E9)] text-[var(--kf-ink,#20251F)] flex flex-col lg:grid lg:grid-cols-12 selection:bg-[var(--kf-amber,#D99A37)] selection:text-white">
      {/* ── Left Column: Brand & Product Showcase (Desktop) ── */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 flex-col justify-between p-8 xl:p-12 bg-[#FAF8F3] border-r border-[var(--kf-stone,#DDD7CB)] relative overflow-hidden">
        {/* Subtle background aesthetic circle */}
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[var(--kf-amber,#D99A37)]/5 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Top: Brand Header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <span className="w-9 h-9 rounded-xl bg-[var(--kf-ink,#20251F)] text-[var(--kf-ivory,#F6F2E9)] flex items-center justify-center font-bold text-sm tracking-tight shadow-xs transition-transform group-hover:scale-105">
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
              <span>Personal Finance Ledger</span>
            </div>
            <h1 className="text-2xl xl:text-3xl font-bold tracking-tight text-[var(--kf-ink,#20251F)] leading-tight">
              Know where your money is.<br />
              <span className="text-[var(--kf-amber,#D99A37)]">Know where it goes.</span>
            </h1>
            <p className="text-xs xl:text-sm text-[var(--kf-text-muted,#6B7268)] leading-relaxed max-w-sm">
              A calm, student-first financial ledger designed to give you honest visibility over every euro, transfer, and account without synthetic estimates.
            </p>
          </div>

          {/* Mini Authentic Mockup Card (No external image dependencies) */}
          <div className="bg-white border border-[var(--kf-stone,#DDD7CB)] rounded-2xl p-4 xl:p-5 shadow-xs max-w-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-[var(--kf-text-muted,#6B7268)] uppercase tracking-wider block">
                  Active Total Balance
                </span>
                <span className="text-2xl font-bold text-[var(--kf-ink,#20251F)] tracking-tight tabular-nums">
                  €4,280.50
                </span>
              </div>
              <div className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-[var(--kf-tint-sage-bg)] text-[var(--kf-tint-sage-text)] border border-[var(--kf-tint-sage-border)] flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>+€840.20</span>
              </div>
            </div>

            {/* Mock Transactions */}
            <div className="space-y-2 pt-2 border-t border-[var(--kf-stone,#DDD7CB)]/50">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[var(--kf-tint-cobalt-bg)] text-[var(--kf-tint-cobalt-text)] flex items-center justify-center">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-medium text-[var(--kf-ink,#20251F)] block leading-tight">
                      Campus Bookstore
                    </span>
                    <span className="text-[10px] text-[var(--kf-text-muted,#6B7268)]">
                      Academic Supplies
                    </span>
                  </div>
                </div>
                <span className="font-semibold text-[var(--kf-tint-coral-text)] tabular-nums">
                  -€45.00
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[var(--kf-tint-sage-bg)] text-[var(--kf-tint-sage-text)] flex items-center justify-center">
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-medium text-[var(--kf-ink,#20251F)] block leading-tight">
                      Freelance Design
                    </span>
                    <span className="text-[10px] text-[var(--kf-text-muted,#6B7268)]">
                      Monthly Stipend
                    </span>
                  </div>
                </div>
                <span className="font-semibold text-[var(--kf-tint-sage-text)] tabular-nums">
                  +€650.00
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[var(--kf-tint-amber-bg)] text-[var(--kf-tint-amber-text)] flex items-center justify-center">
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-medium text-[var(--kf-ink,#20251F)] block leading-tight">
                      Weekly Market
                    </span>
                    <span className="text-[10px] text-[var(--kf-text-muted,#6B7268)]">
                      Groceries
                    </span>
                  </div>
                </div>
                <span className="font-semibold text-[var(--kf-tint-coral-text)] tabular-nums">
                  -€38.20
                </span>
              </div>
            </div>
          </div>

          {/* Trust Highlights */}
          <div className="space-y-2 text-xs text-[var(--kf-text-muted,#6B7268)]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--kf-sage,#4C9B79)] shrink-0" />
              <span>Strict separation of refunds, transfers, and real income</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--kf-cobalt,#4778E5)] shrink-0" />
              <span>Isolated multi-account tracking with zero ad analytics</span>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="relative z-10 pt-4 border-t border-[var(--kf-stone,#DDD7CB)]/60 text-[11px] text-[var(--kf-text-muted,#6B7268)]">
          KnowFin 2.0 · Encrypted sessions & truthful ledger calculations
        </div>
      </div>

      {/* ── Right Column: Form Container (Mobile & Desktop) ── */}
      <div className="flex-1 lg:col-span-7 xl:col-span-7 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12">
        <div className="max-w-md w-full">
          {/* Mobile Header (Shown on < lg screens) */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-[var(--kf-ink,#20251F)] text-[var(--kf-ivory,#F6F2E9)] flex items-center justify-center font-bold text-sm shadow-xs">
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
                Welcome back
              </h2>
              <p className="mt-1 text-xs text-[var(--kf-text-muted,#6B7268)]">
                Sign in to your account to review transactions and budgets
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Address */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-[var(--kf-ink,#20251F)] mb-1.5"
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
                  className="w-full px-3.5 py-2.5 border border-[var(--kf-stone,#DDD7CB)] rounded-xl text-sm text-[var(--kf-ink,#20251F)] outline-none focus:border-[var(--kf-amber,#D99A37)] transition-colors disabled:opacity-60"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 inline" />
                    <span>{errors.email.message}</span>
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-[var(--kf-ink,#20251F)] mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    {...register('password')}
                    className="w-full px-3.5 py-2.5 border border-[var(--kf-stone,#DDD7CB)] rounded-xl text-sm text-[var(--kf-ink,#20251F)] outline-none focus:border-[var(--kf-amber,#D99A37)] transition-colors pr-10 disabled:opacity-60"
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

              {/* Submit Button with Loading Indicator */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-[var(--kf-amber,#D99A37)] hover:bg-[var(--kf-amber-hover,#C5882B)] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
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
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Register */}
            <div className="mt-6 pt-5 border-t border-[var(--kf-stone,#DDD7CB)] text-center">
              <p className="text-xs text-[var(--kf-text-muted,#6B7268)]">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-[var(--kf-amber,#D99A37)] hover:text-[var(--kf-amber-hover,#C5882B)] hover:underline ml-1"
                >
                  Create one free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
