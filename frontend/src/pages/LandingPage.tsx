import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Wallet, PieChart, CalendarSync } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LandingPage: React.FC = () => {
  const { token } = useAuth();

  return (
    <div className="min-h-screen bg-[#F5F3EE] text-neutral-900 flex flex-col font-sans">
      {/* Navigation */}
      <header className="border-b border-[#E8E6DF] bg-[#FAF9F6]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#164A3A] text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-2xs">
              K
            </span>
            <span className="text-xl font-bold tracking-tight text-neutral-900">KnowFin</span>
          </div>

          <div className="flex items-center gap-3">
            {token ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-[#164A3A] text-white text-xs font-bold rounded-lg hover:bg-[#12382c] transition shadow-xs flex items-center gap-1.5"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 px-3 py-2 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-[#164A3A] text-white text-xs font-bold rounded-lg hover:bg-[#12382c] transition shadow-xs"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 md:py-28 px-6 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E8E6DF] text-neutral-700 text-xs font-semibold mb-6 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#164A3A]" />
            Personal Wealth & Cash Flow Tracker
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-neutral-900 tracking-tight leading-[1.1] max-w-3xl mx-auto">
            Know where your money is. Know where it goes.
          </h1>
          <p className="mt-6 text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed font-normal">
            A clean, intentional personal finance application. Track multiple accounts, incoming income, daily expenses, category budgets, and recurring subscriptions in one calm place.
          </p>

          <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
            <Link
              to={token ? '/dashboard' : '/register'}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#164A3A] text-white font-bold text-sm rounded-xl hover:bg-[#12382c] transition shadow-xs"
            >
              <span>{token ? 'Open Overview' : 'Start Tracking Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-[#E8E6DF] font-semibold text-sm text-neutral-800 rounded-xl hover:bg-neutral-50 transition shadow-2xs"
            >
              <span>Sign In to Account</span>
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-16 bg-white border-y border-[#E8E6DF]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl border border-[#E8E6DF] bg-[#FAF9F6]">
                <div className="w-10 h-10 rounded-xl bg-[#164A3A] text-white flex items-center justify-center mb-4">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 mb-1.5">
                  Multi-Account Liquidity
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Connect checking accounts, physical cash wallets, and savings accounts to calculate true available net balance across currencies.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-[#E8E6DF] bg-[#FAF9F6]">
                <div className="w-10 h-10 rounded-xl bg-[#164A3A] text-white flex items-center justify-center mb-4">
                  <CalendarSync className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 mb-1.5">
                  Recurring Commitments
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Keep fixed monthly obligations like rent, phone bills, and streaming subscriptions in sight with automated due-date projections.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-[#E8E6DF] bg-[#FAF9F6]">
                <div className="w-10 h-10 rounded-xl bg-[#164A3A] text-white flex items-center justify-center mb-4">
                  <PieChart className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 mb-1.5">
                  Category Guardrails
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Organize spending into clean main categories and subcategories with custom monthly limits that warn before overspending happens.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Philosophy Section */}
        <section className="py-20 px-6 max-w-4xl mx-auto text-center">
          <div className="bg-[#FAF9F6] border border-[#E8E6DF] rounded-3xl p-8 md:p-12 shadow-2xs">
            <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Built for clarity, not complexity.
            </h2>
            <p className="mt-3 text-sm text-neutral-600 max-w-xl mx-auto leading-relaxed">
              No invasive bank logins required. Take conscious ownership of your cash flow with rapid transaction entry and clear, honest financial totals.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#164A3A] text-white font-bold text-xs rounded-xl hover:bg-[#12382c] transition shadow-xs"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E6DF] bg-white py-6">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} KnowFin. Personal wealth management.</p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-neutral-900 transition">Sign In</Link>
            <Link to="/register" className="hover:text-neutral-900 transition">Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
