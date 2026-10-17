import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Currency } from '../types';
import { formatCurrency, getCurrencySymbol } from '../utils/formatters';
import { exchangeRateService } from '../services/exchangeRateService';

export interface RateStatus {
  isLoading: boolean;
  isStale: boolean;
  lastUpdated: string | null;
  source: string | null;
  error: string | null;
}

const DEFAULT_RATES: Record<Currency, number> = {
  EUR: 1.0,
  USD: 1.085,
  INR: 90.5,
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatAmount: (amount: number | string | null | undefined, options?: { skipConversion?: boolean }) => string;
  convertAmount: (amountInEur: number | string | null | undefined, targetCurrency?: Currency) => number;
  convertInputToEur: (amountInCurrentCurrency: number | string, inputCurrency?: Currency) => number;
  rates: Record<Currency, number>;
  rateStatus: RateStatus;
  refreshRates: () => Promise<void>;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

function roundToTwoDecimals(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem('preferred_currency') as Currency) || 'EUR';
  });

  const [rates, setRates] = useState<Record<Currency, number>>(() => {
    try {
      const saved = localStorage.getItem('knowfin_exchange_rates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.EUR && parsed.USD && parsed.INR) {
          return parsed;
        }
      }
    } catch {
      // Ignore
    }
    return DEFAULT_RATES;
  });

  const [rateStatus, setRateStatus] = useState<RateStatus>(() => {
    const savedMeta = localStorage.getItem('knowfin_exchange_rates_meta');
    if (savedMeta) {
      try {
        const parsed = JSON.parse(savedMeta);
        return {
          isLoading: false,
          isStale: parsed.isStale ?? false,
          lastUpdated: parsed.lastUpdated ?? null,
          source: parsed.source ?? 'Cached rates',
          error: null,
        };
      } catch {
        // Ignore
      }
    }
    return {
      isLoading: false,
      isStale: false,
      lastUpdated: null,
      source: null,
      error: null,
    };
  });

  const fetchRates = useCallback(async (force = false) => {
    setRateStatus((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = force
        ? await exchangeRateService.forceRefresh()
        : await exchangeRateService.getLatestRates();

      const newRates: Record<Currency, number> = {
        EUR: 1.0,
        USD: data.rates.USD || DEFAULT_RATES.USD,
        INR: data.rates.INR || DEFAULT_RATES.INR,
      };

      setRates(newRates);
      setRateStatus({
        isLoading: false,
        isStale: data.is_stale,
        lastUpdated: data.last_updated,
        source: data.source,
        error: data.is_stale ? 'Using retained rates; exchange provider temporarily unreachable.' : null,
      });

      localStorage.setItem('knowfin_exchange_rates', JSON.stringify(newRates));
      localStorage.setItem(
        'knowfin_exchange_rates_meta',
        JSON.stringify({
          lastUpdated: data.last_updated,
          source: data.source,
          isStale: data.is_stale,
        })
      );
    } catch {
      setRateStatus((prev) => ({
        ...prev,
        isLoading: false,
        isStale: true,
        error: 'Unable to reach exchange rate service. Showing latest known rates.',
      }));
    }
  }, []);

  useEffect(() => {
    fetchRates(false);
  }, [fetchRates]);

  const setCurrency = useCallback((c: Currency) => {
    localStorage.setItem('preferred_currency', c);
    setCurrencyState(c);
  }, []);

  const convertAmount = useCallback(
    (amountInEur: number | string | null | undefined, targetCurrency?: Currency): number => {
      if (amountInEur === null || amountInEur === undefined || amountInEur === '') {
        return 0;
      }
      const num = typeof amountInEur === 'number' ? amountInEur : parseFloat(String(amountInEur).replace(/[^0-9.-]/g, ''));
      if (!Number.isFinite(num)) {
        return 0;
      }

      const target = targetCurrency || currency;
      if (target === 'EUR') {
        return roundToTwoDecimals(num);
      }

      const rate = rates[target] || DEFAULT_RATES[target] || 1.0;
      return roundToTwoDecimals(num * rate);
    },
    [currency, rates]
  );

  const convertInputToEur = useCallback(
    (amountInCurrentCurrency: number | string, inputCurrency?: Currency): number => {
      const num =
        typeof amountInCurrentCurrency === 'number'
          ? amountInCurrentCurrency
          : parseFloat(String(amountInCurrentCurrency).replace(/[^0-9.-]/g, ''));
      if (!Number.isFinite(num)) {
        return 0;
      }

      const current = inputCurrency || currency;
      if (current === 'EUR') {
        return roundToTwoDecimals(num);
      }

      const rate = rates[current] || DEFAULT_RATES[current] || 1.0;
      if (rate <= 0) return roundToTwoDecimals(num);
      return roundToTwoDecimals(num / rate);
    },
    [currency, rates]
  );

  const formatAmount = useCallback(
    (
      amountInEur: number | string | null | undefined,
      options?: { skipConversion?: boolean }
    ): string => {
      if (options?.skipConversion) {
        return formatCurrency(amountInEur, currency);
      }
      const converted = convertAmount(amountInEur, currency);
      return formatCurrency(converted, currency);
    },
    [currency, convertAmount]
  );

  const refreshRates = useCallback(async () => {
    await fetchRates(true);
  }, [fetchRates]);

  const symbol = getCurrencySymbol(currency);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatAmount,
        convertAmount,
        convertInputToEur,
        rates,
        rateStatus,
        refreshRates,
        symbol,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
