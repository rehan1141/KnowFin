import React, { createContext, useContext, useState } from 'react';

export type Currency = 'INR' | 'USD' | 'EUR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatAmount: (amount: number) => string;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem('preferred_currency') as Currency) || 'INR';
  });

  const setCurrency = (c: Currency) => {
    localStorage.setItem('preferred_currency', c);
    setCurrencyState(c);
  };

  const symbolMap: Record<Currency, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
  };

  const formatAmount = (amount: number): string => {
    const localeMap: Record<Currency, string> = {
      INR: 'en-IN',
      USD: 'en-US',
      EUR: 'de-DE',
    };
    return new Intl.NumberFormat(localeMap[currency], {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatAmount,
        symbol: symbolMap[currency],
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
