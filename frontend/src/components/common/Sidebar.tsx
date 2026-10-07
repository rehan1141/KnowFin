import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PieChart,
  CalendarSync,
  BarChart3,
} from 'lucide-react';

const navItems = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', path: '/expenses', icon: ArrowLeftRight },
  { name: 'Accounts', path: '/accounts', icon: Wallet },
  { name: 'Budgets', path: '/budgets', icon: PieChart },
  { name: 'Recurring', path: '/recurring', icon: CalendarSync },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
];

export const Sidebar: React.FC = () => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-60 bg-[#FAF9F6] border-r border-[#E8E6DF] flex-col justify-between hidden md:flex min-h-screen sticky top-0 h-screen">
        <div>
          {/* Confident, Clean Brand Header */}
          <div className="h-16 flex items-center px-6 border-b border-[#E8E6DF] gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#164A3A] text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
              K
            </span>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-neutral-900 leading-none">
                KnowFin
              </span>
              <span className="text-[11px] text-neutral-500 font-medium mt-0.5">
                Personal Finance
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#164A3A]/8 text-[#164A3A] font-semibold'
                        : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Subtle Footer Quote / Status */}
        <div className="p-4 border-t border-[#E8E6DF]">
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Know where your money is.<br />
            Know where it goes.
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#FAF9F6] border-t border-[#E8E6DF] z-40 flex items-center justify-around py-2 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-2 py-1 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-[#164A3A] font-bold' : 'text-neutral-500 hover:text-neutral-800'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};
