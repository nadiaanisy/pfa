import {
  Edit,
  Trash2,
  History,
  Calendar,
  CheckCircle,
  X
} from 'lucide-react';
import {
  isPast,
  parseISO
} from 'date-fns';
import {
  motion,
  AnimatePresence
} from 'motion/react';
import {
  getDebtStatus,
  getStatusIcon,
  getStatusColor,
  formatCurrency,
  getPriorityColor
} from '../../../misc/utils';
import { DebtProgress } from './DebtProgress';

export const DebtCard = ({
  title,
  debt,
  currency,
  onEdit,
  onDelete,
  onPayment,
  onHistory,
  gradient,
  index,
  editingDebt,
  editFormProps
}: any) => {
  const isEditing = editingDebt === debt.id;
  const status = getDebtStatus(debt);
  const StatusIcon = getStatusIcon(status);
  const total = debt.total_amount;
  const remaining = typeof debt.remaining_amount === 'number' ? debt.remaining_amount : debt.total_amount;
  const paid = total - remaining;
  const percentage = Math.min((paid / total) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 rounded-xl border border-border/50 bg-muted/20"
    >
      <AnimatePresence mode="wait">
        {isEditing ? (
          <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              editFormProps.handleUpdateDebt(debt.id);
            }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{title === 'You Owe' ? 'Edit Debt' : 'Edit Loan'}</span>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={editFormProps.isUpdatingDebt}
                  className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                >
                  {editFormProps.isUpdatingDebt ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={editFormProps.cancelEdit}
                  className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Person Name</label>
                <input
                  type="text"
                  value={editFormProps.personName}
                   onChange={(e) => editFormProps.setPersonName(e.target.value)}
                  className="dark:text-black w-full px-3 py-2 bg-background rounded-lg border border-border/50 focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Total Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={editFormProps.totalAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    
                    // Allow empty input
                    if (value === "") {
                      editFormProps.setTotalAmount(value);
                      return;
                    }

                    // Regex: numbers with up to 2 decimal places
                    if (/^\d+(\.\d{0,2})?$/.test(value)) {
                      editFormProps.setTotalAmount(value);
                    }
                  }}
                  className="dark:text-black w-full px-3 py-2 bg-background rounded-lg border border-border/50 focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-muted-foreground mb-1">Description</label>
                <input
                  type="text"
                  value={editFormProps.description}
                  onChange={(e) => editFormProps.setDescription(e.target.value)}
                  className="dark:text-black w-full px-3 py-2 bg-background rounded-lg border border-border/50 focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Due Date</label>
                <input
                  type="date"
                  value={editFormProps.dueDate}
                  onChange={(e) => editFormProps.setDueDate(e.target.value)}
                  className="dark:text-black w-full px-3 py-2 bg-background rounded-lg border border-border/50 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Priority</label>
                <select
                  value={editFormProps.priority}
                  onChange={(e) => editFormProps.setPriority(e.target.value)}
                  className="dark:text-black w-full px-3 py-2 bg-background rounded-lg border border-border/50 focus:border-primary focus:outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </form>
          </>
        ) : (
          <motion.div
            key="view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <StatusIcon className="w-5 h-5" style={{ color: getStatusColor(getDebtStatus(debt)) }} />
                  <h4 className="font-medium">{debt.person_name}</h4>

                  {debt.priority && (
                    <span
                      className="px-2 py-0.5 text-xs rounded-full"
                      style={{
                        backgroundColor: `${getPriorityColor(debt.priority)}20`,
                        color: getPriorityColor(debt.priority)
                      }}
                    >
                      {debt.priority}
                    </span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-1">{debt.description}</p>

                {debt.due_date && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Due: {new Date(debt.due_date).toLocaleDateString()}
                    {isPast(parseISO(debt.due_date)) && status !== 'paid' && (
                      <span className="text-red-500 font-medium ml-1">
                        (Overdue)
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-1">
                <button
                  onClick={onHistory}
                  className="p-1.5 hover:bg-purple-500/10 rounded-lg group"
                  title="Payment History"
                >
                  <History className="w-4 h-4 text-muted-foreground group-hover:text-purple-500" />
                </button>

                <button
                  onClick={() => onEdit(debt)}
                  className="p-1.5 hover:bg-blue-500/10 rounded-lg group"
                  title="Edit"
                >
                  <Edit className="w-4 h-4 text-muted-foreground group-hover:text-blue-500" />
                </button>

                <button
                  onClick={onDelete}
                  className="p-1.5 hover:bg-red-500/10 rounded-lg group"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-red-500" />
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Paid: {formatCurrency(paid, currency)}
                </span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  Remaining: {formatCurrency(remaining, currency)}
                </span>
              </div>

              <DebtProgress percentage={percentage} gradient={gradient} />

              {status !== 'paid' && (
                <button
                  onClick={onPayment}
                  className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all text-sm"
                >
                  Record Payment
                </button>
              )}

              {status === 'paid' && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-2 mt-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Fully Paid! 🎉
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};