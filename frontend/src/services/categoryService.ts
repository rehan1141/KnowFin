import { api } from './api';
import type { Category, CategoryCreate, CategoryUpdate } from '../types';

export const categoryService = {
  list: async (type?: 'expense' | 'income'): Promise<Category[]> => {
    const params = type ? { type } : {};
    const res = await api.get<Category[]>('/categories/', { params });
    return res.data;
  },

  create: async (data: CategoryCreate): Promise<Category> => {
    const res = await api.post<Category>('/categories/', data);
    return res.data;
  },

  update: async (id: number, data: CategoryUpdate): Promise<Category> => {
    const res = await api.put<Category>(`/categories/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
