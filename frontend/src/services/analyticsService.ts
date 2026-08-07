import { api } from './api';
import type {
  MonthlySummary,
  CategorySpendingResponse,
  BudgetStatusResponse,
} from '../types';

export const analyticsService = {
  getMonthlySummary: async (month: number, year: number): Promise<MonthlySummary> => {
    const response = await api.get<MonthlySummary>('/analytics/summary', {
      params: { month, year },
    });
    return response.data;
  },

  getByCategory: async (month: number, year: number): Promise<CategorySpendingResponse> => {
    const response = await api.get<CategorySpendingResponse>('/analytics/by-category', {
      params: { month, year },
    });
    return response.data;
  },

  getBudgetStatus: async (month: number, year: number): Promise<BudgetStatusResponse> => {
    const response = await api.get<BudgetStatusResponse>('/analytics/budget-status', {
      params: { month, year },
    });
    return response.data;
  },
};
