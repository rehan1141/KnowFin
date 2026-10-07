import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Currency } from '../types';
import { formatCurrency, getCurrencySymbol } from '../utils/formatters';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatAmount: (amount: number) => string;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem('preferred_currency') as Currency) || 'EUR';
  });

  const setCurrency = useCallback((c: Currency) => {
    localStorage.setItem('preferred_currency', c);
    setCurrencyState(c);
  }, []);

  const formatAmount = useCallback(
    (amount: number): string => {
      return formatCurrency(amount, currency);
    },
    [currency]
  );

  const symbol = getCurrencySymbol(currency);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatAmount,
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
