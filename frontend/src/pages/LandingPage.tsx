import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  CalendarSync,
  PieChart,
  ShieldCheck,
  Sparkles,
  Menu,
  X,
  ChevronRight,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { KnowFinLogo, KnowFinMark } from '../components/common/KnowFinLogo';

export const LandingPage: React.FC = () => {
  const { token } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F6F2E9] text-[#20251F] flex flex-col font-sans selection:bg-[#164A3A] selection:text-white">
      {/* ── 1. Header: Logo Left, Minimal Nav, CTAs Right ── */}
      <header className="border-b border-[#DDD7CB] bg-[#F6F2E9]/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo with Chunky K & Wordmark */}
          <Link to="/" className="flex items-center gap-1 group">
            <KnowFinLogo size="sm" showTagline={false} />
          </Link>

          {/* Minimal Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#6B7268]">
            <a
              href="#preview"
              className="hover:text-[#164A3A] transition-colors"
            >
              Overview
            </a>
            <a
              href="#benefits"
              className="hover:text-[#164A3A] transition-colors"
            >
              Benefits
            </a>
            <a
              href="#how-it-works"
              className="hover:text-[#164A3A] transition-colors"
            >
              How It Works
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {token ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-[#164A3A] text-white text-xs font-bold rounded-xl hover:bg-[#12382c] transition shadow-xs flex items-center gap-1.5"
              >
                <span>Go to Overview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-[#6B7268] hover:text-[#20251F] px-3 py-2 transition"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-[#164A3A] text-white text-xs font-bold rounded-xl hover:bg-[#12382c] transition shadow-xs flex items-center gap-1.5 group"
                >
                  <span>Get started free</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#6B7268] hover:text-[#20251F] rounded-lg transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-[#20251F]" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#DDD7CB] bg-white px-6 py-4 space-y-3 shadow-sm">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-[#6B7268]">
              <a
                href="#preview"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#164A3A]"
              >
                Overview
              </a>
              <a
                href="#benefits"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#164A3A]"
              >
                Benefits
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#164A3A]"
              >
                How It Works
              </a>
            </nav>
            <div className="pt-3 border-t border-[#DDD7CB] flex flex-col gap-2">
              {token ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 bg-[#164A3A] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Go to Overview
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-xs font-semibold text-[#20251F] border border-[#DDD7CB] rounded-xl"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 bg-[#164A3A] text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Get started free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── 2. Hero Section: Confident, Playful, Centered ── */}
      <main className="flex-1">
        <section className="pt-12 sm:pt-16 pb-14 px-5 sm:px-8 max-w-6xl mx-auto">
          {/* Eyebrow & Headline Block - Centered */}
          <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#DDD7CB] text-[#164A3A] text-[11px] font-bold tracking-wider uppercase shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#164A3A]" />
              YOUR MONEY, MADE CLEAR
            </div>

            {/* Playful Gen-Z Headline with subtle hand-drawn energy accents */}
            <div className="relative inline-block">
              {/* Subtle coral hand-drawn energy spark (top right) */}
              <svg
                className="absolute -top-4 -right-6 sm:-top-5 sm:-right-8 w-6 h-6 text-[#E97962] pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
              </svg>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#20251F] tracking-tight leading-[1.08]">
                Know your money.
              </h1>
            </div>

            <p className="text-sm sm:text-base text-[#6B7268] leading-relaxed max-w-xl mx-auto font-normal">
              See what comes in, what goes out, and what you have left — without making money management a full-time job.
            </p>

            {/* CTAs - Centered & Responsive */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={token ? '/dashboard' : '/register'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#164A3A] text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-[#12382c] transition shadow-xs group"
              >
                <span>{token ? 'Go to Overview' : 'Get started free'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#preview"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[#DDD7CB] font-semibold text-xs sm:text-sm text-[#20251F] rounded-xl hover:bg-stone-50 transition shadow-2xs"
              >
                <span>See how it works</span>
                <ChevronRight className="w-4 h-4 text-[#6B7268]" />
              </a>
            </div>

            {/* Reassurance pills */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-y-2 gap-x-5 text-xs text-[#6B7268]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4C9B79]" />
                No bank credentials required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4C9B79]" />
                Strict net spending & refunds
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4C9B79]" />
                Zero ad tracking
              </span>
            </div>
          </div>

          {/* ── Product Dashboard Preview (Inspired by Gen-Z Reference Mockup) ── */}
          <div
            id="preview"
            className="scroll-mt-20 pt-4"
          >
            <div className="relative max-w-5xl mx-auto">
              {/* Illustrative preview badge */}
              <div className="flex items-center justify-between pb-3 px-2">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#6B7268] uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#4C9B79]" />
                  Illustrative Preview · KnowFin Ledger
                </div>
                <div className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#6B7268]">
                  <Sparkles className="w-3 h-3 text-[#D99A37]" />
                  <span>Interactive Cash Flow View</span>
                </div>
              </div>

              {/* Main Desktop App Card */}
              <div className="bg-white border border-[#DDD7CB] rounded-3xl shadow-md overflow-hidden">
                {/* macOS Style Sleek Top Bar */}
                <div className="h-10 bg-[#FAF8F3] border-b border-[#DDD7CB] px-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E97962]/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D99A37]/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4C9B79]/70" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#164A3A]">
                    <KnowFinMark size={16} />
                    <span>KnowFin</span>
                  </div>
                  <div className="text-[10px] font-semibold text-[#6B7268]">
                    October 2026
                  </div>
                </div>

                {/* Dashboard Interior */}
                <div className="p-5 sm:p-7 space-y-6">
                  {/* Balance & Month Overview Header */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[#DDD7CB]/70">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7268] block">
                        Total Balance
                      </span>
                      <div className="flex items-baseline gap-3 mt-0.5">
                        <span className="text-3xl sm:text-4xl font-extrabold text-[#20251F] tracking-tight tabular-nums">
                          €3,842.50
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#4C9B79]/10 text-[#28664D] border border-[#4C9B79]/20">
                          +€720.00 this month
                        </span>
                      </div>
                    </div>

                    {/* Quick Metric Pills */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="px-3 py-1.5 rounded-xl bg-[#4C9B79]/10 border border-[#4C9B79]/20 flex items-center gap-1.5 text-xs">
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#28664D]" />
                        <div>
                          <span className="text-[10px] text-[#6B7268] block leading-none">Income</span>
                          <span className="font-bold text-[#28664D] tabular-nums">+€2,450.00</span>
                        </div>
                      </div>

                      <div className="px-3 py-1.5 rounded-xl bg-[#E97962]/10 border border-[#E97962]/20 flex items-center gap-1.5 text-xs">
                        <ArrowDownRight className="w-3.5 h-3.5 text-[#B03A24]" />
                        <div>
                          <span className="text-[10px] text-[#6B7268] block leading-none">Spent</span>
                          <span className="font-bold text-[#B03A24] tabular-nums">-€1,730.00</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visual Chart & Category Split Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Monthly Spending Bar Chart (7 cols) */}
                    <div className="lg:col-span-7 bg-[#FAF8F3] border border-[#DDD7CB] rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#20251F]">
                          Monthly Spending Activity
                        </span>
                        <span className="text-[11px] font-medium text-[#6B7268]">
                          Daily Cash Flow
                        </span>
                      </div>

                      {/* Chunky Rounded Bar Chart (Inspired by reference mockup) */}
                      <div className="h-40 flex items-end justify-between gap-2 pt-4 px-1">
                        {[
                          { day: '01', height: '40%', color: '#164A3A', label: '€42' },
                          { day: '05', height: '65%', color: '#D99A37', label: '€85' },
                          { day: '10', height: '30%', color: '#4C9B79', label: '€30' },
                          { day: '15', height: '85%', color: '#E97962', label: '€140' },
                          { day: '20', height: '55%', color: '#164A3A', label: '€70' },
                          { day: '25', height: '45%', color: '#4778E5', label: '€55' },
                          { day: '30', height: '70%', color: '#D99A37', label: '€95' },
                        ].map((bar, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                            <div
                              className="w-full max-w-[28px] rounded-t-lg transition-all group-hover:opacity-90 shadow-2xs"
                              style={{
                                height: bar.height,
                                backgroundColor: bar.color,
                              }}
                            />
                            <span className="text-[10px] font-semibold text-[#6B7268]">
                              {bar.day}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Bottom Buffer Summary */}
                      <div className="pt-2 border-t border-[#DDD7CB]/60 flex items-center justify-between text-xs">
                        <span className="text-[#6B7268]">Available monthly buffer</span>
                        <span className="font-bold text-[#28664D] tabular-nums">€720.00 left</span>
                      </div>
                    </div>

                    {/* Spending by Category (5 cols) */}
                    <div className="lg:col-span-5 bg-[#FAF8F3] border border-[#DDD7CB] rounded-2xl p-5 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#20251F]">
                          Spending by Category
                        </span>
                        <span className="text-[11px] font-medium text-[#6B7268]">
                          October
                        </span>
                      </div>

                      {/* Category rows with vibrant Gen-Z dots and percentages */}
                      <div className="space-y-2.5 text-xs">
                        {[
                          { name: 'Food & Groceries', pct: '28%', amount: '€484.40', color: '#E97962' },
                          { name: 'Transport & Commute', pct: '22%', amount: '€380.60', color: '#4778E5' },
                          { name: 'Bills & Utilities', pct: '18%', amount: '€311.40', color: '#8B79C6' },
                          { name: 'Academic & Campus', pct: '14%', amount: '€242.20', color: '#D99A37' },
                          { name: 'Other Discretionary', pct: '18%', amount: '€311.40', color: '#4C9B79' },
                        ].map((cat, idx) => (
                          <div key={idx} className="flex items-center justify-between py-1 border-b border-[#DDD7CB]/40 last:border-none">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: cat.color }}
                              />
                              <span className="font-medium text-[#20251F]">{cat.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#6B7268]">{cat.pct}</span>
                              <span className="font-bold text-[#20251F] tabular-nums">{cat.amount}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Three Concise Benefits with Clean Visuals ── */}
        <section id="benefits" className="py-20 bg-white border-y border-[#DDD7CB] scroll-mt-16">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="max-w-2xl mx-auto text-center mb-14">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#164A3A]">
                Why KnowFin
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#20251F] mt-1">
                Clarity where other money apps make things noisy.
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7268] mt-2 leading-relaxed">
                No invasive bank logins, broken AI categorisation, or complex investment spreadsheets. Just pure cash flow clarity.
              </p>
            </div>

            {/* 3 Concise Benefit Cards with Varied Visuals */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Benefit 1 */}
              <div className="bg-[#FAF8F3] border border-[#DDD7CB] rounded-3xl p-6 flex flex-col justify-between space-y-6 hover:border-[#164A3A]/30 transition shadow-xs">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#164A3A] text-white flex items-center justify-center shadow-xs">
                    <PieChart className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#20251F]">
                    See what comes in and out.
                  </h3>
                  <p className="text-xs text-[#6B7268] leading-relaxed">
                    Refunds are kept separate from ordinary income, and transfers between your own accounts never falsely inflate spending.
                  </p>
                </div>

                {/* Visual Math Pill */}
                <div className="p-3 bg-white border border-[#DDD7CB] rounded-2xl flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#6B7268]">Net Spending</span>
                  <span className="text-[#20251F] font-bold">Gross − Refunds</span>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="bg-[#FAF8F3] border border-[#DDD7CB] rounded-3xl p-6 flex flex-col justify-between space-y-6 hover:border-[#164A3A]/30 transition shadow-xs">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#8B79C6] text-white flex items-center justify-center shadow-xs">
                    <CalendarSync className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#20251F]">
                    Keep track of what's coming up.
                  </h3>
                  <p className="text-xs text-[#6B7268] leading-relaxed">
                    Map fixed rent, mobile bills, and streaming subscriptions to a 30-day timeline so no bill hits by surprise.
                  </p>
                </div>

                {/* Visual Upcoming Pill */}
                <div className="p-3 bg-white border border-[#DDD7CB] rounded-2xl flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#20251F]">Rent & Broadband</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#4C9B79]/10 text-[#28664D]">
                    Covered
                  </span>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="bg-[#FAF8F3] border border-[#DDD7CB] rounded-3xl p-6 flex flex-col justify-between space-y-6 hover:border-[#164A3A]/30 transition shadow-xs">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#4C9B79] text-white flex items-center justify-center shadow-xs">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#20251F]">
                    Understand your month at a glance.
                  </h3>
                  <p className="text-xs text-[#6B7268] leading-relaxed">
                    Know exactly what is available across bank, cash, and savings envelopes in EUR (€), USD ($), or INR (₹).
                  </p>
                </div>

                {/* Visual Multi-currency Pill */}
                <div className="p-3 bg-white border border-[#DDD7CB] rounded-2xl flex items-center justify-around text-xs font-bold text-[#20251F]">
                  <span>💶 EUR</span>
                  <span className="text-[#DDD7CB]">|</span>
                  <span>💵 USD</span>
                  <span className="text-[#DDD7CB]">|</span>
                  <span>₹ INR</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. How It Works (Three Short Steps) ── */}
        <section id="how-it-works" className="py-20 px-5 sm:px-8 max-w-6xl mx-auto scroll-mt-16">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#164A3A]">
              Simple & Straightforward
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#20251F] tracking-tight mt-1">
              How it works in three steps
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7268] mt-2">
              No complicated setup or banking connections. Start in under a minute.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white border border-[#DDD7CB] rounded-3xl p-6 space-y-4 shadow-xs">
              <span className="w-8 h-8 rounded-full bg-[#164A3A] text-white flex items-center justify-center font-bold text-xs">
                1
              </span>
              <h3 className="text-base font-bold text-[#20251F]">
                Log in three taps.
              </h3>
              <p className="text-xs text-[#6B7268] leading-relaxed">
                Use the Quick Add modal to record expenses, income, or transfers in seconds.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-[#DDD7CB] rounded-3xl p-6 space-y-4 shadow-xs">
              <span className="w-8 h-8 rounded-full bg-[#164A3A] text-white flex items-center justify-center font-bold text-xs">
                2
              </span>
              <h3 className="text-base font-bold text-[#20251F]">
                Spot your habits.
              </h3>
              <p className="text-xs text-[#6B7268] leading-relaxed">
                See real category envelopes and spending patterns without automated guesswork.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-[#DDD7CB] rounded-3xl p-6 space-y-4 shadow-xs">
              <span className="w-8 h-8 rounded-full bg-[#164A3A] text-white flex items-center justify-center font-bold text-xs">
                3
              </span>
              <h3 className="text-base font-bold text-[#20251F]">
                Spend with confidence.
              </h3>
              <p className="text-xs text-[#6B7268] leading-relaxed">
                Check your remaining monthly buffer anytime before making unplanned purchases.
              </p>
            </div>
          </div>
        </section>

        {/* ── 5. Final CTA ── */}
        <section className="py-16 px-5 sm:px-8 max-w-4xl mx-auto text-center">
          <div className="bg-white border border-[#DDD7CB] rounded-3xl p-8 sm:p-12 shadow-sm space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F3] border border-[#DDD7CB] text-[11px] font-bold text-[#164A3A]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Private & Transparent by Design</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-[#20251F] tracking-tight">
              Ready to know your money?
            </h2>

            <p className="text-xs sm:text-sm text-[#6B7268] max-w-md mx-auto leading-relaxed">
              No spreadsheets. No bank credentials. Just an honest, friendly personal finance ledger.
            </p>

            <div className="pt-2 flex justify-center">
              <Link
                to={token ? '/dashboard' : '/register'}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#164A3A] text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-[#12382c] transition shadow-xs group"
              >
                <span>{token ? 'Go to your Dashboard' : 'Get started free'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <p className="text-[11px] text-[#6B7268]">
              Free account · Works across desktop and mobile browsers
            </p>
          </div>
        </section>
      </main>

      {/* ── 6. Simple, Clean Footer ── */}
      <footer className="border-t border-[#DDD7CB] bg-white py-10 px-5 sm:px-8 text-xs text-[#6B7268]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <KnowFinLogo size="sm" showTagline={true} />
          </div>

          <div className="flex items-center gap-5 text-[11px] font-medium text-[#6B7268]">
            <a href="#preview" className="hover:text-[#164A3A] transition">
              Overview
            </a>
            <a href="#benefits" className="hover:text-[#164A3A] transition">
              Benefits
            </a>
            <a href="#how-it-works" className="hover:text-[#164A3A] transition">
              How It Works
            </a>
            <Link to="/login" className="hover:text-[#164A3A] transition">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-[#164A3A] transition">
              Register
            </Link>
          </div>

          <div className="text-[11px] text-neutral-400">
            © 2026 KnowFin. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
