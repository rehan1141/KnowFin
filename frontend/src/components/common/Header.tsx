import React from 'react';
import { User, LogOut, ShieldCheck, Coins } from 'lucide-react';
import { useCurrency, type Currency } from '../../contexts/CurrencyContext';

interface HeaderProps {
  userEmail?: string;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ userEmail, onLogout }) => {
  const { currency, setCurrency } = useCurrency();

  return (
    <header className="h-20 bg-emerald-950/70 backdrop-blur-xl border-b border-emerald-800/40 px-6 md:px-8 flex items-center justify-between sticky top-0 z-40 text-slate-200">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">
          Institutional Platform
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Currency Switcher Dropdown */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-900/50 border border-emerald-700/50 rounded-xl text-xs font-bold text-emerald-300 shadow-xs">
          <Coins className="w-3.5 h-3.5 text-emerald-400" />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="bg-transparent outline-none cursor-pointer text-emerald-300 font-extrabold"
          >
            <option value="INR" className="bg-emerald-950 text-white">₹ INR</option>
            <option value="USD" className="bg-emerald-950 text-white">$ USD</option>
            <option value="EUR" className="bg-emerald-950 text-white">€ EUR</option>
          </select>
        </div>

        {userEmail && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-900/40 border border-emerald-800/60 rounded-full text-xs font-semibold text-slate-200 shadow-xs">
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>{userEmail}</span>
          </div>
        )}
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-emerald-900/50 hover:bg-emerald-800/60 border border-emerald-700/50 hover:border-emerald-600 rounded-xl transition duration-200 shadow-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};
