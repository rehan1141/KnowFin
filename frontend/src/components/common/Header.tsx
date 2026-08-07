import React from 'react';
import { User, LogOut, Sparkles } from 'lucide-react';

interface HeaderProps {
  userEmail?: string;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ userEmail, onLogout }) => {
  return (
    <header className="h-20 bg-white/60 backdrop-blur-md border-b border-rose-100/80 px-6 md:px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-rose-400 animate-pulse" />
        <span className="text-xs font-semibold text-rose-800/80 tracking-wide uppercase">
          Financial Control Center
        </span>
      </div>

      <div className="flex items-center gap-4">
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
