import {
  Repeat,
  Calendar
} from 'lucide-react';
import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { formatCurrency } from '../../../misc/utils';

interface RecurringExpensesProps {
  expenses: any[];
  currency: string;
  loading?: boolean;
}
export const RecurringExpenses: React.FC<RecurringExpensesProps> = ({
  expenses,
  currency,
  loading = false
}) => {

  const recurringExpenses = useMemo(
    () => expenses.filter(e => e.is_recurring),
    [expenses]
  );

  const totalRecurring = useMemo(
    () => recurringExpenses.reduce((sum, e) => sum + e.amount, 0),
    [recurringExpenses]
  );

  if (loading) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border/50 animate-pulse">
        <div className="h-5 w-48 bg-muted rounded mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-sm border border-border/50"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Repeat className="w-5 h-5 text-primary " />
          <h3 className="text-lg font-semibold">Recurring Expenses</h3>
        </div>

        <div className="text-right">
          <p className="text-sm text-muted-foreground">Monthly Total</p>
          <p className="text-xl font-semibold text-primary">{formatCurrency(totalRecurring, currency)}</p>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-3">
        {recurringExpenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No recurring expenses set up yet.</div>
        ) : (
          recurringExpenses.map((expense, index) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-aliceblue rounded-xl p-4 dark:text-black"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{expense.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="capitalize">{expense.recurring_frequency}</span>
                    <span>•</span>
                    <span>{expense.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-lg font-semibold">
                    <span>{formatCurrency(expense.amount, currency)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}

        {/* Tip */}
        {recurringExpenses.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                💡 Your recurring expenses total{' '}
                <strong>{formatCurrency(totalRecurring, currency)}</strong>
                {' '}per month. Review regularly to optimize your spending.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};