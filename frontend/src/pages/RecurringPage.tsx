import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Clock } from 'lucide-react';
import { recurringService } from '../services/recurringService';
import { useCurrency } from '../contexts/CurrencyContext';
import { CategoryIcon } from '../utils/categoryIcons';
import { RecurringModal } from '../components/recurring/RecurringModal';
import type { RecurringTransaction, RecurringTransactionCreate } from '../types';

export const RecurringPage: React.FC = () => {
  const { formatAmount } = useCurrency();
  const [recurringRules, setRecurringRules] = useState<RecurringTransaction[]>([]);
  const [upcomingItems, setUpcomingItems] = useState<RecurringTransaction[]>([]);
  const [totalUpcoming, setTotalUpcoming] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RecurringTransaction | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allRules, upcomingRes] = await Promise.all([
        recurringService.list(),
        recurringService.getUpcoming(30),
      ]);
      setRecurringRules(allRules);
      setUpcomingItems(upcomingRes.items);
      setTotalUpcoming(Number(upcomingRes.total_upcoming_expenses));
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (data: RecurringTransactionCreate) => {
    await recurringService.create(data);
    await loadData();
  };

  const handleUpdate = async (data: RecurringTransactionCreate) => {
    if (editingRule) {
      await recurringService.update(editingRule.id, data);
      await loadData();
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (confirm(`Remove recurring rule "${title}"?`)) {
      await recurringService.delete(id);
      await loadData();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#E8E6DF]">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-500">
            Fixed Commitments & Subscriptions
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mt-0.5">
            Recurring Payments
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Track fixed expenses like Rent, Phone, Netflix, and Gym due each month
          </p>
        </div>

        <button
          onClick={() => {
            setEditingRule(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#164A3A] text-white text-xs font-bold rounded-lg hover:bg-[#12382c] transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Recurring Bill</span>
        </button>
      </div>

      {/* Aggregate Obligations Banner */}
      <div className="bg-white border border-[#E8E6DF] rounded-2xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Committed Next 30 Days
          </span>
          <div className="text-3xl font-black text-neutral-900 tracking-tight mt-1">
            {formatAmount(totalUpcoming)}
          </div>
        </div>
        <div className="text-xs text-neutral-500">
          <strong>{upcomingItems.length}</strong> planned payment{upcomingItems.length === 1 ? '' : 's'} upcoming
        </div>
      </div>

      {/* Upcoming Bills Strip */}
      {upcomingItems.length > 0 && (
        <div className="bg-white border border-[#E8E6DF] rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-[#164A3A]" />
            <h2 className="text-sm font-bold text-neutral-900">Upcoming in Next 30 Days</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-[#E8E6DF] flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: item.category_color || '#3B82F6' }}
                  >
                    <CategoryIcon iconName={item.category_icon} className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block leading-tight">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {item.category_name || 'Bill'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold text-neutral-900 block">
                    {formatAmount(item.amount)}
                  </span>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                    {item.days_until_due === 0
                      ? 'Due today'
                      : item.days_until_due === 1
                      ? 'Due tomorrow'
                      : `in ${item.days_until_due} days`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Recurring Rules Ledger */}
      <div className="bg-white border border-[#E8E6DF] rounded-2xl p-6 shadow-2xs">
        <h2 className="text-sm font-bold text-neutral-900 mb-4">Active Recurring Templates</h2>

        {isLoading ? (
          <div className="text-center py-12 text-neutral-400 text-xs">Loading recurring rules...</div>
        ) : recurringRules.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 text-xs">
            No recurring rules established yet.
          </div>
        ) : (
          <div className="divide-y divide-[#E8E6DF]">
            {recurringRules.map((rule) => (
              <div key={rule.id} className="py-3.5 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: rule.category_color || '#3B82F6' }}
                  >
                    <CategoryIcon iconName={rule.category_icon} className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-neutral-900 block leading-tight">
                      {rule.title}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {rule.category_name || 'Category'} · {rule.frequency} (Due day {rule.day_of_month || 1}) {rule.account_name ? `· ${rule.account_name}` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-extrabold text-neutral-900">
                    {formatAmount(rule.amount)}
                  </span>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={() => {
                        setEditingRule(rule);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id, rule.title)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recurring Modal */}
      <RecurringModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingRule ? handleUpdate : handleCreate}
        initialData={editingRule}
      />
    </div>
  );
};
