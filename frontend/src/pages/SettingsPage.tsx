import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto pb-12">
      {/* ── Page Header ── */}
      <div className="pb-3 border-b border-[#DDD7CB]/70">
        <h1 className="text-2xl sm:text-3xl font-normal text-[#20251F] tracking-tight">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7268] mt-0.5">
          Configure your reporting currency, starting balances, and account profile.
        </p>
      </div>

      <div className="space-y-5">
        {/* ── Section 1: Reporting Currency ── */}
        <div className="bg-white border border-[#DDD7CB] rounded-[18px] p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#DDD7CB]/60">
            <div className="w-7 h-7 rounded-[9px] bg-[#FAF8F3] border border-[#DDD7CB] flex items-center justify-center text-[#20251F]">
              <DollarSign className="w-4 h-4 stroke-[2]" aria-hidden="true" />
            </div>
            <h2 className="text-sm font-medium text-[#20251F]">Reporting Currency</h2>
          </div>

          <p className="text-xs text-[#6B7268] leading-relaxed">
            Select your primary currency symbol for display across your dashboard, transactions, and reports.
          </p>

          <div className="grid grid-cols-3 gap-3 max-w-md">
            {(['EUR', 'USD', 'INR'] as Currency[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleCurrencyChange(c)}
                className={`py-3 px-4 rounded-[14px] border text-center transition-all flex flex-col items-center justify-center gap-1 active:scale-[0.98] cursor-pointer ${
                  currency === c
                    ? 'border-[#D99A37] bg-[#FBF4E8] text-[#20251F] shadow-2xs'
                    : 'border-[#DDD7CB] text-[#6B7268] bg-white hover:border-[#C4BEB1] hover:text-[#20251F]'
                }`}
              >
                <span className="text-lg font-normal text-[#20251F]">
                  {c === 'EUR' ? '€' : c === 'USD' ? '$' : '₹'}
                </span>
                <span className="text-xs font-medium">{c}</span>
              </button>
            ))}
          </div>

          <div className="flex items-start gap-2.5 p-3.5 bg-[#FAF8F3] border border-[#DDD7CB]/70 rounded-[14px] text-[#20251F] text-xs">
            <HelpCircle className="w-4 h-4 text-[#D99A37] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-[11px] text-[#6B7268] leading-relaxed">
              <span className="font-medium text-[#20251F]">Display-only formatting:</span> KnowFin preserves the raw numerical values of all recorded transactions. Changing your currency preference updates the formatting symbol across your views; it does not perform automated exchange rate conversions.
            </div>
          </div>
        </div>

        {/* ── Section 2: Account Opening Balances ── */}
        <div className="bg-white border border-[#DDD7CB] rounded-[18px] p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DDD7CB]/60">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[9px] bg-[#FAF8F3] border border-[#DDD7CB] flex items-center justify-center text-[#20251F]">
                <Wallet className="w-4 h-4 stroke-[2]" aria-hidden="true" />
              </div>
              <h2 className="text-sm font-medium text-[#20251F]">Starting Account Balances</h2>
            </div>
            <Link
              to="/accounts"
              className="text-xs font-medium text-[#4778E5] hover:underline inline-flex items-center gap-0.5"
            >
              <span>Manage accounts</span>
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

          <p className="text-xs text-[#6B7268] leading-relaxed">
            Unset opening balance allows you to track cash flow without assuming initial funds. Setting an opening balance anchors your net worth to your real-world bank statements.
          </p>

          {isLoadingAccounts ? (
            <div className="py-6 text-center text-xs text-[#8E948B]">Loading accounts...</div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#8E948B]">
              No accounts registered yet.
            </div>
          ) : (
            <div className="divide-y divide-[#DDD7CB]/60 border border-[#DDD7CB] rounded-[14px] overflow-hidden">
              {accounts.map((acc) => {
                const isEditing = editingAccountId === acc.id;
                const isSet = acc.is_balance_set !== false && acc.initial_balance !== null && acc.initial_balance !== undefined;

                return (
                  <div key={acc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-[#FAF8F3]/50 transition-colors">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#20251F]">{acc.name}</span>
                        <span className="text-[10px] uppercase font-medium tracking-wider px-2 py-0.5 rounded-[6px] bg-[#F6F2E9] text-[#6B7268] border border-[#DDD7CB]">
                          {acc.account_type}
                        </span>
                      </div>
                      <div className="text-xs text-[#6B7268] mt-1 flex items-center gap-1.5">
                        <span>Current balance:</span>
                        <span className="font-medium text-[#20251F] kf-tnum">
                          {isSet ? formatAmount(acc.current_balance ?? 0) : 'Calculated Net Cash Flow'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Blank for unset"
                            value={openingBalanceInput}
                            onChange={(e) => setOpeningBalanceInput(e.target.value)}
                            aria-label="Opening balance input"
                            className="px-3 py-1.5 border border-[#DDD7CB] rounded-[10px] text-xs w-36 outline-none focus:border-[#D99A37] kf-tnum bg-white"
                            autoFocus
                          />
                          <button
                            type="button"
                            disabled={isSavingBalance}
                            onClick={() => handleSaveOpeningBalance(acc.id)}
                            className="px-3 py-1.5 bg-[#D99A37] hover:bg-[#C5882B] text-white text-xs font-medium rounded-[10px] disabled:opacity-50 transition-colors shadow-xs active:scale-[0.98]"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingAccountId(null)}
                            className="px-2.5 py-1.5 text-xs text-[#6B7268] hover:text-[#20251F] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[11px] text-[#8E948B] block">Opening Balance</span>
                            <span className={`text-xs font-medium kf-tnum ${isSet ? 'text-[#20251F]' : 'text-[#8E948B]'}`}>
                              {isSet ? formatAmount(acc.initial_balance ?? 0) : 'Not Set (Cash Flow Mode)'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleStartEditBalance(acc)}
                            className="px-3.5 py-1.5 border border-[#DDD7CB] rounded-[10px] text-xs font-medium text-[#20251F] hover:bg-[#FAF8F3] hover:border-[#C4BEB1] transition-colors shadow-2xs active:scale-[0.98]"
                          >
                            {isSet ? 'Edit' : 'Set balance'}
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

        {/* ── Section 3: User Profile ── */}
        <div className="bg-white border border-[#DDD7CB] rounded-[18px] p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#DDD7CB]/60">
            <div className="w-7 h-7 rounded-[9px] bg-[#FAF8F3] border border-[#DDD7CB] flex items-center justify-center text-[#20251F]">
              <UserIcon className="w-4 h-4 stroke-[2]" aria-hidden="true" />
            </div>
            <h2 className="text-sm font-medium text-[#20251F]">User Profile</h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
            <div>
              <label htmlFor="settings-fullname" className="block text-xs font-medium text-[#20251F] mb-1.5">
                Full Name
              </label>
              <input
                id="settings-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 border border-[#DDD7CB] rounded-[12px] text-xs text-[#20251F] outline-none focus:border-[#D99A37] transition-colors bg-white placeholder:text-[#8E948B]"
              />
            </div>

            <div>
              <label htmlFor="settings-email" className="block text-xs font-medium text-[#20251F] mb-1.5">
                Email Address
              </label>
              <input
                id="settings-email"
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2 border border-[#DDD7CB] bg-[#FAF8F3] rounded-[12px] text-xs text-[#8E948B] cursor-not-allowed"
              />
            </div>

            {profileSuccessMessage && (
              <div className="flex items-center gap-1.5 text-xs text-[#4C9B79] font-medium">
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{profileSuccessMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-4 py-2.5 bg-[#D99A37] hover:bg-[#C5882B] text-white text-xs font-medium rounded-[12px] disabled:opacity-50 transition-colors shadow-xs active:scale-[0.98]"
            >
              {isSavingProfile ? 'Saving...' : 'Update profile'}
            </button>
          </form>
        </div>

        {/* ── Section 4: Quick Navigation to Other Tools ── */}
        <div className="bg-white border border-[#DDD7CB] rounded-[18px] p-6 shadow-2xs space-y-3">
          <h2 className="text-sm font-medium text-[#20251F]">Additional Management Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <Link
              to="/accounts"
              className="p-3.5 border border-[#DDD7CB] rounded-[14px] bg-white hover:bg-[#FAF8F3] hover:border-[#C4BEB1] transition-all flex items-center justify-between group shadow-2xs"
            >
              <div>
                <span className="text-xs font-medium text-[#20251F] block">Accounts</span>
                <span className="text-[11px] text-[#6B7268]">Add or manage bank accounts</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#8E948B] group-hover:text-[#20251F] transition-colors" aria-hidden="true" />
            </Link>

            <Link
              to="/budgets"
              className="p-3.5 border border-[#DDD7CB] rounded-[14px] bg-white hover:bg-[#FAF8F3] hover:border-[#C4BEB1] transition-all flex items-center justify-between group shadow-2xs"
            >
              <div>
                <span className="text-xs font-medium text-[#20251F] block">Budgets</span>
                <span className="text-[11px] text-[#6B7268]">Monthly category targets</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#8E948B] group-hover:text-[#20251F] transition-colors" aria-hidden="true" />
            </Link>

            <Link
              to="/recurring"
              className="p-3.5 border border-[#DDD7CB] rounded-[14px] bg-white hover:bg-[#FAF8F3] hover:border-[#C4BEB1] transition-all flex items-center justify-between group shadow-2xs"
            >
              <div>
                <span className="text-xs font-medium text-[#20251F] block">Recurring Plans</span>
                <span className="text-[11px] text-[#6B7268]">Scheduled expense templates</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#8E948B] group-hover:text-[#20251F] transition-colors" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
