import { api } from './api';
import type { TransferCreate, TransferResponse } from '../types';

export const transferService = {
  createTransfer: async (data: TransferCreate): Promise<TransferResponse> => {
    const response = await api.post<TransferResponse>('/transfers/', data);
    return response.data;
  },
};
