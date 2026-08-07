import React from 'react';
import { User, LogOut, Sparkles, Coins } from 'lucide-react';
import { useCurrency, type Currency } from '../../contexts/CurrencyContext';

interface HeaderProps {
  userEmail?: string;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ userEmail, onLogout }) => {
  const { currency, setCurrency } = useCurrency();

  return (
    <header className="h-20 bg-white/60 backdrop-blur-md border-b border-rose-100/80 px-6 md:px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-rose-400 animate-pulse" />
        <span className="text-xs font-semibold text-rose-800/80 tracking-wide uppercase">
          Financial Control Center
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Currency Switcher Dropdown */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 border border-rose-200/80 rounded-xl text-xs font-semibold text-rose-900 shadow-xs">
          <Coins className="w-3.5 h-3.5 text-rose-500" />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="bg-transparent outline-none cursor-pointer text-slate-800 font-bold"
          >
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
          </select>
        </div>

        {userEmail && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-rose-50/80 border border-rose-100 rounded-full text-xs font-medium text-rose-900 shadow-xs">
            <User className="w-3.5 h-3.5 text-rose-500" />
            <span>{userEmail}</span>
          </div>
        )}
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-rose-700 bg-white/80 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 rounded-xl transition duration-200 shadow-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};
