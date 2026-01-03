import React, {
  useEffect
} from 'react';
import {
  Trash2,
  Edit2,
  Search,
  Filter,
  Calendar,
  Repeat
} from 'lucide-react';
import {
  deleteExpense,
  fetchExpenses
} from '../../services/expenses';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { CATEGORIES } from '../../misc/constants';
import { AddExpenseModal } from './AddExpenseModal';
import { IncomeSource } from '../../misc/interfaces';
import { useCustomHook } from '../../misc/customHooks';
import { RecurringExpenses } from './RecurringExpenses';
import { getCurrentUser } from '../../services/settings-user';
import { getIncomeSources } from '../../services/incomeSources';
import { toast } from 'sonner';

export const ExpensesList: React.FC = () => {
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedSource,
    setSelectedSource,
    showFilters,
    setShowFilters,
    showAddModal,
    setShowAddModal,
    incomeSources,
    setIncomeSources,
    expenses,
    setExpenses,
    refreshKey,
    setRefreshKey
  } = useCustomHook();

  const [editingExpense, setEditingExpense] = React.useState<any | null>(null);

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || expense.category === selectedCategory;
    const matchesSource = selectedSource === 'All' ||  String(expense.income_source_id) === selectedSource;
    return matchesSearch && matchesCategory && matchesSource;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Food & Dining': '#FFB4B4',
      'Transportation': '#A8D5BA',
      'Shopping': '#FFD4A3',
      'Entertainment': '#B4A7D6',
      'Bills & Utilities': '#A3C4F3',
      'Healthcare': '#FFB6C1',
      'Education': '#C7CEEA',
      'Travel': '#B5EAD7',
      'Groceries': '#FFDAB9',
      'Other': '#D3D3D3',
      'Debt Payment': '#FFCCCB',
      'Loan Payment': '#c56968ff',
      'Rental Payment': '#ba7737ff',
    };
    return colors[category] || '#D3D3D3';
  };

  const currentUser = getCurrentUser();

  useEffect(() => {
    const fetchIncomeSources = async () => {
      const data = await getIncomeSources(currentUser.id);
      setIncomeSources(data as IncomeSource[]);
    };

    const fetchExpensesList = async () => {
      const data = await fetchExpenses(currentUser.id);
      const sorted = (data || []).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setExpenses(sorted);
    };

    fetchIncomeSources();
    fetchExpensesList();
  }, [refreshKey]);

  const expenseListContent = (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search expenses..."
            className="w-full pl-11 pr-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-6 py-3 bg-muted/50 rounded-xl border border-border/50 hover:bg-accent transition-colors flex items-center justify-center gap-2"
        >
          <Filter className="w-5 h-5" />
          Filters
        </button>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-muted/30 rounded-xl p-4 space-y-3"
        >
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 bg-background rounded-lg border border-border/50 focus:border-primary focus:outline-none transition-colors cursor-pointer"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Income Source</label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full px-4 py-2 bg-background rounded-lg border border-border/50 focus:border-primary focus:outline-none transition-colors cursor-pointer"
            >
              <option value="All">All Sources</option>
              {incomeSources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No expenses found</p>
          </div>
        ) : (
          filteredExpenses.map((expense, index) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-2xl p-4 shadow-sm border border-border/50 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: getCategoryColor(expense.category) + '40' }}
                >
                  <span className="text-2xl">
                    {expense.category === 'Food & Dining'
                      ? '🍽️'
                      : expense.category === 'Transportation'
                      ? '🚗'
                      : expense.category === 'Shopping'
                      ? '🛍️'
                      : expense.category === 'Entertainment'
                      ? '🎬'
                      : expense.category === 'Bills & Utilities'
                      ? '💡'
                      : expense.category === 'Healthcare'
                      ? '🏥'
                      : expense.category === 'Education'
                      ? '📚'
                      : expense.category === 'Travel'
                      ? '✈️'
                      : expense.category === 'Groceries'
                      ? '🛒'
                      : expense.category === 'Loan Payment'
                      ? '💸'
                      : expense.category === 'Debt Payment'
                      ? '🤝'
                      : expense.category === 'Rental Payment'
                      ? '🏠'
                      : '📌'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{expense.title}</h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span
                          className="inline-block px-2 py-1 rounded-lg text-xs"
                          style={{ backgroundColor: getCategoryColor(expense.category) + '40' }}
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
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-lg">
                        -{new Intl.NumberFormat('en-MY', {
                          style: 'currency',
                          currency: getCurrentUser().currency,
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(expense.amount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(expense.date), 'MMM dd, yyyy')}</span>
                      <span className="text-xs">
                        • {incomeSources.find((s) => s.id === expense.income_source_id)?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        onClick={() => {
                          setEditingExpense(expense);
                          setShowAddModal(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={async () => {
                          const result = await deleteExpense(expense);
                          if(result) {
                            toast.success('Expense deleted successfully.');
                            setExpenses((prev) => prev.filter((e) => e.id !== expense.id));
                          } else {
                            toast.error('Failed to delete expense.');
                          }
                        }}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto px-1">
      <div className="space-y-6">
        <RecurringExpenses expenses={expenses} />
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold">All Expenses</h2>
              <p className="text-muted-foreground">Total: {expenses.length} transactions</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#4F6B52] to-[#5B3E80] text-white rounded-xl hover:shadow-lg transition-all"
            >
              Add Expense
            </button>
          </div>
          
          {expenseListContent}
        </div>

        {showAddModal && (
          <AddExpenseModal
            isOpen={showAddModal}
            onClose={() => {
              setShowAddModal(false);
              setEditingExpense(null);
            }}
            onSuccess={() => {
              setRefreshKey(prev => prev + 1);
              setEditingExpense(null); 
            }}
            expenseToEdit={editingExpense}
          />
        )}
      </div>
    </div>
  )
};