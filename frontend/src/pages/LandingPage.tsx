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
  RotateCcw,
  Landmark,
  Coins,
  Menu,
  X,
  CreditCard,
  ShoppingBag,
  Briefcase,
  Utensils,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LandingPage: React.FC = () => {
  const { token } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F6F2E9] text-[#20251F] flex flex-col font-sans selection:bg-[#164A3A] selection:text-white">
      {/* ── 1. Compact, Polished Header ── */}
      <header className="border-b border-[#DDD7CB] bg-[#F6F2E9]/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          {/* Brand Mark & Wordmark */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="w-8 h-8 rounded-lg bg-[#164A3A] text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-2xs transition-transform group-hover:scale-105">
              K
            </span>
            <span className="text-xl font-bold tracking-tight text-[#20251F]">
              KnowFin
            </span>
          </Link>

          {/* Desktop In-Page Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#6B7268]">
            <a
              href="#preview"
              className="hover:text-[#20251F] transition-colors"
            >
              Overview
            </a>
            <a
              href="#benefits"
              className="hover:text-[#20251F] transition-colors"
            >
              Benefits
            </a>
            <a
              href="#how-it-works"
              className="hover:text-[#20251F] transition-colors"
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
                  className="px-4 py-2 bg-[#164A3A] text-white text-xs font-bold rounded-xl hover:bg-[#12382c] transition shadow-xs flex items-center gap-1.5"
                >
                  <span>Start tracking</span>
                  <ArrowRight className="w-3 h-3" />
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
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#DDD7CB] bg-white px-6 py-4 space-y-3 shadow-sm">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-[#6B7268]">
              <a
                href="#preview"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#20251F]"
              >
                Overview
              </a>
              <a
                href="#benefits"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#20251F]"
              >
                Benefits
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#20251F]"
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
                    Start tracking for free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── 2. Hero Section with Distinctive Composition ── */}
      <main className="flex-1">
        <section className="pt-12 sm:pt-16 pb-16 px-5 sm:px-8 max-w-6xl mx-auto">
          {/* Eyebrow & Headline Block */}
          <div className="max-w-3xl mb-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#DDD7CB] text-[#20251F] text-[11px] font-bold tracking-wider uppercase shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#164A3A]" />
              YOUR MONEY, MADE CLEAR
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#20251F] tracking-tight leading-[1.1]">
              Feel good about where your money goes.
            </h1>

            <p className="text-sm sm:text-base text-[#6B7268] leading-relaxed max-w-2xl font-normal">
              Track spending, understand your habits, and know what you have left — without turning your finances into another full-time job.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to={token ? '/dashboard' : '/register'}
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#164A3A] text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-[#12382c] transition shadow-xs"
              >
                <span>{token ? 'Open Overview' : 'Start tracking for free'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#preview"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-[#DDD7CB] font-semibold text-xs sm:text-sm text-[#20251F] rounded-xl hover:bg-stone-50 transition shadow-2xs"
              >
                <span>Explore the dashboard</span>
                <ChevronRight className="w-4 h-4 text-[#6B7268]" />
              </a>
            </div>

            {/* Micro trust indicators */}
            <div className="pt-3 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-[#6B7268]">
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

          {/* ── Product Dashboard Preview Mockup ── */}
          <div
            id="preview"
            className="bg-white border border-[#DDD7CB] rounded-3xl shadow-sm p-5 sm:p-8 space-y-6 scroll-mt-24 relative overflow-hidden"
          >
            {/* Illustrative Notice Pill */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#DDD7CB]/70">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4C9B79] animate-pulse" />
                <span className="text-[11px] font-bold text-[#6B7268] uppercase tracking-wider">
                  Illustrative Preview · KnowFin Ledger
                </span>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F6F2E9] border border-[#DDD7CB] text-[11px] font-medium text-[#6B7268]">
                <Sparkles className="w-3 h-3 text-[#D99A37]" />
                <span>Active Financial Workspace</span>
              </div>
            </div>

            {/* Balance Hero & Monthly Strip */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Balance Summary (5 cols) */}
              <div className="lg:col-span-5 bg-[#FAF8F3] border border-[#DDD7CB] rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#6B7268] uppercase tracking-wider">
                    Total Active Balance
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#4C9B79]/10 text-[#28664D] border border-[#4C9B79]/20">
                    +€720.00 this month
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#20251F] tracking-tight tabular-nums">
                  €3,842.50
                </div>
                <p className="text-xs text-[#6B7268] leading-relaxed">
                  Real aggregate balance across Main Bank (€2,420), Savings Cushion (€1,200), and Cash Wallet (€222.50).
                </p>

                {/* Account mini pills */}
                <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-[#DDD7CB] text-[#20251F] font-medium flex items-center gap-1.5">
                    <Landmark className="w-3 h-3 text-[#164A3A]" /> Main Bank: €2,420.00
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-[#DDD7CB] text-[#20251F] font-medium flex items-center gap-1.5">
                    <Coins className="w-3 h-3 text-[#D99A37]" /> Savings: €1,200.00
                  </span>
                </div>
              </div>

              {/* Monthly Cash Flow Metrics (7 cols) */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white border border-[#DDD7CB] rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4C9B79]">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Income</span>
                  </div>
                  <div className="text-xl font-bold text-[#20251F] tabular-nums">
                    +€2,450.00
                  </div>
                  <span className="text-[10px] text-[#6B7268] block">
                    Stipend & Freelance
                  </span>
                </div>

                <div className="bg-white border border-[#DDD7CB] rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#E97962]">
                    <ArrowDownRight className="w-4 h-4" />
                    <span>Net Spending</span>
                  </div>
                  <div className="text-xl font-bold text-[#20251F] tabular-nums">
                    -€1,730.00
                  </div>
                  <span className="text-[10px] text-[#6B7268] block">
                    Gross minus refunds
                  </span>
                </div>

                <div className="bg-white border border-[#DDD7CB] rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4778E5]">
                    <Sparkles className="w-4 h-4" />
                    <span>Available Left</span>
                  </div>
                  <div className="text-xl font-bold text-[#20251F] tabular-nums">
                    €720.00
                  </div>
                  <span className="text-[10px] text-[#6B7268] block">
                    Remaining in envelopes
                  </span>
                </div>

                {/* Mini Envelope Progress Bar below metrics */}
                <div className="sm:col-span-3 bg-[#FAF8F3] border border-[#DDD7CB] rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#20251F]">Monthly Spending Envelope</span>
                    <span className="font-bold text-[#20251F] tabular-nums">70.6% consumed</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#DDD7CB]/50 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#164A3A] transition-all"
                      style={{ width: '70.6%' }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-[#6B7268]">
                    <span>€1,730.00 spent</span>
                    <span className="font-medium text-[#28664D]">€720.00 remaining buffer</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Subgrid: Upcoming Obligations & Recent Transactions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              {/* Coming up this month */}
              <div className="border border-[#DDD7CB] rounded-2xl p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#20251F] flex items-center gap-1.5">
                    <CalendarSync className="w-3.5 h-3.5 text-[#8B79C6]" />
                    Upcoming Fixed Obligations
                  </span>
                  <span className="text-[10px] font-semibold text-[#6B7268] uppercase">30-day projection</span>
                </div>
                <div className="space-y-2 text-xs divide-y divide-[#DDD7CB]/40">
                  <div className="flex justify-between items-center pt-1.5">
                    <div>
                      <span className="font-semibold text-[#20251F] block">Student Housing Rent</span>
                      <span className="text-[10px] text-[#6B7268]">Fixed bill · Due in 3 days</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#20251F] block tabular-nums">€450.00</span>
                      <span className="text-[10px] text-[#28664D] bg-[#4C9B79]/10 px-1.5 py-0.5 rounded font-medium">Covered</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div>
                      <span className="font-semibold text-[#20251F] block">High-Speed Broadband</span>
                      <span className="text-[10px] text-[#6B7268]">Utilities · Due in 11 days</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#20251F] block tabular-nums">€25.00</span>
                      <span className="text-[10px] text-[#28664D] bg-[#4C9B79]/10 px-1.5 py-0.5 rounded font-medium">Covered</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Ledger Entries */}
              <div className="border border-[#DDD7CB] rounded-2xl p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#20251F] flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#4778E5]" />
                    Recent Ledger Activity
                  </span>
                  <span className="text-[10px] font-semibold text-[#6B7268] uppercase">Real-time entries</span>
                </div>
                <div className="space-y-2 text-xs divide-y divide-[#DDD7CB]/40">
                  <div className="flex justify-between items-center pt-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-[#D99A37]/15 text-[#8C5C15] flex items-center justify-center">
                        <ShoppingBag className="w-3 h-3" />
                      </div>
                      <div>
                        <span className="font-semibold text-[#20251F] block">Campus Bookstore</span>
                        <span className="text-[10px] text-[#6B7268]">Academic Supplies</span>
                      </div>
                    </div>
                    <span className="font-bold text-[#B03A24] tabular-nums">-€45.00</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-[#4C9B79]/15 text-[#28664D] flex items-center justify-center">
                        <Briefcase className="w-3 h-3" />
                      </div>
                      <div>
                        <span className="font-semibold text-[#20251F] block">Freelance Web Work</span>
                        <span className="text-[10px] text-[#6B7268]">Client Deposit</span>
                      </div>
                    </div>
                    <span className="font-bold text-[#28664D] tabular-nums">+€600.00</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-[#D99A37]/15 text-[#8C5C15] flex items-center justify-center">
                        <RotateCcw className="w-3 h-3" />
                      </div>
                      <div>
                        <span className="font-semibold text-[#20251F] block">Transit Ticket Refund</span>
                        <span className="text-[10px] text-[#8C5C15] font-medium">Refund (Lowers Net Spending)</span>
                      </div>
                    </div>
                    <span className="font-bold text-[#8C5C15] tabular-nums">+€28.50</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Product Benefits (Visually Varied, Non-Generic Layout) ── */}
        <section id="benefits" className="py-20 bg-white border-y border-[#DDD7CB] scroll-mt-16">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="max-w-2xl mb-12">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#164A3A]">
                Why KnowFin
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#20251F] mt-1">
                Clarity where other money apps make things noisy.
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7268] mt-2 leading-relaxed">
                Most personal finance apps sell ads, spam premium features, or guess your numbers with broken auto-categorization. KnowFin keeps your ledger honest and clear.
              </p>
            </div>

            {/* Asymmetrical 3-Card Bento Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Benefit 1: See where your money goes (Wide 7 cols) */}
              <div className="lg:col-span-7 bg-[#FAF8F3] border border-[#DDD7CB] rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#164A3A] text-white flex items-center justify-center shadow-xs">
                    <PieChart className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-[#20251F]">
                    See where your money goes.
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B7268] leading-relaxed max-w-md">
                    Refunds are kept completely separate from ordinary income, and transfers between your own accounts never artificially inflate your spending totals.
                  </p>
                </div>

                {/* Mini UI Snippet */}
                <div className="bg-white border border-[#DDD7CB] rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-[#DDD7CB]/60">
                    <span className="font-semibold text-[#20251F]">Honest Net Spending Formula</span>
                    <span className="text-[11px] text-[#28664D] font-bold">100% Truthful</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-[#FAF8F3]">
                      <span className="text-[10px] text-[#6B7268] block">Gross Spend</span>
                      <span className="font-bold text-[#20251F]">€1,758.50</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#D99A37]/10 text-[#8C5C15]">
                      <span className="text-[10px] block">- Refunds</span>
                      <span className="font-bold">€28.50</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#4C9B79]/10 text-[#28664D]">
                      <span className="text-[10px] block">= Net Spend</span>
                      <span className="font-bold">€1,730.00</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefit 2: Keep track of what is coming up (Tall 5 cols) */}
              <div className="lg:col-span-5 bg-[#FAF8F3] border border-[#DDD7CB] rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#8B79C6] text-white flex items-center justify-center shadow-xs">
                    <CalendarSync className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-[#20251F]">
                    Keep track of what is coming up.
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B7268] leading-relaxed">
                    Recurring monthly obligations like rent, Wi-Fi, and transport passes are surfaced ahead of time so nothing surprises you mid-month.
                  </p>
                </div>

                {/* Visual recurring pill stack */}
                <div className="space-y-2 bg-white border border-[#DDD7CB] rounded-2xl p-4 text-xs">
                  <div className="flex justify-between items-center py-1">
                    <span className="font-medium text-[#20251F]">Next 30 Days Forecast</span>
                    <span className="font-bold text-[#164A3A]">€475.00 total</span>
                  </div>
                  <div className="w-full bg-[#FAF8F3] rounded-xl p-2.5 flex items-center justify-between text-[11px]">
                    <span className="text-[#6B7268]">Rent & Utilities</span>
                    <span className="font-semibold text-[#20251F]">Oct 28</span>
                  </div>
                </div>
              </div>

              {/* Benefit 3: Understand your month at a glance (Full-width 12 cols) */}
              <div className="lg:col-span-12 bg-[#FAF8F3] border border-[#DDD7CB] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="w-10 h-10 rounded-xl bg-[#4C9B79] text-white flex items-center justify-center shadow-xs">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-[#20251F]">
                    Understand your month at a glance.
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B7268] leading-relaxed">
                    Whether using Euro, US Dollar, or Indian Rupee, your accounts reflect pure arithmetic. Missing balances are clearly flagged as unconfigured rather than fake zeroes.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="px-4 py-3 rounded-2xl bg-white border border-[#DDD7CB] text-xs font-semibold text-[#20251F] shadow-2xs">
                    💶 Native Euro (€)
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white border border-[#DDD7CB] text-xs font-semibold text-[#20251F] shadow-2xs">
                    💵 US Dollar ($)
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white border border-[#DDD7CB] text-xs font-semibold text-[#20251F] shadow-2xs">
                    ₹ Indian Rupee (₹)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. How It Works (3 Easy Steps with UI Snippets) ── */}
        <section id="how-it-works" className="py-20 px-5 sm:px-8 max-w-6xl mx-auto scroll-mt-16">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#164A3A]">
              Simple & Straightforward
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#20251F] tracking-tight mt-1">
              How KnowFin works in three steps
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7268] mt-2">
              No complicated onboarding, sync failures, or manual reconciliation headaches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white border border-[#DDD7CB] rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xs">
              <div className="space-y-3">
                <span className="w-8 h-8 rounded-full bg-[#164A3A] text-white flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <h3 className="text-base font-bold text-[#20251F]">
                  Add your income and expenses.
                </h3>
                <p className="text-xs text-[#6B7268] leading-relaxed">
                  Log transactions in three taps using the Quick Add modal. Pick between Expense, Income, or Transfer without jumping through hoops.
                </p>
              </div>

              {/* UI Snippet */}
              <div className="p-3 bg-[#FAF8F3] border border-[#DDD7CB] rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#164A3A] text-white text-[10px] font-bold">Expense</span>
                  <span className="px-2 py-0.5 rounded-md bg-stone-200 text-[#6B7268] text-[10px]">Income</span>
                </div>
                <span className="font-bold text-[#20251F] tabular-nums">€12.50</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-[#DDD7CB] rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xs">
              <div className="space-y-3">
                <span className="w-8 h-8 rounded-full bg-[#164A3A] text-white flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <h3 className="text-base font-bold text-[#20251F]">
                  See your spending patterns.
                </h3>
                <p className="text-xs text-[#6B7268] leading-relaxed">
                  Understand where your cash actually went with real category squircles for Groceries, Academic, Housing, and Dining.
                </p>
              </div>

              {/* UI Snippet */}
              <div className="p-3 bg-[#FAF8F3] border border-[#DDD7CB] rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#4C9B79]/15 text-[#28664D] flex items-center justify-center">
                    <Utensils className="w-3 h-3" />
                  </div>
                  <span className="font-medium text-[#20251F]">Dining & Food</span>
                </div>
                <span className="text-[11px] font-semibold text-[#6B7268]">€210 / €300</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-[#DDD7CB] rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xs">
              <div className="space-y-3">
                <span className="w-8 h-8 rounded-full bg-[#164A3A] text-white flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <h3 className="text-base font-bold text-[#20251F]">
                  Make more informed everyday decisions.
                </h3>
                <p className="text-xs text-[#6B7268] leading-relaxed">
                  Check your remaining monthly buffer anytime before making unplanned purchases. No anxiety, no surprises.
                </p>
              </div>

              {/* UI Snippet */}
              <div className="p-3 bg-[#4C9B79]/10 border border-[#4C9B79]/20 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[#28664D] font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Remaining Buffer</span>
                </div>
                <span className="font-extrabold text-[#28664D] tabular-nums">€720.00</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. Final CTA & Honest Product Guarantee ── */}
        <section className="py-20 px-5 sm:px-8 max-w-4xl mx-auto text-center">
          <div className="bg-white border border-[#DDD7CB] rounded-3xl p-8 sm:p-12 shadow-sm space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F3] border border-[#DDD7CB] text-[11px] font-bold text-[#164A3A]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Private & Transparent by Design</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-[#20251F] tracking-tight">
              Ready to feel in control of your finances?
            </h2>

            <p className="text-xs sm:text-sm text-[#6B7268] max-w-lg mx-auto leading-relaxed">
              No spreadsheets to break. No invasive bank credential connections. Just a clean, honest personal finance ledger built for everyday clarity.
            </p>

            <div className="pt-2 flex flex-wrap justify-center items-center gap-3">
              <Link
                to={token ? '/dashboard' : '/register'}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#164A3A] text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-[#12382c] transition shadow-xs"
              >
                <span>{token ? 'Go to your Dashboard' : 'Start tracking for free'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <p className="text-[11px] text-[#6B7268]">
              Free account · Instant access · Works seamlessly on desktop & mobile
            </p>
          </div>
        </section>
      </main>

      {/* ── 6. Simple, Honest Footer ── */}
      <footer className="border-t border-[#DDD7CB] bg-white py-10 px-5 sm:px-8 text-xs text-[#6B7268]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#164A3A] text-white flex items-center justify-center font-bold text-xs">
                K
              </span>
              <span className="font-bold text-[#20251F] text-sm">KnowFin</span>
            </div>
            <span className="hidden sm:inline text-[#DDD7CB]">|</span>
            <span className="text-[11px] text-[#6B7268]">
              Truthful personal cash flow and ledger clarity.
            </span>
          </div>

          <div className="flex items-center gap-5 text-[11px] font-medium text-[#6B7268]">
            <a href="#preview" className="hover:text-[#20251F] transition">
              Overview
            </a>
            <a href="#benefits" className="hover:text-[#20251F] transition">
              Benefits
            </a>
            <a href="#how-it-works" className="hover:text-[#20251F] transition">
              How It Works
            </a>
            <Link to="/login" className="hover:text-[#20251F] transition">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-[#20251F] transition">
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
