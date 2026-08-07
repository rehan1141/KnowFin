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
    const response = await api.get<PaginatedExpenses>('/expenses/', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Expense> => {
    const response = await api.get<Expense>(`/expenses/${id}`);
    return response.data;
  },

  create: async (data: ExpenseCreate): Promise<Expense> => {
    const response = await api.post<Expense>('/expenses/', data);
    return response.data;
  },

  update: async (id: number, data: ExpenseUpdate): Promise<Expense> => {
    const response = await api.put<Expense>(`/expenses/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },
};
