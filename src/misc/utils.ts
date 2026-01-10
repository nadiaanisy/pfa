import {
  useState,
  useMemo
} from 'react';
import {
  isPast,
  parseISO
} from 'date-fns';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Coins
} from 'lucide-react';

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
    'Bills & Utilities': { icon: '💡', color: '#A3C4F3' },
    'Debt Payment'     : { icon: '🤝', color: '#FFCCCB' },
    'Education'        : { icon: '📚', color: '#C7CEEA' },
    'Entertainment'    : { icon: '🎬', color: '#B4A7D6' },
    'Food & Dining'    : { icon: '🍽️', color: '#FFB4B4' },
    'Groceries'        : { icon: '🛒', color: '#FFDAB9' },
    'Healthcare'       : { icon: '🏥', color: '#FFB6C1' },
    'Investment'       : { icon: '📈', color: '#A2D5AB' },
    'Loan Payment'     : { icon: '💸', color: '#c56968ff' },
    'Other'            : { icon: '📌', color: '#D3D3D3' },
    'Saving'           : { icon: '💰', color: '#9ee5a0ff' },
    'Shopping'         : { icon: '🛍️', color: '#FFD4A3' },
    'Rental Payment'   : { icon: '🏠', color: '#ba7737ff' },
    'Transportation'   : { icon: '🚗', color: '#A8D5BA' },
    'Travel'           : { icon: '✈️', color: '#B5EAD7' },
  };

  return map[category] || { icon: '📌', color: '#D3D3D3' };
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid': return '#A8D5BA';
    case 'partial': return '#FFD93D';
    case 'overdue': return '#FF6B6B';
    default: return '#B4A7D6';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'paid': return CheckCircle;
    case 'partial': return Clock;
    case 'overdue': return AlertCircle;
    default: return Coins;
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return '#FF6B6B';
    case 'medium': return '#FFD93D';
    case 'low': return '#A8D5BA';
    default: return '#B4A7D6';
  }
};

export const getDebtStatus = (debt: any) => {
  const remaining = typeof debt.remaining_amount === 'number' ? debt.remaining_amount : debt.total_amount;
  // Paid if no remaining amount
  if (remaining <= 0) return 'paid';

  // Overdue if past due date and not paid
  if (
    debt.due_date &&
    isPast(parseISO(debt.due_date)) &&
    debt.status !== 'paid'
  ) {
    return 'overdue';
  }

  if ((debt.payments?.length ?? 0) > 0 && remaining > 0) {
    return 'partial';
  }

  return 'active';
};