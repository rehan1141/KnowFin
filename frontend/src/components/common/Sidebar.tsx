import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Tags,
  PieChart,
  BarChart3,
  Wallet,
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
    <aside className="w-64 bg-white/80 backdrop-blur-sm border-r border-pink-100 flex flex-col justify-between hidden md:flex min-h-screen">
      <div>
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-6 border-b border-pink-100/60 gap-3">
          <div className="p-2 bg-pink-600 text-white rounded-lg shadow-xs">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">KnowFin</span>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-pink-100/70 text-pink-950 font-semibold'
                      : 'text-slate-600 hover:bg-pink-50/80 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-pink-600" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Branding */}
      <div className="p-4 border-t border-pink-100/60">
        <div className="p-3 bg-pink-50/60 rounded-lg text-xs text-pink-900 font-medium">
          KnowFin Backend API v1.0.0
        </div>
      </div>
    </aside>
  );
};
