import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowDownRight,
  ArrowUpRight,
  Landmark,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LandingPage: React.FC = () => {
  const { token } = useAuth();

  return (
    <div className="min-h-screen bg-[#F5F3EE] text-neutral-900 flex flex-col font-sans selection:bg-[#164A3A] selection:text-white">
      {/* Top Header */}
      <header className="border-b border-[#E8E6DF] bg-[#FAF9F6]/95 backdrop-blur-md sticky top-0 z-30">
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
                className="px-4 py-2 bg-[#164A3A] text-white text-xs font-bold rounded-xl hover:bg-[#12382c] transition shadow-xs flex items-center gap-1.5"
              >
                <span>Go to Overview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-neutral-700 hover:text-neutral-900 px-3 py-2 transition"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-[#164A3A] text-white text-xs font-bold rounded-xl hover:bg-[#12382c] transition shadow-xs"
                >
                  Get started free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="pt-20 pb-12 px-6 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E8E6DF] text-neutral-700 text-xs font-semibold mb-6 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#164A3A]" />
            Personal money tracker
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-neutral-900 tracking-tight leading-[1.1] max-w-3xl mx-auto">
            Know where your money is. Know where it goes.
          </h1>
          <p className="mt-5 text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed font-normal">
            A calm, intentional way to manage your daily finances. Track multiple accounts, incoming income, everyday expenses, and upcoming bills in one place.
          </p>

          <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
            <Link
              to={token ? '/dashboard' : '/register'}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#164A3A] text-white font-bold text-sm rounded-xl hover:bg-[#12382c] transition shadow-xs"
            >
              <span>{token ? 'Open Overview' : 'Start tracking today'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-[#E8E6DF] font-semibold text-sm text-neutral-800 rounded-xl hover:bg-neutral-50 transition shadow-2xs"
            >
              <span>Sign in to account</span>
            </Link>
          </div>
        </section>

        {/* Product Interface Preview Mockup */}
        <section className="px-6 pb-20 max-w-4xl mx-auto">
          <div className="bg-white border border-[#E8E6DF] rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
            {/* Mock Header */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[#E8E6DF]">
              <div>
                <span className="text-[11px] font-semibold uppercase text-neutral-400 tracking-wider">
                  October 2026 · Daily Overview
                </span>
                <div className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight mt-0.5">
                  €2,481.40
                </div>
                <span className="text-xs text-neutral-500 mt-1 inline-block">
                  Total available across Main Bank, Savings, and Cash
                </span>
              </div>

              {/* Quick entry actions preview */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white text-xs font-bold rounded-lg shadow-2xs">
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                  <span>Add expense</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#164A3A] text-white text-xs font-bold rounded-lg shadow-2xs">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Add income</span>
                </span>
              </div>
            </div>

            {/* This month breakdown strip */}
            <div className="grid grid-cols-3 gap-4 bg-[#FAF9F6] border border-[#E8E6DF] rounded-2xl p-4">
              <div>
                <span className="text-[11px] font-semibold text-neutral-400 block uppercase">Income</span>
                <span className="text-base font-bold text-emerald-700 block mt-0.5">+€2,100.00</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-neutral-400 block uppercase">Spent</span>
                <span className="text-base font-bold text-neutral-900 block mt-0.5">-€81.00</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-neutral-400 block uppercase">Net Saved</span>
                <span className="text-base font-bold text-[#164A3A] block mt-0.5">+€2,019.00</span>
              </div>
            </div>

            {/* Two Column Mock: Upcoming vs Recent */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Upcoming bills preview */}
              <div className="border border-[#E8E6DF] rounded-2xl p-4">
                <span className="text-xs font-bold text-neutral-900 block mb-3">
                  Coming up this month
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-[#E8E6DF]/60">
                    <div>
                      <span className="font-semibold text-neutral-800 block">Apartment Rent</span>
                      <span className="text-[10px] text-neutral-400">Housing · Monthly</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-neutral-900 block">€300.00</span>
                      <span className="text-[10px] text-neutral-500 bg-neutral-100 px-1 rounded">Due in 4 days</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <div>
                      <span className="font-semibold text-neutral-800 block">Mobile Phone</span>
                      <span className="text-[10px] text-neutral-400">Utilities · Monthly</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-neutral-900 block">€20.00</span>
                      <span className="text-[10px] text-neutral-500 bg-neutral-100 px-1 rounded">Due in 8 days</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent transactions preview */}
              <div className="border border-[#E8E6DF] rounded-2xl p-4">
                <span className="text-xs font-bold text-neutral-900 block mb-3">
                  Recent transactions
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-[#E8E6DF]/60">
                    <div>
                      <span className="font-semibold text-neutral-800 block">Weekly Groceries</span>
                      <span className="text-[10px] text-neutral-400">Food · Main Bank</span>
                    </div>
                    <span className="font-bold text-neutral-900">-€50.00</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <div>
                      <span className="font-semibold text-neutral-800 block">Monthly Transit Pass</span>
                      <span className="text-[10px] text-neutral-400">Transport · Main Bank</span>
                    </div>
                    <span className="font-bold text-neutral-900">-€31.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Real Product Core Principles */}
        <section className="py-16 bg-white border-y border-[#E8E6DF]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                Built for everyday money clarity
              </h2>
              <p className="text-xs text-neutral-500 mt-2">
                No complex investing dashboards. No spam. Just what you have, what you spend, and what's coming.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl border border-[#E8E6DF] bg-[#FAF9F6]">
                <div className="w-10 h-10 rounded-xl bg-[#164A3A] text-white flex items-center justify-center mb-4">
                  <Landmark className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 mb-1.5">
                  All accounts in one ledger
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Keep your checking account, savings cushion, and cash wallet synced so you always know your true total balance.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-[#E8E6DF] bg-[#FAF9F6]">
                <div className="w-10 h-10 rounded-xl bg-[#164A3A] text-white flex items-center justify-center mb-4">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 mb-1.5">
                  Know what's coming next
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Surface fixed obligations like rent, internet, and subscriptions before they hit your account so nothing catches you off guard.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-[#E8E6DF] bg-[#FAF9F6]">
                <div className="w-10 h-10 rounded-xl bg-[#164A3A] text-white flex items-center justify-center mb-4">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 mb-1.5">
                  Honest monthly reviews
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  See exactly how much came in, what went out, and how much was retained without confusing or misleading charts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-20 px-6 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black text-neutral-900 tracking-tight">
            Take control of your day-to-day finances.
          </h2>
          <p className="text-sm text-neutral-600 mt-3 max-w-md mx-auto">
            Free to use. Works across desktop and mobile browsers. No advertising.
          </p>
          <div className="mt-8">
            <Link
              to={token ? '/dashboard' : '/register'}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#164A3A] text-white font-bold text-sm rounded-xl hover:bg-[#12382c] transition shadow-xs"
            >
              <span>{token ? 'Go to Overview' : 'Create free account'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E6DF] bg-white py-8 px-6 text-center text-xs text-neutral-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900">KnowFin</span>
            <span>·</span>
            <span>Simple personal money tracking</span>
          </div>
          <div className="text-neutral-400">
            © 2026 KnowFin. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
