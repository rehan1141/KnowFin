import { api } from './api';
import type { Account, AccountCreate, AccountUpdate, AccountListResponse } from '../types';

export const accountService = {
  list: async (): Promise<AccountListResponse> => {
    const res = await api.get<AccountListResponse>('/accounts/');
    return res.data;
  },

  getById: async (id: number): Promise<Account> => {
    const res = await api.get<Account>(`/accounts/${id}`);
    return res.data;
  },

  create: async (data: AccountCreate): Promise<Account> => {
    const res = await api.post<Account>('/accounts/', data);
    return res.data;
  },

  update: async (id: number, data: AccountUpdate): Promise<Account> => {
    const res = await api.put<Account>(`/accounts/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/accounts/${id}`);
  },
};
