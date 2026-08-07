import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Tags,
  PieChart,
  BarChart3,
  Shield,
  TrendingUp,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Expenses', path: '/expenses', icon: Receipt },
  { name: 'Categories', path: '/categories', icon: Tags },
  { name: 'Budgets', path: '/budgets', icon: PieChart },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-emerald-950/90 backdrop-blur-2xl border-r border-emerald-800/40 flex flex-col justify-between hidden md:flex min-h-screen sticky top-0 h-screen text-slate-200">
      <div>
        {/* Luxury Brand Logo */}
        <div className="h-20 flex items-center px-6 border-b border-emerald-800/40 gap-3.5">
          <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center font-extrabold">
            <Shield className="w-5 h-5 fill-slate-950" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
              Know<span className="text-emerald-400">Fin</span>
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-emerald-400/80">
              Enterprise Suite
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-inner'
                      : 'text-slate-400 hover:bg-emerald-900/40 hover:text-emerald-200 hover:translate-x-1'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-emerald-400" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status */}
      <div className="p-4 border-t border-emerald-800/40">
        <div className="p-3.5 bg-emerald-900/40 rounded-xl text-xs border border-emerald-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-slate-300">FastAPI Online</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
        </div>
      </div>
    </aside>
  );
};
