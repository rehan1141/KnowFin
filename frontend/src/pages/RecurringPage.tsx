import React, { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Clock,
  HelpCircle,
  AlertCircle,
  Repeat,
} from 'lucide-react';
import { recurringService } from '../services/recurringService';
import { useCurrency } from '../contexts/CurrencyContext';
import { CategorySquircle } from '../utils/categoryIcons';
import { RecurringModal } from '../components/recurring/RecurringModal';
import type { RecurringTransaction, RecurringTransactionCreate } from '../types';

export const RecurringPage: React.FC = () => {
  const { formatAmount } = useCurrency();
  const [recurringRules, setRecurringRules] = useState<RecurringTransaction[]>([]);
  const [upcomingItems, setUpcomingItems] = useState<RecurringTransaction[]>([]);
  const [totalUpcoming, setTotalUpcoming] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RecurringTransaction | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [allRules, upcomingRes] = await Promise.all([
        recurringService.list(),
        recurringService.getUpcoming(30),
      ]);
      setRecurringRules(allRules);
      setUpcomingItems(upcomingRes.items);
      setTotalUpcoming(Number(upcomingRes.total_upcoming_expenses));
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Could not load your recurring plans.');
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

  // ════════════════════ STATE 1: LOADING STATE ════════════════════
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-10 h-10 rounded-full border-3 border-[#DDD7CB] border-t-[#D99A37] animate-spin mb-4" />
        <h2 className="text-base font-normal text-[#20251F]">Loading recurring plans...</h2>
        <p className="text-xs text-[#6B7268] mt-1">Retrieving scheduled commitment templates.</p>
      </div>
    );
  }

  // ════════════════════ STATE 2: ERROR STATE ════════════════════
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-[16px] bg-[#FDF1EE] border border-[#E97962]/20 flex items-center justify-center text-[#E97962] mb-4">
          <AlertCircle className="w-7 h-7 stroke-[1.75]" />
        </div>
        <h2 className="text-lg font-normal text-[#20251F]">Could not load recurring plans</h2>
        <p className="text-xs text-[#6B7268] mt-1.5 mb-5 leading-relaxed">{error}</p>
        <button
          type="button"
          onClick={loadData}
          className="py-2.5 px-5 rounded-[12px] bg-[#D99A37] text-white hover:bg-[#C5882B] text-xs font-medium transition-colors shadow-xs active:scale-[0.98]"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto pb-12">
      {/* ── 1. Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DDD7CB]/70">
        <div>
          <h1 className="text-2xl sm:text-3xl font-normal text-[#20251F] tracking-tight">
            Recurring Plans
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7268] mt-0.5">
            Track fixed commitments like rent, subscriptions, and memberships due each month.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingRule(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#D99A37] hover:bg-[#C5882B] text-white text-xs font-medium rounded-[12px] transition-colors shadow-xs self-start sm:self-auto cursor-pointer active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Add recurring plan</span>
        </button>
      </div>

      {/* ── 2. Aggregate Obligations Banner ── */}
      <div className="bg-white border border-[#DDD7CB] rounded-[18px] p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-[#6B7268]">
            Committed for Next 30 Days
          </span>
          <div className="text-3xl sm:text-4xl font-normal text-[#20251F] tracking-tight mt-1 kf-tnum">
            {formatAmount(totalUpcoming)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#6B7268] mt-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#D99A37] shrink-0" aria-hidden="true" />
            <span>Recurring rules are schedule templates and do not inflate historical spending until executed.</span>
          </div>
        </div>
        <div className="text-xs text-[#6B7268]">
          <strong className="text-[#20251F] font-semibold">{upcomingItems.length}</strong> planned obligation{upcomingItems.length === 1 ? '' : 's'} upcoming
        </div>
      </div>

      {/* ── 3. Recurring Rules List ── */}
      <div className="bg-white border border-[#DDD7CB] rounded-[18px] overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-[#DDD7CB]/60 bg-[#FAF8F3]/60 flex items-center justify-between">
          <h2 className="text-xs font-medium uppercase tracking-wider text-[#6B7268]">
            Active Recurring Templates ({recurringRules.length})
          </h2>
        </div>

        {recurringRules.length === 0 ? (
          /* ════════════════ STATE 3: EMPTY RECURRING STATE ════════════════ */
          <div className="text-center py-16 px-4 text-xs space-y-3">
            <div className="w-12 h-12 mx-auto rounded-[14px] bg-[#F6F2E9] border border-[#DDD7CB]/80 flex items-center justify-center text-[#8E948B]">
              <Repeat className="w-6 h-6 stroke-[1.5]" aria-hidden="true" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-medium text-[#20251F]">No recurring rules configured</h3>
              <p className="text-[#6B7268]">
                Add your recurring subscriptions, rent, memberships, or scheduled bills to track future cash flow obligations.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingRule(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#D99A37] hover:bg-[#C5882B] text-white text-xs font-medium rounded-[12px] transition-colors shadow-xs active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Add recurring rule</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#DDD7CB]/60">
            {recurringRules.map((rule) => {
              const isExpense = rule.transaction_type === 'expense';

              return (
                <div
                  key={rule.id}
                  className="p-4 flex items-center justify-between hover:bg-[#FAF8F3]/70 transition-colors group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <CategorySquircle
                      iconName={rule.category_icon}
                      color={rule.category_color}
                      size="md"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-[#20251F] truncate">
                          {rule.title}
                        </span>
                        <span className="text-[10px] uppercase font-medium tracking-wider px-2 py-0.5 rounded-[6px] bg-[#F6F2E9] text-[#6B7268] border border-[#DDD7CB]">
                          {rule.frequency}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#6B7268] mt-0.5 flex-wrap">
                        <span className="font-medium text-[#20251F]">{rule.category_name || 'General'}</span>
                        <span className="text-[#DDD7CB]">·</span>
                        <span>{rule.account_name || 'Unassigned account'}</span>
                        {rule.next_due_date && (
                          <>
                            <span className="text-[#DDD7CB]">·</span>
                            <span className="flex items-center gap-1 text-[#D99A37] font-medium">
                              <Clock className="w-3 h-3 stroke-[2]" aria-hidden="true" />
                              <span>Due {rule.next_due_date.slice(0, 10)}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 pl-3">
                    <span
                      className={`text-sm sm:text-base font-medium kf-tnum ${
                        isExpense ? 'text-[#20251F]' : 'text-[#4C9B79]'
                      }`}
                    >
                      {isExpense ? '−' : '+'}
                      {formatAmount(rule.amount)}
                    </span>

                    <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRule(rule);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-[#6B7268] hover:text-[#20251F] hover:bg-[#F6F2E9] rounded-[8px] transition-colors"
                        title="Edit plan"
                        aria-label="Edit plan"
                      >
                        <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(rule.id, rule.title)}
                        className="p-1.5 text-[#8E948B] hover:text-[#E97962] hover:bg-[#FDF1EE] rounded-[8px] transition-colors"
                        title="Delete plan"
                        aria-label="Delete plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 4. Recurring Modal ── */}
      <RecurringModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingRule ? handleUpdate : handleCreate}
        initialData={editingRule}
      />
    </div>
  );
};
