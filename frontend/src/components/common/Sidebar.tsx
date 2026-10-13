import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Settings,
  Wallet,
  PieChart,
  CalendarSync,
} from 'lucide-react';

const primaryNavItems = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', path: '/expenses', icon: ArrowLeftRight },
  { name: 'Insights', path: '/analytics', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const secondaryNavItems = [
  { name: 'Accounts', path: '/accounts', icon: Wallet },
  { name: 'Budgets', path: '/budgets', icon: PieChart },
  { name: 'Recurring Plans', path: '/recurring', icon: CalendarSync },
];

export const Sidebar: React.FC = () => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-60 bg-white border-r border-[var(--kf-stone-soft,#DDD7CB)] flex-col justify-between hidden md:flex min-h-screen sticky top-0 h-screen">
        <div className="flex flex-col">
          {/* Confident, Clean Brand Header */}
          <div className="h-16 flex items-center px-6 border-b border-[var(--kf-stone-soft,#DDD7CB)] gap-3">
            <span className="w-8 h-8 rounded-lg bg-[var(--kf-ink-deep,#20251F)] text-[var(--kf-ivory-warm,#F6F2E9)] flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
              K
            </span>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-[var(--kf-ink-deep,#20251F)] leading-none">
                KnowFin
              </span>
              <span className="text-[11px] text-neutral-500 font-medium mt-0.5">
                Financial Clarity
              </span>
            </div>
          </div>

          {/* Primary Navigation Links */}
          <div className="p-3.5 space-y-4">
            <div>
              <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider uppercase text-neutral-400">
                Core
              </div>
              <nav className="space-y-1">
                {primaryNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-[var(--kf-ink-deep,#20251F)] text-[var(--kf-ivory-warm,#F6F2E9)] font-semibold shadow-xs'
                            : 'text-neutral-600 hover:text-neutral-900 hover:bg-stone-100/70'
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

            {/* Secondary Planning Tools */}
            <div className="pt-2 border-t border-[var(--kf-stone-soft,#DDD7CB)]/60">
              <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider uppercase text-neutral-400">
                Planning & Tools
              </div>
              <nav className="space-y-1">
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-stone-200 text-neutral-900 font-semibold'
                            : 'text-neutral-500 hover:text-neutral-900 hover:bg-stone-100/70'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0 text-neutral-400" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Subtle Footer Quote / Status */}
        <div className="p-4 border-t border-[var(--kf-stone-soft,#DDD7CB)]">
          <p className="text-[11px] text-neutral-500 leading-relaxed font-normal">
            Know where your money is.<br />
            Know where it goes.
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar: Exactly the 4 Core Screens */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--kf-stone-soft,#DDD7CB)] z-40 flex items-center justify-around py-2 px-2 shadow-sm">
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1 text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'text-[var(--kf-ink-deep,#20251F)] font-bold'
                    : 'text-neutral-400 hover:text-neutral-700'
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
