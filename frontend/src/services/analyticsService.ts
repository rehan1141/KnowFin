import { api } from './api';
import type {
  MonthlySummary,
  CategorySpendingResponse,
  BudgetStatusResponse,
  CashFlowResponse,
} from '../types';

export const analyticsService = {
  getMonthlySummary: async (month: number, year: number): Promise<MonthlySummary> => {
    const res = await api.get<MonthlySummary>('/analytics/summary', {
      params: { month, year },
    });
    return res.data;
  },

  getByCategory: async (month: number, year: number): Promise<CategorySpendingResponse> => {
    const res = await api.get<CategorySpendingResponse>('/analytics/by-category', {
      params: { month, year },
    });
    return res.data;
  },

  getBudgetStatus: async (month: number, year: number): Promise<BudgetStatusResponse> => {
    const res = await api.get<BudgetStatusResponse>('/analytics/budget-status', {
      params: { month, year },
    });
    return res.data;
  },

  getCashFlow: async (month: number, year: number): Promise<CashFlowResponse> => {
    const res = await api.get<CashFlowResponse>('/analytics/cash-flow', {
      params: { month, year },
    });
    return res.data;
  },
};
