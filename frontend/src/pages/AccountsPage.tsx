import React, { useEffect, useState } from 'react';
import { Plus, Landmark, Wallet, PiggyBank, CreditCard, TrendingUp, Edit2, Trash2 } from 'lucide-react';
import { accountService } from '../services/accountService';
import { useCurrency } from '../contexts/CurrencyContext';
import { AccountModal } from '../components/accounts/AccountModal';
import type { Account, AccountCreate, AccountType } from '../types';

export const AccountsPage: React.FC = () => {
  const { formatAmount } = useCurrency();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const data = await accountService.list();
      setAccounts(data.accounts);
      setTotalBalance(Number(data.total_balance));
    } catch {
      // Handled
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
    if (confirm(`Delete account "${name}"? Associated transaction history will remain.`)) {
      await accountService.delete(id);
      await loadAccounts();
    }
  };

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'bank':
        return Landmark;
      case 'cash':
        return Wallet;
      case 'savings':
        return PiggyBank;
      case 'credit_card':
        return CreditCard;
      case 'investment':
        return TrendingUp;
      default:
        return Landmark;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#E8E6DF]">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-500">
            Accounts & Wallets
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mt-0.5">
            Accounts
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage your banks, cash wallets, and savings
          </p>
        </div>

        <button
          onClick={() => {
            setEditingAccount(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#164A3A] text-white text-xs font-bold rounded-lg hover:bg-[#12382c] transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Aggregate Balance Banner */}
      <div className="bg-white border border-[#E8E6DF] rounded-2xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Total Available Balance
          </span>
          <div className="text-3xl font-black text-neutral-900 tracking-tight mt-1">
            {formatAmount(totalBalance)}
          </div>
        </div>
        <div className="text-xs text-neutral-500">
          Aggregated across <strong>{accounts.length}</strong> active account{accounts.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Accounts Grid */}
      {isLoading ? (
        <div className="text-center py-24 text-neutral-400 text-xs">Loading accounts...</div>
      ) : accounts.length === 0 ? (
        <div className="bg-white border border-[#E8E6DF] rounded-2xl p-12 text-center text-neutral-500 text-xs">
          <p className="text-sm font-semibold text-neutral-800 mb-1">No accounts found</p>
          <p>Create your primary checking or cash wallet to begin tracking.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map((acc) => {
            const IconComp = getAccountIcon(acc.account_type);
            return (
              <div
                key={acc.id}
                className="bg-white border border-[#E8E6DF] rounded-2xl p-5 shadow-2xs flex flex-col justify-between hover:border-neutral-300 transition group"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-neutral-900">{acc.name}</h3>
                        <span className="text-[11px] text-neutral-500 capitalize">
                          {acc.account_type.replace('_', ' ')} · {acc.currency}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => {
                          setEditingAccount(acc);
                          setIsModalOpen(true);
                        }}
                        className="p-1 text-neutral-400 hover:text-neutral-700 rounded"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(acc.id, acc.name)}
                        className="p-1 text-neutral-400 hover:text-rose-600 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-[11px] text-neutral-500 font-medium block">
                      Current Balance
                    </span>
                    <span className="text-2xl font-black text-neutral-900 tracking-tight">
                      {formatAmount(acc.current_balance)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4 mt-4 border-t border-[#E8E6DF] text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Total In</span>
                    <span className="font-semibold text-emerald-700">
                      +{formatAmount(acc.total_income)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Total Out</span>
                    <span className="font-semibold text-neutral-800">
                      -{formatAmount(acc.total_expenses)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Account Modal */}
      <AccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingAccount ? handleUpdate : handleCreate}
        initialData={editingAccount}
      />
    </div>
  );
};
