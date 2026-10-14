import React, { useEffect, useState } from 'react';
import {
  Plus,
  Landmark,
  Wallet,
  PiggyBank,
  CreditCard,
  TrendingUp,
  Edit2,
  Trash2,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { accountService } from '../services/accountService';
import { useCurrency } from '../contexts/CurrencyContext';
import { AccountModal } from '../components/accounts/AccountModal';
import type { Account, AccountCreate, AccountType } from '../types';

export const AccountsPage: React.FC = () => {
  const { formatAmount } = useCurrency();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totalBalance, setTotalBalance] = useState<number | null>(0);
  const [isBalanceSet, setIsBalanceSet] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const loadAccounts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await accountService.list();
      setAccounts(data.accounts);
      setTotalBalance(data.total_balance !== null && data.total_balance !== undefined ? Number(data.total_balance) : null);
      setIsBalanceSet(data.is_balance_set !== false);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Could not load your accounts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleCreate = async (data: AccountCreate) => {
    await accountService.create(data);
    await loadAccounts();
  };

  const handleUpdate = async (data: AccountCreate) => {
    if (editingAccount) {
      await accountService.update(editingAccount.id, data);
      await loadAccounts();
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Delete account "${name}"? Associated transaction history will remain intact.`)) {
      await accountService.delete(id);
      await loadAccounts();
    }
  };

  const getAccountTheme = (type: AccountType) => {
    switch (type) {
      case 'bank':
        return { icon: Landmark, tintClass: 'bg-[#EDF3FE] text-[#2953B2] border border-[#4778E5]/20' };
      case 'cash':
        return { icon: Wallet, tintClass: 'bg-[#FBF4E8] text-[#8C5C15] border border-[#D99A37]/25' };
      case 'savings':
        return { icon: PiggyBank, tintClass: 'bg-[#EEF7F2] text-[#28664D] border border-[#4C9B79]/20' };
      case 'credit_card':
        return { icon: CreditCard, tintClass: 'bg-[#FDF1EE] text-[#B03A24] border border-[#E97962]/20' };
      case 'investment':
        return { icon: TrendingUp, tintClass: 'bg-[#F4F1FA] text-[#5B4896] border border-[#8B79C6]/25' };
      default:
        return { icon: Landmark, tintClass: 'bg-[#FAF8F3] text-[#20251F] border border-[#DDD7CB]' };
    }
  };

  // ════════════════════ STATE 1: LOADING STATE ════════════════════
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-10 h-10 rounded-full border-3 border-[#DDD7CB] border-t-[#D99A37] animate-spin mb-4" />
        <h2 className="text-base font-normal text-[#20251F]">Loading your accounts...</h2>
        <p className="text-xs text-[#6B7268] mt-1">Fetching current balances and account records.</p>
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
        <h2 className="text-lg font-normal text-[#20251F]">Could not load accounts</h2>
        <p className="text-xs text-[#6B7268] mt-1.5 mb-5 leading-relaxed">{error}</p>
        <button
          type="button"
          onClick={loadAccounts}
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
            Accounts
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7268] mt-0.5">
            Manage your bank accounts, savings vaults, and cash wallets.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingAccount(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#D99A37] hover:bg-[#C5882B] text-white text-xs font-medium rounded-[12px] transition-colors shadow-xs self-start sm:self-auto cursor-pointer active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Add account</span>
        </button>
      </div>

      {/* ── 2. Aggregate Balance Banner ── */}
      <div className="bg-white border border-[#DDD7CB] rounded-[18px] p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-[#6B7268]">
            {isBalanceSet ? 'Total Available Balance' : 'Net Cumulative Cash Flow'}
          </span>
          <div className="text-3xl sm:text-4xl font-normal text-[#20251F] tracking-tight mt-1 kf-tnum">
            {formatAmount(totalBalance ?? 0)}
          </div>
          {!isBalanceSet && (
            <div className="flex items-center gap-1.5 text-xs text-[#D99A37] mt-1.5">
              <HelpCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Some accounts have unset starting balances (Cash Flow tracking mode)</span>
            </div>
          )}
        </div>
        <div className="text-xs text-[#6B7268]">
          Aggregated across <strong className="text-[#20251F] font-semibold">{accounts.length}</strong> active account{accounts.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* ── 3. Accounts Grid ── */}
      {accounts.length === 0 ? (
        /* ════════════════ STATE 3: EMPTY ACCOUNTS STATE ════════════════ */
        <div className="bg-white border border-[#DDD7CB] rounded-[18px] p-12 text-center text-xs shadow-2xs space-y-3">
          <div className="w-12 h-12 mx-auto rounded-[14px] bg-[#F6F2E9] border border-[#DDD7CB]/80 flex items-center justify-center text-[#8E948B]">
            <Landmark className="w-6 h-6 stroke-[1.5]" aria-hidden="true" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-medium text-[#20251F]">No accounts registered yet</h3>
            <p className="text-[#6B7268]">
              Create your primary checking account, savings vault, or cash wallet to begin tracking balances.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingAccount(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#D99A37] hover:bg-[#C5882B] text-white text-xs font-medium rounded-[12px] transition-colors shadow-xs active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Create first account</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => {
            const { icon: IconComp, tintClass } = getAccountTheme(acc.account_type);
            const isSet = acc.is_balance_set !== false && acc.initial_balance !== null && acc.initial_balance !== undefined;

            return (
              <div
                key={acc.id}
                className="bg-white border border-[#DDD7CB] rounded-[18px] p-5 shadow-2xs flex flex-col justify-between hover:border-[#C4BEB1] hover:shadow-xs transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 ${tintClass}`}>
                        <IconComp className="w-5 h-5 stroke-[1.75]" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-medium text-[#20251F] truncate">{acc.name}</h3>
                        <span className="text-[11px] text-[#6B7268] capitalize">
                          {acc.account_type.replace('_', ' ')} · {acc.currency}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAccount(acc);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-[#6B7268] hover:text-[#20251F] hover:bg-[#F6F2E9] rounded-[8px] transition-colors"
                        title="Edit account"
                        aria-label="Edit account"
                      >
                        <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(acc.id, acc.name)}
                        className="p-1.5 text-[#8E948B] hover:text-[#E97962] hover:bg-[#FDF1EE] rounded-[8px] transition-colors"
                        title="Delete account"
                        aria-label="Delete account"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] text-[#6B7268]">
                        Current Balance
                      </span>
                      {!isSet && (
                        <span className="text-[10px] font-medium text-[#D99A37] bg-[#FBF4E8] px-1.5 py-0.5 rounded-[6px] border border-[#D99A37]/25">
                          Cash Flow
                        </span>
                      )}
                    </div>
                    <span className="text-2xl font-normal text-[#20251F] tracking-tight kf-tnum">
                      {formatAmount(acc.current_balance ?? 0)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3.5 mt-4 border-t border-[#DDD7CB]/60 text-xs">
                  <div>
                    <span className="text-[10px] text-[#8E948B] block">Total In</span>
                    <span className="font-medium text-[#4C9B79] kf-tnum">
                      +{formatAmount(acc.total_income)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8E948B] block">Total Out</span>
                    <span className="font-medium text-[#E97962] kf-tnum">
                      −{formatAmount(acc.total_expenses)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 4. Account Modal ── */}
      <AccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingAccount ? handleUpdate : handleCreate}
        initialData={editingAccount}
      />
    </div>
  );
};
