import { api } from './api';
import type {
  Expense,
  ExpenseCreate,
  ExpenseUpdate,
  ExpenseFilterParams,
  PaginatedExpenses,
} from '../types';

export const expenseService = {
  list: async (params?: ExpenseFilterParams): Promise<PaginatedExpenses> => {
    const res = await api.get<PaginatedExpenses>('/expenses/', { params });
    return res.data;
  },

  getById: async (id: number): Promise<Expense> => {
    const res = await api.get<Expense>(`/expenses/${id}`);
    return res.data;
  },

  create: async (data: ExpenseCreate): Promise<Expense> => {
    const res = await api.post<Expense>('/expenses/', data);
    return res.data;
  },

  update: async (id: number, data: ExpenseUpdate): Promise<Expense> => {
    const res = await api.put<Expense>(`/expenses/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },
};
