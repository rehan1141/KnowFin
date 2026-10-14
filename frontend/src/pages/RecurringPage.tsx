import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Clock, HelpCircle } from 'lucide-react';
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
      // Handled silently
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
    if (window.confirm(`Remove recurring rule "${title}"?`)) {
      await recurringService.delete(id);
      await loadData();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[var(--kf-stone-soft,#DDD7CB)]">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-500">
            Fixed Commitments & Subscriptions
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--kf-ink-deep,#20251F)] mt-0.5">
            Recurring Plans
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Track fixed commitments like rent, subscriptions, and memberships due each month.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingRule(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--kf-ink-deep,#20251F)] text-[var(--kf-ivory-warm,#F6F2E9)] text-xs font-bold rounded-lg hover:opacity-90 transition shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Recurring Plan</span>
        </button>
      </div>

      {/* Aggregate Obligations Banner */}
      <div className="bg-white border border-[var(--kf-stone-soft,#DDD7CB)] rounded-2xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Committed for Next 30 Days
          </span>
          <div className="text-3xl font-extrabold text-[var(--kf-ink-deep,#20251F)] tracking-tight mt-1 kf-tnum">
            {formatAmount(totalUpcoming)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
            <span>Recurring rules are schedule templates and do not inflate historical spending until executed.</span>
          </div>
        </div>
        <div className="text-xs text-neutral-500">
          <strong>{upcomingItems.length}</strong> planned obligation{upcomingItems.length === 1 ? '' : 's'} upcoming
        </div>
      </div>

      {/* Recurring Rules List */}
      <div className="bg-white border border-[var(--kf-stone-soft,#DDD7CB)] rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-[var(--kf-stone-soft,#DDD7CB)] bg-stone-50/50 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
            Active Recurring Templates ({recurringRules.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="text-center py-24 text-neutral-400 text-xs">Loading recurring plans...</div>
        ) : recurringRules.length === 0 ? (
          <div className="text-center py-12 text-neutral-400 text-xs">
            <p className="text-sm font-semibold text-neutral-800 mb-1">No recurring rules configured</p>
            <p className="mb-4">Add your recurring subscriptions, rent, or scheduled bills.</p>
            <button
              onClick={() => {
                setEditingRule(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--kf-ink-deep,#20251F)] text-white text-xs font-bold rounded-lg hover:opacity-90 transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add recurring rule</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[var(--kf-stone-soft,#DDD7CB)]">
            {recurringRules.map((rule) => {
              const isExpense = rule.transaction_type === 'expense';
              return (
                <div
                  key={rule.id}
                  className="p-4 flex items-center justify-between hover:bg-stone-50/50 transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                      style={{
                        backgroundColor:
                          rule.category_color || (isExpense ? '#20251F' : '#059669'),
                      }}
                    >
                      <CategoryIcon iconName={rule.category_icon} className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-neutral-900 truncate">
                          {rule.title}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                          {rule.frequency}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                        <span className="font-medium text-neutral-700">{rule.category_name || 'General'}</span>
                        <span>·</span>
                        <span>{rule.account_name || 'Unassigned account'}</span>
                        {rule.next_due_date && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1 text-[var(--kf-amber-warm,#D99A37)] font-medium">
                              <Clock className="w-3 h-3" /> Due {rule.next_due_date.slice(0, 10)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 pl-3">
                    <span
                      className={`text-base font-extrabold tracking-tight kf-tnum ${
                        isExpense ? 'text-neutral-900' : 'text-emerald-700'
                      }`}
                    >
                      {isExpense ? '−' : '+'}
                      {formatAmount(rule.amount)}
                    </span>

                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition">
                      <button
                        onClick={() => {
                          setEditingRule(rule);
                          setIsModalOpen(true);
                        }}
                        className="p-1 text-neutral-400 hover:text-neutral-700 rounded transition"
                        title="Edit plan"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id, rule.title)}
                        className="p-1 text-neutral-400 hover:text-rose-600 rounded transition"
                        title="Delete plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
