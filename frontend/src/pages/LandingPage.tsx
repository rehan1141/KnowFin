import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ShieldCheck, PieChart, Database, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LandingPage: React.FC = () => {
  const { token } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Navigation */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 text-white rounded-lg">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">KnowFin</span>
          </div>

          <div className="flex items-center gap-4">
            {token ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition"
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
        <section className="py-20 md:py-28 px-6 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-200/60 text-slate-700 text-xs font-semibold uppercase tracking-wider mb-6">
            Production-Grade Expense Architecture
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Personal Finance Tracked with Technical Rigor
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            KnowFin combines a high-performance FastAPI backend with an intuitive frontend to deliver realtime budgeting, expense categorization, and financial analytics.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to={token ? '/dashboard' : '/register'}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition shadow-sm"
            >
              Explore Application <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border border-slate-300 bg-white font-medium text-slate-700 rounded-xl hover:bg-slate-50 transition"
            >
              View API Documentation
            </a>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-16 bg-white border-y border-slate-200">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-2xl font-bold text-slate-900">Backend Engineering Showcase</h2>
              <p className="text-sm text-slate-500 mt-2">Built to demonstrate production RESTful standards and backend clean architecture</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 border border-slate-200 rounded-xl bg-slate-50/50">
                <div className="p-3 bg-slate-900 text-white rounded-lg w-fit mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">JWT Authentication</h3>
                <p className="text-sm text-slate-600">
                  Stateless authentication with Password hashing via passlib/bcrypt and secure OAuth2 Bearer token verification.
                </p>
              </div>

              <div className="p-6 border border-slate-200 rounded-xl bg-slate-50/50">
                <div className="p-3 bg-slate-900 text-white rounded-lg w-fit mb-4">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">PostgreSQL & Alembic</h3>
                <p className="text-sm text-slate-600">
                  Relational DB schema with declarative SQLAlchemy models and version-controlled migration scripts.
                </p>
              </div>

              <div className="p-6 border border-slate-200 rounded-xl bg-slate-50/50">
                <div className="p-3 bg-slate-900 text-white rounded-lg w-fit mb-4">
                  <PieChart className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Aggregated Analytics</h3>
                <p className="text-sm text-slate-600">
                  Optimized database queries for monthly summaries, budget progress calculations, and category spending distributions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Specs */}
        <section className="py-16 px-6 max-w-4xl mx-auto">
          <div className="bg-slate-900 text-white rounded-2xl p-8 md:p-10 shadow-lg">
            <h3 className="text-xl font-bold mb-4">System Highlights</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Standardized JSON API error handling format</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Dockerized development environment setup</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>TypeScript strict mode & React Router client navigation</span>
              </li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} KnowFin Expense Tracker. All rights reserved.</p>
          <p>Designed for portfolio showcasing.</p>
        </div>
      </footer>
    </div>
  );
};
