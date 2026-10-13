import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  Wallet,
  User as UserIcon,
  Check,
  ExternalLink,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { accountService } from '../services/accountService';
import type { Account, Currency } from '../types';
import { Link } from 'react-router-dom';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { currency, setCurrency, formatAmount } = useCurrency();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [editingAccountId, setEditingAccountId] = useState<number | null>(null);
  const [openingBalanceInput, setOpeningBalanceInput] = useState<string>('');
  const [isSavingBalance, setIsSavingBalance] = useState(false);

  // Profile Form
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMessage, setProfileSuccessMessage] = useState('');

  const loadAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const data = await accountService.list();
      setAccounts(data.accounts);
    } catch {
      // Handled silently
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleCurrencyChange = async (newCurr: Currency) => {
    setCurrency(newCurr);
    try {
      await updateUser({ default_currency: newCurr });
    } catch {
      // Handled silently
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccessMessage('');
    try {
      await updateUser({ full_name: fullName.trim() });
      setProfileSuccessMessage('Profile saved successfully.');
      setTimeout(() => setProfileSuccessMessage(''), 3000);
    } catch {
      // Handled
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleStartEditBalance = (acc: Account) => {
    setEditingAccountId(acc.id);
    setOpeningBalanceInput(
      acc.initial_balance !== null && acc.initial_balance !== undefined
        ? String(acc.initial_balance)
        : ''
    );
  };

  const handleSaveOpeningBalance = async (accId: number) => {
    setIsSavingBalance(true);
    try {
      const val = openingBalanceInput.trim() === '' ? null : Number(openingBalanceInput);
      await accountService.update(accId, {
        initial_balance: val,
      });
      setEditingAccountId(null);
      await loadAccounts();
    } catch {
      // Handled
    } finally {
      setIsSavingBalance(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="pb-3 border-b border-[var(--kf-stone-soft,#DDD7CB)]">
        <span className="text-xs font-semibold tracking-wider uppercase text-neutral-500">
          Preferences & Configuration
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--kf-ink-deep,#20251F)] mt-0.5">
          Settings
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Configure your reporting currency, starting balances, and account profile.
        </p>
      </div>

      <div className="space-y-5">
        {/* Section 1: Reporting Currency */}
        <div className="bg-white border border-[var(--kf-stone-soft,#DDD7CB)] rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--kf-stone-soft,#DDD7CB)]">
            <DollarSign className="w-4 h-4 text-[var(--kf-ink-deep,#20251F)]" />
            <h2 className="text-sm font-bold text-neutral-900">Reporting Currency</h2>
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed">
            Select your primary currency symbol for display across your dashboard, transactions, and reports.
          </p>

          <div className="grid grid-cols-3 gap-3 max-w-md">
            {(['EUR', 'USD', 'INR'] as Currency[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleCurrencyChange(c)}
                className={`py-3 px-4 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                  currency === c
                    ? 'border-[var(--kf-ink-deep,#20251F)] bg-stone-100 text-[var(--kf-ink-deep,#20251F)] font-bold shadow-2xs'
                    : 'border-[var(--kf-stone-soft,#DDD7CB)] text-neutral-600 hover:border-neutral-400'
                }`}
              >
                <span className="text-base font-extrabold">
                  {c === 'EUR' ? '€' : c === 'USD' ? '$' : '₹'}
                </span>
                <span className="text-xs font-semibold">{c}</span>
              </button>
            ))}
          </div>

          <div className="flex items-start gap-2 p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-amber-900 text-xs">
            <HelpCircle className="w-4 h-4 text-[var(--kf-amber-warm,#D99A37)] shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-semibold">Display-Only Formatting:</span> KnowFin preserves the raw numerical values of all recorded transactions. Changing your currency preference updates the formatting prefix across your views; it does not perform automated exchange rate conversions.
            </div>
          </div>
        </div>

        {/* Section 2: Account Opening Balances */}
        <div className="bg-white border border-[var(--kf-stone-soft,#DDD7CB)] rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--kf-stone-soft,#DDD7CB)]">
            <div className="flex items-center gap-2.5">
              <Wallet className="w-4 h-4 text-[var(--kf-ink-deep,#20251F)]" />
              <h2 className="text-sm font-bold text-neutral-900">Starting Account Balances</h2>
            </div>
            <Link
              to="/accounts"
              className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 inline-flex items-center gap-1"
            >
              <span>Manage accounts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed">
            Unset opening balance allows you to track cash flow without assuming initial funds. Setting an opening balance anchors your net worth to your real-world bank statements.
          </p>

          {isLoadingAccounts ? (
            <div className="py-6 text-center text-xs text-neutral-400">Loading accounts...</div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-6 text-xs text-neutral-500">
              No accounts registered yet.
            </div>
          ) : (
            <div className="divide-y divide-[var(--kf-stone-soft,#DDD7CB)] border border-[var(--kf-stone-soft,#DDD7CB)] rounded-xl overflow-hidden">
              {accounts.map((acc) => {
                const isEditing = editingAccountId === acc.id;
                const isSet = acc.is_balance_set !== false && acc.initial_balance !== null && acc.initial_balance !== undefined;

                return (
                  <div key={acc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-neutral-900">{acc.name}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                          {acc.account_type}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-500 mt-1 flex items-center gap-2">
                        <span>Current Balance:</span>
                        <span className="font-bold text-neutral-900 kf-tnum">
                          {isSet ? formatAmount(acc.current_balance ?? 0) : 'Calculated Net Cash Flow'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Leave blank for unset"
                            value={openingBalanceInput}
                            onChange={(e) => setOpeningBalanceInput(e.target.value)}
                            className="px-2.5 py-1.5 border border-[var(--kf-stone-soft,#DDD7CB)] rounded-lg text-xs w-36 outline-none focus:border-[var(--kf-ink-deep,#20251F)] kf-tnum"
                            autoFocus
                          />
                          <button
                            disabled={isSavingBalance}
                            onClick={() => handleSaveOpeningBalance(acc.id)}
                            className="px-3 py-1.5 bg-[var(--kf-ink-deep,#20251F)] text-white text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingAccountId(null)}
                            className="px-2.5 py-1.5 text-xs text-neutral-500 hover:text-neutral-800"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[11px] text-neutral-400 block">Opening Balance</span>
                            <span className="text-xs font-bold text-neutral-800 kf-tnum">
                              {isSet ? formatAmount(acc.initial_balance ?? 0) : 'Not Set (Cash Flow Mode)'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleStartEditBalance(acc)}
                            className="px-3 py-1.5 border border-[var(--kf-stone-soft,#DDD7CB)] rounded-lg text-xs font-semibold text-neutral-700 hover:bg-stone-50 transition"
                          >
                            {isSet ? 'Edit' : 'Set Balance'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 3: User Profile */}
        <div className="bg-white border border-[var(--kf-stone-soft,#DDD7CB)] rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--kf-stone-soft,#DDD7CB)]">
            <UserIcon className="w-4 h-4 text-[var(--kf-ink-deep,#20251F)]" />
            <h2 className="text-sm font-bold text-neutral-900">User Profile</h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--kf-stone-soft,#DDD7CB)] rounded-lg text-xs text-neutral-900 outline-none focus:border-[var(--kf-ink-deep,#20251F)] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Email Address
              </label>
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 border border-[var(--kf-stone-soft,#DDD7CB)] bg-stone-50 rounded-lg text-xs text-neutral-500 cursor-not-allowed"
              />
            </div>

            {profileSuccessMessage && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                <Check className="w-3.5 h-3.5" />
                <span>{profileSuccessMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-4 py-2 bg-[var(--kf-ink-deep,#20251F)] text-white text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition"
            >
              {isSavingProfile ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Section 4: Quick Navigation to Other Tools */}
        <div className="bg-white border border-[var(--kf-stone-soft,#DDD7CB)] rounded-2xl p-6 shadow-2xs space-y-3">
          <h2 className="text-sm font-bold text-neutral-900">Additional Management Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <Link
              to="/accounts"
              className="p-3 border border-[var(--kf-stone-soft,#DDD7CB)] rounded-xl hover:bg-stone-50 transition flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-neutral-900 block">Accounts</span>
                <span className="text-[11px] text-neutral-400">Add or manage bank accounts</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            </Link>

            <Link
              to="/budgets"
              className="p-3 border border-[var(--kf-stone-soft,#DDD7CB)] rounded-xl hover:bg-stone-50 transition flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-neutral-900 block">Budgets</span>
                <span className="text-[11px] text-neutral-400">Monthly category spending targets</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            </Link>

            <Link
              to="/recurring"
              className="p-3 border border-[var(--kf-stone-soft,#DDD7CB)] rounded-xl hover:bg-stone-50 transition flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-neutral-900 block">Recurring Plans</span>
                <span className="text-[11px] text-neutral-400">Scheduled expense templates</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
