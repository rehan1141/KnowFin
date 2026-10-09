import type { Currency } from '../types';

export const formatCurrency = (
  amount: number | string | null | undefined,
  currency: Currency = 'EUR'
): string => {
  let num: number;
  if (typeof amount === 'number') {
    num = amount;
  } else if (typeof amount === 'string') {
    num = parseFloat(amount.replace(/[^0-9.-]/g, ''));
  } else {
    num = 0;
  }
  const safeAmount = Number.isFinite(num) ? num : 0;
  const localeMap: Record<Currency, string> = {
    EUR: 'de-DE',
    USD: 'en-US',
    INR: 'en-IN',
  };

  return new Intl.NumberFormat(localeMap[currency] || 'de-DE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
};

export const getCurrencySymbol = (currency: Currency): string => {
  const symbolMap: Record<Currency, string> = {
    EUR: '€',
    USD: '$',
    INR: '₹',
  };
  return symbolMap[currency] || '€';
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const formatShortDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const formatMonthYear = (month: number, year: number): string => {
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);
};
