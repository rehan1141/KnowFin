import { api } from './api';
import type { Category, CategoryCreate } from '../types';

export const categoryService = {
  list: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories/');
    return response.data;
  },

  create: async (data: CategoryCreate): Promise<Category> => {
    const response = await api.post<Category>('/categories/', data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
