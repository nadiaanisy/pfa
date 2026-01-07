import { useState, useMemo } from 'react';

export const usePagination = <T,>(items: T[], pageSize = 6) => {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(items.length / pageSize);

  const paginated = useMemo(() => {
    return items.slice((page - 1) * pageSize, page * pageSize);
  }, [items, page, pageSize]);

  return { page, setPage, totalPages, paginated };
};

export const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }
).format(value);

export const getCategoryMeta = (category: string) => {
  const map: Record<string, { icon: string; color: string }> = {
    'Food & Dining'    : { icon: '🍽️', color: '#FFB4B4' },
    'Transportation'   : { icon: '🚗', color: '#A8D5BA' },
    'Shopping'         : { icon: '🛍️', color: '#FFD4A3' },
    'Entertainment'    : { icon: '🎬', color: '#B4A7D6' },
    'Bills & Utilities': { icon: '💡', color: '#A3C4F3' },
    'Healthcare'       : { icon: '🏥', color: '#FFB6C1' },
    'Education'        : { icon: '📚', color: '#C7CEEA' },
    'Travel'           : { icon: '✈️', color: '#B5EAD7' },
    'Groceries'        : { icon: '🛒', color: '#FFDAB9' },
    'Loan Payment'     : { icon: '💸', color: '#c56968ff' },
    'Debt Payment'     : { icon: '🤝', color: '#FFCCCB' },
    'Rental Payment'   : { icon: '🏠', color: '#ba7737ff' },
    'Saving'           : { icon: '💰', color: '#9ee5a0ff' },
  };

  return map[category] || { icon: '📌', color: '#D3D3D3' };
};
