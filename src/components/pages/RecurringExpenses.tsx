import {
  Repeat,
  Calendar,
  DollarSign
} from 'lucide-react';
import React from 'react';
import { motion } from 'motion/react';
import { getCurrentUser } from '../../services/settings-user';

interface RecurringExpensesProps {
  expenses: any[];
}
export const RecurringExpenses: React.FC<RecurringExpensesProps> = ({ expenses }) => {
  const recurringExpenses = expenses.filter(expense => expense.is_recurring);
  const totalRecurring = recurringExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-sm border border-border/50"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Repeat className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Recurring Expenses</h3>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-xl font-semibold text-primary">
            {new Intl.NumberFormat('en-MY', {
              style: 'currency',
              currency: getCurrentUser().currency,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(totalRecurring)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {recurringExpenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No recurring expenses set up yet.</p>
          </div>
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
                    <span>
                      {new Intl.NumberFormat('en-MY', {
                        style: 'currency',
                        currency: getCurrentUser().currency,
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(expense.amount)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
          
        )}

        {recurringExpenses.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                💡 Your recurring expenses total {new Intl.NumberFormat('en-MY', {
                    style: 'currency',
                    currency: getCurrentUser().currency,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(totalRecurring)}/month. Review regularly to optimize your spending.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};