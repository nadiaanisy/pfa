import {
  Trash2,
  Edit2,
  Calendar,
  Repeat
} from 'lucide-react';
import {
  formatCurrency,
  getCategoryMeta
} from '../../../misc/utils';
import { format } from 'date-fns';
import { motion } from 'motion/react';

export const ExpenseCard = ({
  expense,
  incomeSourceName,
  currency,
  onEdit,
  onDelete,
  index,
}: any) => {
  const meta = getCategoryMeta(expense.category);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card rounded-2xl p-4 shadow-sm border border-border/50 hover:shadow-md transition-all group"
    >
      <div className="flex gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: meta.color + '40' }}
        >
          <span className="text-2xl">{meta.icon}</span>
        </div>

        <div className="flex-1">
          <div className="flex justify-between">
            <div>
              <h4 className="font-medium truncate">{expense.title}</h4>

              <div className="flex gap-2 mt-1 flex-wrap">
                <span
                  className="px-2 py-1 rounded-lg text-xs"
                  style={{ backgroundColor: meta.color + '40' }}
                >
                  {expense.category}
                </span>

                {expense.is_recurring && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs">
                    <Repeat className="w-3 h-3" />
                    {expense.recurring_frequency}
                  </span>
                )}
              </div>
            </div>

            <p className="font-semibold text-lg">
              -{formatCurrency(expense.amount, currency)}
            </p>
          </div>

          <div className="flex justify-between mt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {format(new Date(expense.date), 'MMM dd, yyyy')}
              <span className="text-xs">• {incomeSourceName}</span>
            </div>

            <div className="flex gap-2 opacity-100">
              <button onClick={onEdit} className="p-2 hover:bg-muted rounded-lg">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={onDelete} className="p-2 hover:bg-destructive/10 rounded-lg">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
