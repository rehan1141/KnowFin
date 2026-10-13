import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown, Check, X, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import type { Currency } from '../../types';

export const Header: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [fullNameInput, setFullNameInput] = useState(user?.full_name || '');

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  const handleCurrencyChange = async (newCurr: Currency) => {
    setCurrency(newCurr);
    try {
      await updateUser({ default_currency: newCurr });
    } catch {
      // Ignored if offline
    }
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullNameInput.trim()) return;
    try {
      await updateUser({ full_name: fullNameInput.trim() });
      setIsEditingName(false);
    } catch {
      // Handled
    }
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-[var(--kf-stone-soft,#DDD7CB)] px-6 md:px-8 flex items-center justify-between sticky top-0 z-30">
        {/* Mobile Brand / Page Indicator */}
        <div className="flex items-center gap-3">
          <div className="md:hidden flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[var(--kf-ink-deep,#20251F)] text-[var(--kf-ivory-warm,#F6F2E9)] flex items-center justify-center font-bold text-xs shadow-2xs">
              K
            </span>
            <span className="font-bold text-[var(--kf-ink-deep,#20251F)] tracking-tight text-base">
              KnowFin
            </span>
          </div>
          <div className="hidden md:block text-xs text-neutral-400 font-medium">
            <span>Financial Integrity & Activity Ledger</span>
          </div>
        </div>

        {/* Right Section: Clean User Menu */}
        <div className="flex items-center gap-3">
          {/* Settings quick link */}
          <button
            onClick={() => navigate('/settings')}
            className="p-2 text-neutral-400 hover:text-neutral-800 rounded-lg transition"
            title="Settings & Preferences"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Profile Trigger Button */}
          <button
            onClick={() => {
              setFullNameInput(user?.full_name || '');
              setIsProfileOpen(true);
            }}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg border border-[var(--kf-stone-soft,#DDD7CB)] bg-white hover:bg-stone-50 transition cursor-pointer shadow-2xs"
            aria-label="User menu"
          >
            <div className="w-6 h-6 rounded-full bg-[var(--kf-ink-deep,#20251F)] text-[var(--kf-ivory-warm,#F6F2E9)] flex items-center justify-center text-xs font-bold">
              {initial}
            </div>
            <span className="text-xs font-semibold text-neutral-900">{displayName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          </button>
        </div>
      </header>

      {/* Profile Drawer / Modal */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4"
          onClick={() => setIsProfileOpen(false)}
        >
          <div
            className="bg-white rounded-2xl border border-[var(--kf-stone-soft,#DDD7CB)] shadow-xl max-w-sm w-full p-6 animate-in fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[var(--kf-stone-soft,#DDD7CB)]">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                <Settings className="w-4 h-4 text-[var(--kf-ink-deep,#20251F)]" />
                <span>Account Profile</span>
              </div>
              <button
                onClick={() => setIsProfileOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {/* User Avatar & Identity */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[var(--kf-ink-deep,#20251F)] text-[var(--kf-ivory-warm,#F6F2E9)] flex items-center justify-center text-lg font-bold">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  {isEditingName ? (
                    <form onSubmit={handleSaveName} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={fullNameInput}
                        onChange={(e) => setFullNameInput(e.target.value)}
                        className="px-2.5 py-1 text-sm border border-[var(--kf-stone-soft,#DDD7CB)] rounded-md flex-1 text-neutral-900 focus:outline-none focus:border-[var(--kf-ink-deep,#20251F)]"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="p-1 bg-[var(--kf-ink-deep,#20251F)] text-[var(--kf-ivory-warm,#F6F2E9)] rounded-md text-xs font-medium cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-semibold text-neutral-900 truncate">
                        {displayName}
                      </h4>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="text-xs text-neutral-700 hover:underline font-medium ml-2 cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-neutral-500 truncate mt-0.5">{user?.email}</p>
                </div>
              </div>

              {/* Currency Selector */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-neutral-500">
                    Display Currency
                  </label>
                  <span className="text-[10px] text-neutral-400">Display only</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['EUR', 'USD', 'INR'] as Currency[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => handleCurrencyChange(c)}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition cursor-pointer ${
                        currency === c
                          ? 'border-[var(--kf-ink-deep,#20251F)] bg-stone-100 text-[var(--kf-ink-deep,#20251F)] font-bold'
                          : 'border-[var(--kf-stone-soft,#DDD7CB)] text-neutral-600 hover:border-neutral-400'
                      }`}
                    >
                      {c === 'EUR' ? '€ EUR' : c === 'USD' ? '$ USD' : '₹ INR'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--kf-stone-soft,#DDD7CB)] flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-neutral-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Open Full Settings</span>
              </button>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of KnowFin</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
