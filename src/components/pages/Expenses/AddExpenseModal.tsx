import {
  motion,
  AnimatePresence
} from 'motion/react';
import {
  X,
  Plus,
  Calendar,
  Tag,
  FileText,
  Repeat,
  Pencil
} from 'lucide-react';
import { toast } from 'sonner';
import {
  addExpense,
  updateExpense
} from '../../../services/expenses';
import { format } from 'date-fns';
import {
  getIncomeSources,
  updateIncomeSourceBalance
} from '../../../services/incomeSources';
import React, { useEffect } from 'react'
import { CATEGORIES } from '../../../misc/constants';
import { IncomeSource } from '../../../misc/interfaces';
import { useCustomHook } from '../../../misc/customHooks';
import { getCurrentUser } from '../../../services/settings-user';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expenseToEdit?: any;
}
export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  expenseToEdit
}) => {
  const {
    title,
    setTitle,
    amount,
    setAmount,
    category,
    setCategory,
    date,
    setDate,
    incomeSourceId,
    setIncomeSourceId,
    isRecurring,
    setIsRecurring,
    recurringFrequency,
    setRecurringFrequency,
    notes,
    setNotes,
    incomeSources,
    setIncomeSources
  } = useCustomHook();

  const currentUser = getCurrentUser();

  /* -------------------- FETCH SOURCES -------------------- */
  useEffect(() => {
    const fetchIncomeSources = async () => {
      const data = await getIncomeSources(currentUser.id);
      setIncomeSources(data as IncomeSource[]);
    }
    fetchIncomeSources();
  }, []);

  /* -------------------- POPULATE EDIT -------------------- */
  useEffect(() => {
    if (expenseToEdit) {
      setTitle(expenseToEdit.title);
      setAmount(expenseToEdit.amount.toString());
      setCategory(expenseToEdit.category);
      setDate(expenseToEdit.date);
      setIncomeSourceId(expenseToEdit.income_source_id);
      setIsRecurring(expenseToEdit.is_recurring);
      setRecurringFrequency(expenseToEdit.recurring_frequency);
      setNotes(expenseToEdit.notes);
    }
  }, [expenseToEdit]);

  /* -------------------- RESET ON ADD -------------------- */
  useEffect(() => {
    if (isOpen && !expenseToEdit) {
      resetForm();
    }
  }, [isOpen, expenseToEdit]);

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !incomeSourceId) return;

    const newAmount = parseFloat(amount);

    /* ==================== EDIT ==================== */
    if (expenseToEdit) {
      const oldSourceId = expenseToEdit.income_source_id;
      const oldAmount = expenseToEdit.amount;
      const newSourceId = incomeSourceId;

      const updatedExpense = {
        ...expenseToEdit,
        title,
        amount: newAmount,
        category,
        date,
        income_source_id: newSourceId,
        is_recurring: isRecurring,
        recurring_frequency: recurringFrequency,
        notes
      };

      const result = await updateExpense(updatedExpense);
      if (!result) {
        toast.error('Failed to update expense.');
        return;
      }

      /* -------- BALANCE LOGIC -------- */
      // Source changed
      if (oldSourceId !== newSourceId) {
        const restoredOld = await updateIncomeSourceBalance(
          oldSourceId,
          -oldAmount
        );

        const deductedNew = await updateIncomeSourceBalance(
          newSourceId,
          newAmount
        );

        setIncomeSources(prev =>
          prev.map(src => {
            if (src.id === restoredOld?.id) return restoredOld;
            if (src.id === deductedNew?.id) return deductedNew;
            return src;
          })
        );
      }
      // Same source, amount changed
      else if (oldAmount !== newAmount) {
        const diff = newAmount - oldAmount;

        const updatedSource = await updateIncomeSourceBalance(
          newSourceId,
          diff
        );

        if (updatedSource) {
          setIncomeSources(prev =>
            prev.map(src =>
              src.id === updatedSource.id ? updatedSource : src
            )
          );
        }
      }

      toast.success('Expense updated successfully.');
      resetForm();
      onSuccess();
      onClose();
      return;
    }

    /* ==================== ADD ==================== */
    const result = await addExpense({
      user_id: currentUser.id,
      title,
      amount: newAmount,
      category,
      date,
      income_source_id: incomeSourceId,
      is_recurring: isRecurring,
      recurring_frequency: recurringFrequency,
      notes
    });

    if (!result) {
      toast.error('Failed to add expense.');
      return;
    }

    const updatedSource = await updateIncomeSourceBalance(
      incomeSourceId,
      newAmount
    );

    if (updatedSource) {
      setIncomeSources(prev =>
        prev.map(src =>
          src.id === updatedSource.id ? updatedSource : src
        )
      );
    }

    toast.success('Expense added successfully.');
    resetForm();
    onSuccess();
    onClose();
  };

  /* -------------------- RESET FORM -------------------- */
  const resetForm = () => {
    setTitle('');
    setAmount('');
    setCategory(CATEGORIES[0]);
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setIncomeSourceId('');
    setIsRecurring(false);
    setRecurringFrequency(null);
    setNotes('');
  };

  /* -------------------- UI -------------------- */
  return (
     <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:left-[35%] md:-translate-x-1/2 md:-translate-y-1/2 md:justify-center md:w-full md:max-w-lg bg-card rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <h2 className="text-xl font-semibold">
                {expenseToEdit ? 'Edit Expense' : 'Add New Expense'}
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-muted hover:bg-accent flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto"
            >
              {/* Title */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Title
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none"
                    placeholder="e.g. Grocery shopping"
                    required
                  />
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Amount
                </label>
                <div className="relative">
                  {/* <Sign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /> */}
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*\.?\d{0,2}$/.test(value)) {
                        setAmount(value);
                      }
                    }}
                    className="w-full pl-11 pr-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Category
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-muted/50 rounded-xl border border-border/50 appearance-none cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-muted/50 rounded-xl border border-border/50"
                    required
                  />
                </div>
              </div>

              {/* Income Source */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Income Source</label>
                <select
                  value={incomeSourceId}
                  onChange={(e) => setIncomeSourceId(e.target.value)}
                  className="w-full px-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled hidden>Select an Income Source</option>
                  {incomeSources.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.name} (Balance: {new Intl.NumberFormat('en-MY', {
                        style: 'currency',
                        currency: getCurrentUser().currency,
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(source.balance)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Recurring */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-muted-foreground" />
                  Recurring Expense
                </span>
              </div>

              {isRecurring && (
                <select
                  value={recurringFrequency ?? ''}
                  onChange={(e) =>
                    setRecurringFrequency(e.target.value as any)
                  }
                  className="w-full px-4 py-3 bg-muted/50 rounded-xl border border-border/50"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              )}

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors resize-none"
                  rows={3}
                  placeholder="Add any additional details..."
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#4F6B52] to-[#5B3E80] text-white rounded-xl hover:shadow-lg flex items-center justify-center gap-2"
              >
                {expenseToEdit ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {expenseToEdit ? "Update Expense" : "Add Expense"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};