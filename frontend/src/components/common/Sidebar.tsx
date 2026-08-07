import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Tags,
  PieChart,
  BarChart3,
  Flower2,
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
    <aside className="w-64 bg-white/70 backdrop-blur-xl border-r border-pink-100/80 flex flex-col justify-between hidden md:flex min-h-screen sticky top-0 h-screen">
      <div>
        {/* Brand Logo with Cherry Blossom Glow */}
        <div className="h-20 flex items-center px-6 border-b border-rose-100/60 gap-3.5">
          <div className="p-2.5 bg-gradient-to-br from-rose-400 to-pink-600 text-white rounded-xl shadow-md shadow-rose-200/50 flex items-center justify-center transform transition duration-300 hover:rotate-12">
            <Flower2 className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-rose-900 bg-clip-text text-transparent tracking-tight">
              KnowFin
            </span>
            <span className="block text-[10px] uppercase font-semibold tracking-wider text-rose-400">
              Sakura Edition
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
                  `flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-rose-500/15 to-pink-500/10 text-rose-900 font-semibold shadow-xs border border-rose-200/50'
                      : 'text-slate-600 hover:bg-rose-50/70 hover:text-rose-900 hover:translate-x-1'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-rose-500" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Branding */}
      <div className="p-4 border-t border-rose-100/60">
        <div className="p-3.5 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl text-xs text-rose-900/80 border border-rose-100/50 shadow-xs flex items-center justify-between">
          <span className="font-medium">Backend API v1.0</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
      </div>
    </aside>
  );
};
