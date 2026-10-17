import { api } from './api';

export interface ExchangeRatesData {
  base: string;
  rates: Record<string, number>;
  last_updated: string;
  source: string;
  is_stale: boolean;
}

export const exchangeRateService = {
  async getLatestRates(refresh = false): Promise<ExchangeRatesData> {
    const response = await api.get<ExchangeRatesData>('/exchange-rates/latest', {
      params: refresh ? { refresh: true } : undefined,
    });
    return response.data;
  },

  async forceRefresh(): Promise<ExchangeRatesData> {
    const response = await api.post<ExchangeRatesData>('/exchange-rates/refresh');
    return response.data;
  },
};
