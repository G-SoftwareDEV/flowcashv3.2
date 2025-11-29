import { Transaction, TimeRange } from '../types';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const filterTransactionsByRange = (transactions: Transaction[], range: TimeRange, referenceDate: Date = new Date()): Transaction[] => {
  const now = referenceDate;
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return transactions.filter(t => {
    const tDate = new Date(t.date);
    
    switch (range) {
      case 'today':
        return tDate >= startOfDay && tDate < new Date(startOfDay.getTime() + 86400000);
      case '7days': {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        return tDate >= sevenDaysAgo && tDate <= now;
      }
      case '30days': {
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return tDate >= thirtyDaysAgo && tDate <= now;
      }
      case '1year': {
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        return tDate >= oneYearAgo && tDate <= now;
      }
      default:
        return true;
    }
  });
};

export const isSameDay = (d1: Date, d2: Date): boolean => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};
