export interface SignupPayload {
  full_name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface AuthContextType {
  userEmail: string | null;
  login: (email: string) => void;
  logout: () => void;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  password: string;
  avatar_url?: any;
  currency?: string;
  last_login?: string;
  loginHistory?: LoginHistoryItem[];
}

export interface LoginHistoryItem {
  login_time: string;
}

export interface IncomeSource {
  id: string;
  name: string;
  type: 'salary' | 'rental' | 'loan' | 'dividend' | 'other';
  amount: number;
  balance: number;
  color: string;
  purposeMonth: string;
  created_at?: any;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  income_source_id: string;
  is_recurring?: boolean;
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  notes?: string;
}

export interface DebtPayment {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Debt {
  id: string;
  type: 'owe' | 'owed';
  personName: string;
  description: string;

  totalAmount: number;
  remainingAmount: number;

  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  status: 'active' | 'partial' | 'paid' | 'overdue';

  payments: DebtPayment[];
  created_at: string;
}

/*---HAVENT FINALIZED---*/
export interface Budget {
  id: string;
  category: string;
  limit: number;
  period: 'weekly' | 'monthly' | 'yearly';
}
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
}