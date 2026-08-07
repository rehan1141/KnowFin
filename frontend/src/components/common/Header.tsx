import React from 'react';
import { User, LogOut } from 'lucide-react';

interface HeaderProps {
  userEmail?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ userEmail = 'demo@knowfin.com', onLogout }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
        API Connected
      </div>

      <div className="flex items-center gap-4">
        {/* User Profile Badge */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-700">
          <User className="w-3.5 h-3.5 text-slate-500" />
          <span>{userEmail}</span>
        </div>

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
