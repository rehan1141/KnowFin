import { api } from './api';
import type {
  RecurringTransaction,
  RecurringTransactionCreate,
  RecurringTransactionUpdate,
  UpcomingSummaryResponse,
} from '../types';

export const recurringService = {
  list: async (): Promise<RecurringTransaction[]> => {
    const res = await api.get<RecurringTransaction[]>('/recurring/');
    return res.data;
  },

  getUpcoming: async (days: number = 30): Promise<UpcomingSummaryResponse> => {
    const res = await api.get<UpcomingSummaryResponse>(`/recurring/upcoming?days=${days}`);
    return res.data;
  },

  create: async (data: RecurringTransactionCreate): Promise<RecurringTransaction> => {
    const res = await api.post<RecurringTransaction>('/recurring/', data);
    return res.data;
  },

  update: async (id: number, data: RecurringTransactionUpdate): Promise<RecurringTransaction> => {
    const res = await api.put<RecurringTransaction>(`/recurring/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/recurring/${id}`);
  },
};
