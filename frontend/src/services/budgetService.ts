import { api } from './api';
import type { Budget, BudgetCreate } from '../types';

export const budgetService = {
  list: async (month?: number, year?: number): Promise<Budget[]> => {
    const response = await api.get<Budget[]>('/budgets/', {
      params: { month, year },
    });
    return response.data;
  },

  createOrUpdate: async (data: BudgetCreate): Promise<Budget> => {
    const response = await api.post<Budget>('/budgets/', data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/budgets/${id}`);
  },
};
